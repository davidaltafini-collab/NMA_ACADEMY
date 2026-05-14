<?php

namespace App\Services;

use App\Models\CourseVideo;
use App\Models\User;
use App\Models\UserSession;
use App\Models\VideoAccessLog;
use App\Models\VideoWatchSession;
use Illuminate\Http\Request;

class WatchSessionService
{
    // A session with no heartbeat (or an old one) within this window is considered stale.
    private const STALE_SECONDS = 60;

    public function __construct(private readonly VideoProgressService $progress) {}

    // ─── Stale-session cleanup ────────────────────────────────────────────────

    /**
     * Marks every active session for this user that has not received a heartbeat
     * within STALE_SECONDS as inactive. Called before starting a new session so
     * the conflict check only sees genuinely live sessions.
     *
     * Returns the number of sessions ended.
     */
    public function endStaleSessions(User $user): int
    {
        $cutoff = now()->subSeconds(self::STALE_SECONDS);

        return VideoWatchSession::where('user_id', $user->id)
            ->where('is_active', true)
            ->where(function ($q) use ($cutoff) {
                $q->where('last_heartbeat_at', '<', $cutoff)
                  ->orWhere(function ($q2) use ($cutoff) {
                      $q2->whereNull('last_heartbeat_at')
                         ->where('started_at', '<', $cutoff);
                  });
            })
            ->update([
                'is_active'    => false,
                'ended_at'     => now(),
                'ended_reason' => 'stale_timeout',
            ]);
    }

    // ─── Active-session lookup ────────────────────────────────────────────────

    /**
     * Returns the most-recent active (non-stale) watch session for a user, if any.
     * Always call endStaleSessions() first so stale rows are already gone.
     */
    public function findActiveSession(User $user): ?VideoWatchSession
    {
        return VideoWatchSession::where('user_id', $user->id)
            ->where('is_active', true)
            ->latest('started_at')
            ->first();
    }

    // ─── Session lifecycle ────────────────────────────────────────────────────

    /**
     * Creates and persists a new watch session row.
     */
    public function createSession(
        User $user,
        CourseVideo $video,
        UserSession $userSession,
        Request $request,
    ): VideoWatchSession {
        return VideoWatchSession::create([
            'user_id'           => $user->id,
            'course_id'         => $video->course_id,
            'video_id'          => $video->id,
            'user_session_id'   => $userSession->id,
            'started_at'        => now(),
            'last_heartbeat_at' => now(),
            'is_active'         => true,
            'ip_address'        => $request->ip(),
            'user_agent'        => $request->userAgent(),
        ]);
    }

    /**
     * Marks a session as inactive with a given reason.
     */
    public function endSession(VideoWatchSession $session, string $reason): void
    {
        $session->update([
            'is_active'    => false,
            'ended_at'     => now(),
            'ended_reason' => $reason,
        ]);
    }

    // ─── Ownership helpers ────────────────────────────────────────────────────

    /**
     * Fetch an active watch session that belongs to this user and the given video.
     * Returns null if not found, not owned by the user, or no longer active.
     */
    public function resolveSession(int $watchSessionId, User $user, CourseVideo $video): ?VideoWatchSession
    {
        return VideoWatchSession::where('id', $watchSessionId)
            ->where('user_id', $user->id)
            ->where('video_id', $video->id)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Returns true if the watch session was created by the same login session
     * (i.e., the same device/token that is making this request).
     */
    public function belongsToCurrentDevice(VideoWatchSession $watchSession, UserSession $currentUserSession): bool
    {
        return $watchSession->user_session_id === $currentUserSession->id;
    }

    // ─── Optional progress update ─────────────────────────────────────────────

    /**
     * Saves a progress snapshot when the caller provides enough data.
     * Used by heartbeat and end to avoid duplicating progress logic.
     */
    public function maybeSaveProgress(
        User $user,
        CourseVideo $video,
        ?int $currentTime,
        ?int $duration = null,
    ): void {
        if ($currentTime === null) {
            return;
        }

        // Fall back to the video's own duration_seconds if caller did not send one
        $resolved = $duration ?? $video->duration_seconds;

        if ($resolved === null || $resolved < 1) {
            return;
        }

        $this->progress->saveProgress($user, $video, [
            'current_time_seconds' => $currentTime,
            'duration_seconds'     => $resolved,
        ]);
    }

    // ─── Access log ───────────────────────────────────────────────────────────

    /**
     * Appends a row to video_access_logs.
     * Failures are silently swallowed — logging must never break the main flow.
     */
    public function log(
        CourseVideo $video,
        User $user,
        UserSession $userSession,
        string $action,
        ?int $positionSeconds = null,
        array $metadata = [],
    ): void {
        try {
            VideoAccessLog::create([
                'user_id'          => $user->id,
                'course_id'        => $video->course_id,
                'video_id'         => $video->id,
                'user_session_id'  => $userSession->id,
                'action'           => $action,
                'position_seconds' => $positionSeconds,
                'metadata'         => $metadata ?: null,
                'ip_address'       => request()->ip(),
                'user_agent'       => request()->userAgent(),
            ]);
        } catch (\Throwable) {
            // Log table is best-effort; never fail the user-facing response
        }
    }
}
