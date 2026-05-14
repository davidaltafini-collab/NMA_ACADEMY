<?php

namespace App\Http\Controllers\Api\Course;

use App\Http\Controllers\Controller;
use App\Models\CourseVideo;
use App\Models\UserVideoProgress;
use App\Services\CloudflareStreamService;
use App\Services\CourseAccessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * GET /api/videos/{video}/playback
 *
 * Optionally authenticated (no auth middleware on this route).
 * Sanctum resolves the Bearer token when present; $request->user('sanctum') returns
 * null for unauthenticated requests without throwing a 401 automatically.
 *
 * Access rules:
 *   Free preview video  → anyone may request playback data.
 *                         Authenticated users also receive progress/resume data.
 *   Paid video          → requires a valid Sanctum token (401 if absent)
 *                         AND active course access (403 if missing).
 */
class VideoPlaybackController extends Controller
{
    public function __construct(
        private readonly CloudflareStreamService $cloudflare,
        private readonly CourseAccessService     $access,
    ) {}

    // ─── GET /api/videos/{video}/playback ─────────────────────────────────────

    public function show(Request $request, CourseVideo $video): JsonResponse
    {
        $video->loadMissing('category', 'course');

        $isFreePreview = $video->category->is_free_preview;

        // Resolve the authenticated user if a Bearer token is present.
        // Returns null for unauthenticated requests — no exception thrown.
        $user = $request->user('sanctum');

        // ── 1. Access gate ──────────────────────────────────────────────────────

        $userHasCourseAccess = false;

        if ($isFreePreview) {
            // Free preview: open to everyone.
            // Still check course access so the response is accurate for authenticated users.
            if ($user !== null) {
                $userHasCourseAccess = $this->access->userHasActiveCourseAccess($user, $video->course);
            }
        } else {
            // Paid video: authentication is mandatory.
            if ($user === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Autentificarea este necesară pentru acest video.',
                ], 401);
            }

            $userHasCourseAccess = $this->access->userHasActiveCourseAccess($user, $video->course);

            if (! $userHasCourseAccess) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nu ai acces la acest video.',
                ], 403);
            }
        }

        // ── 2. Cloudflare playback data ─────────────────────────────────────────

        $playbackData = $this->cloudflare->buildPlaybackData($video);

        // ── 3. Progress / resume data (authenticated users only) ───────────────

        $progress = null;

        if ($user !== null) {
            $record = UserVideoProgress::where('user_id', $user->id)
                ->where('video_id', $video->id)
                ->first();

            $progress = $record
                ? [
                    'last_position_seconds' => (int)   $record->last_position_seconds,
                    'progress_percent'      => (float) $record->progress_percent,
                    'is_completed'          => (bool)  $record->is_completed,
                    'last_watched_at'       => $record->last_watched_at?->toIso8601String(),
                ]
                : [
                    'last_position_seconds' => 0,
                    'progress_percent'      => 0.0,
                    'is_completed'          => false,
                    'last_watched_at'       => null,
                ];
        }

        // ── 4. Response ─────────────────────────────────────────────────────────

        return response()->json([
            'success' => true,
            'message' => 'Acces video permis.',
            'data'    => [
                'video'    => [
                    'id'                   => $video->id,
                    'title'                => $video->title,
                    'duration_seconds'     => $video->duration_seconds,
                    'thumbnail_url'        => $video->cloudflare_thumbnail_url,
                    'cloudflare_video_uid' => $video->cloudflare_video_uid,
                ],
                'playback' => $playbackData,
                'access'   => [
                    'is_free_preview'        => $isFreePreview,
                    'user_has_course_access' => $userHasCourseAccess,
                    'requires_purchase'      => ! $isFreePreview && ! $userHasCourseAccess,
                ],
                'progress' => $progress,
            ],
        ]);
    }
}
