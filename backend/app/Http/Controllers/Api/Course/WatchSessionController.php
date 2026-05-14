<?php

namespace App\Http\Controllers\Api\Course;

use App\Http\Controllers\Controller;
use App\Http\Requests\Course\WatchSessionEndRequest;
use App\Http\Requests\Course\WatchSessionHeartbeatRequest;
use App\Models\CourseVideo;
use App\Services\VideoProgressService;
use App\Services\WatchSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WatchSessionController extends Controller
{
    public function __construct(
        private readonly WatchSessionService  $watch,
        private readonly VideoProgressService $progress,
    ) {}

    // ─── POST /api/user/videos/{video}/watch-session/start ────────────────────

    public function start(Request $request, CourseVideo $video): JsonResponse
    {
        $user        = $request->user();
        $userSession = $request->attributes->get('user_session');

        // ── 1. Access check ────────────────────────────────────────────────────
        if (! $this->progress->canAccess($user, $video)) {
            return response()->json([
                'success' => false,
                'message' => 'Nu ai acces la acest video.',
            ], 403);
        }

        // ── 2. Clean up any stale sessions before conflict detection ───────────
        $staleClosed = $this->watch->endStaleSessions($user);

        if ($staleClosed > 0) {
            $this->watch->log($video, $user, $userSession, 'stale_timeout', null, [
                'stale_sessions_closed' => $staleClosed,
            ]);
        }

        // ── 3. Check for a live active session ─────────────────────────────────
        $existing = $this->watch->findActiveSession($user);

        if ($existing) {
            if ($this->watch->belongsToCurrentDevice($existing, $userSession)) {
                // Same device — cleanly replace (user navigated to another video)
                $this->watch->endSession($existing, 'displaced_by_self');
            } else {
                // Another live device is watching — reject
                $this->watch->log($video, $user, $userSession, 'watch_conflict', null, [
                    'conflicting_watch_session_id' => $existing->id,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Acest cont vizionează deja un videoclip pe alt dispozitiv.',
                    'data'    => ['reason' => 'ACTIVE_WATCH_SESSION_ON_ANOTHER_DEVICE'],
                ], 409);
            }
        }

        // ── 4. Create new session ──────────────────────────────────────────────
        $session = $this->watch->createSession($user, $video, $userSession, $request);

        $this->watch->log($video, $user, $userSession, 'watch_start', null, [
            'watch_session_id' => $session->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sesiunea de vizionare a fost pornită.',
            'data'    => [
                'watch_session_id'          => $session->id,
                'video_id'                  => $video->id,
                'heartbeat_interval_seconds'=> 30,
            ],
        ]);
    }

    // ─── POST /api/user/videos/{video}/watch-session/heartbeat ────────────────

    public function heartbeat(WatchSessionHeartbeatRequest $request, CourseVideo $video): JsonResponse
    {
        $user        = $request->user();
        $userSession = $request->attributes->get('user_session');

        $session = $this->watch->resolveSession($request->watch_session_id, $user, $video);

        if (! $session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesiunea de vizionare nu a fost găsită sau nu mai este activă.',
            ], 404);
        }

        if (! $this->watch->belongsToCurrentDevice($session, $userSession)) {
            return response()->json([
                'success' => false,
                'message' => 'Sesiunea nu aparține dispozitivului curent.',
            ], 403);
        }

        $session->update(['last_heartbeat_at' => now()]);

        // Opportunistically save progress when the player sends current position
        $this->watch->maybeSaveProgress(
            $user,
            $video,
            $request->input('current_time_seconds'),
        );

        return response()->json([
            'success' => true,
            'message' => 'Sesiunea de vizionare este activă.',
            'data'    => [
                'watch_session_id'  => $session->id,
                'last_heartbeat_at' => now()->toIso8601String(),
            ],
        ]);
    }

    // ─── POST /api/user/videos/{video}/watch-session/end ─────────────────────

    public function end(WatchSessionEndRequest $request, CourseVideo $video): JsonResponse
    {
        $user        = $request->user();
        $userSession = $request->attributes->get('user_session');

        $session = $this->watch->resolveSession($request->watch_session_id, $user, $video);

        if (! $session) {
            return response()->json([
                'success' => false,
                'message' => 'Sesiunea de vizionare nu a fost găsită sau nu mai este activă.',
            ], 404);
        }

        if (! $this->watch->belongsToCurrentDevice($session, $userSession)) {
            return response()->json([
                'success' => false,
                'message' => 'Sesiunea nu aparține dispozitivului curent.',
            ], 403);
        }

        $reason = $request->input('ended_reason', 'user_exit');
        $this->watch->endSession($session, $reason);

        // Save final progress if caller sends position + duration
        $this->watch->maybeSaveProgress(
            $user,
            $video,
            $request->input('current_time_seconds'),
            $request->input('duration_seconds'),
        );

        $this->watch->log($video, $user, $userSession, 'watch_end', $request->input('current_time_seconds'), [
            'watch_session_id' => $session->id,
            'ended_reason'     => $reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sesiunea de vizionare a fost încheiată.',
            'data'    => [
                'watch_session_id' => $session->id,
                'ended_reason'     => $reason,
            ],
        ]);
    }
}
