<?php

namespace App\Http\Controllers\Api\Course;

use App\Http\Controllers\Controller;
use App\Http\Requests\Course\LogVideoEventRequest;
use App\Models\CourseVideo;
use App\Services\CourseAccessService;
use App\Services\WatchSessionService;
use Illuminate\Http\JsonResponse;

/**
 * POST /api/user/videos/{video}/event
 *
 * Receives player lifecycle events from the frontend (play, pause, seek,
 * complete, right_click_blocked, visibility_hidden, shortcut_blocked, error)
 * and persists them to video_access_logs via WatchSessionService::log().
 *
 * Protected by auth:sanctum + session.activity.
 * Unauthenticated requests are rejected by middleware before reaching here.
 * Logging failures are silently swallowed — never break the player.
 */
class VideoEventController extends Controller
{
    public function __construct(
        private readonly CourseAccessService $access,
        private readonly WatchSessionService $watch,
    ) {}

    public function store(LogVideoEventRequest $request, CourseVideo $video): JsonResponse
    {
        $video->loadMissing('category', 'course');

        $user        = $request->user();
        $userSession = $request->attributes->get('user_session');

        // ── Access gate (same rules as progress/playback) ───────────────────
        if (! $video->category->is_free_preview) {
            if (! $this->access->userHasActiveCourseAccess($user, $video->course)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nu ai acces la acest video.',
                ], 403);
            }
        }

        // ── Write log row ────────────────────────────────────────────────────
        // Failures are swallowed inside WatchSessionService::log().
        $this->watch->log(
            $video,
            $user,
            $userSession,
            $request->action,
            $request->position_seconds,
            $request->metadata ?? [],
        );

        return response()->json([
            'success' => true,
            'message' => 'Eveniment înregistrat.',
        ]);
    }
}
