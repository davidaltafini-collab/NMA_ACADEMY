import { apiGet, apiPost, ApiError } from "../lib/apiClient";

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface VideoPlaybackData {
  provider: "cloudflare_stream";
  type: "development" | "signed";
  url: string | null;
  expires_at: string | null;
}

export interface VideoPlaybackProgress {
  last_position_seconds: number;
  progress_percent: number;
  is_completed: boolean;
  last_watched_at: string | null;
}

export interface VideoPlaybackAccess {
  is_free_preview: boolean;
  user_has_course_access: boolean;
  requires_purchase: boolean;
}

export interface VideoPlaybackResponse {
  success: boolean;
  message: string;
  data: {
    video: {
      id: number;
      title: string;
      duration_seconds: number | null;
      thumbnail_url: string | null;
      cloudflare_video_uid: string | null;
    };
    playback: VideoPlaybackData;
    access: VideoPlaybackAccess;
    progress: VideoPlaybackProgress | null;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const videoPlaybackService = {
  /**
   * GET /api/videos/{videoId}/playback
   *
   * Works for both authenticated and unauthenticated users.
   * - Free preview videos: accessible without a token; progress included if logged in.
   * - Paid videos: requires an active Bearer token + course access.
   *
   * Throws ApiError with status 401 if token is required but missing.
   * Throws ApiError with status 403 if token is present but no course access.
   */
  getVideoPlayback: async (videoId: number): Promise<VideoPlaybackResponse> => {
    return apiGet<VideoPlaybackResponse>(`/videos/${videoId}/playback`);
  },

  /**
   * Returns true if the playback token/URL is still valid.
   * Uses a 30-second safety margin to avoid using a token that expires mid-request.
   */
  isPlaybackExpired: (playback: VideoPlaybackData): boolean => {
    if (playback.type === "development" || playback.expires_at === null) {
      return false;
    }
    const expiresMs = new Date(playback.expires_at).getTime();
    return Date.now() >= expiresMs - 30_000;
  },

  /**
   * POST /api/user/videos/{videoId}/event
   *
   * Logs a player lifecycle event to video_access_logs.
   * Fire-and-forget — callers must catch errors themselves.
   * Requires an active Sanctum token; skip the call for unauthenticated users.
   */
  logEvent: async (
    videoId: number,
    data: {
      action: "play" | "pause" | "seek" | "complete" | "error" | "visibility_hidden" | "right_click_blocked" | "shortcut_blocked";
      position_seconds?: number;
      metadata?: Record<string, unknown>;
    },
  ): Promise<void> => {
    await apiPost<{ success: boolean }>(`/user/videos/${videoId}/event`, data);
  },

  /**
   * POST /api/user/videos/{videoId}/progress
   *
   * Saves or updates watch progress for a video. Requires an active Sanctum token.
   * progress_percent and is_completed are computed server-side from the provided values.
   */
  saveProgress: async (
    videoId: number,
    data: {
      current_time_seconds: number;
      duration_seconds: number;
      watched_seconds?: number;
      is_completed?: boolean;
    },
  ): Promise<VideoPlaybackProgress> => {
    interface SaveProgressResponse {
      success: boolean;
      message: string;
      data: {
        progress: {
          video_id: number;
          last_position_seconds: number;
          duration_seconds: number;
          watched_seconds: number;
          progress_percent: number;
          is_completed: boolean;
          completed_at: string | null;
          last_watched_at: string | null;
        };
      };
    }
    const res = await apiPost<SaveProgressResponse>(`/user/videos/${videoId}/progress`, data);
    return {
      last_position_seconds: res.data.progress.last_position_seconds,
      progress_percent:      res.data.progress.progress_percent,
      is_completed:          res.data.progress.is_completed,
      last_watched_at:       res.data.progress.last_watched_at,
    };
  },
};
