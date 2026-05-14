<?php

namespace App\Services;

use App\Models\Course;
use App\Models\CourseVideo;
use App\Models\User;
use App\Models\UserVideoProgress;

class VideoProgressService
{
    public function __construct(private readonly CourseAccessService $access) {}

    // ─── Access check ─────────────────────────────────────────────────────────

    /**
     * A user may interact with a video's progress if:
     *  - the video belongs to a free-preview category (any authenticated user), or
     *  - the user has active purchased access to the course.
     */
    public function canAccess(User $user, CourseVideo $video): bool
    {
        // Ensure the category relationship is loaded
        $video->loadMissing('category');

        if ($video->category->is_free_preview) {
            return true;
        }

        $video->loadMissing('course');

        return $this->access->userHasActiveCourseAccess($user, $video->course);
    }

    // ─── Save / upsert ────────────────────────────────────────────────────────

    public function saveProgress(User $user, CourseVideo $video, array $data): UserVideoProgress
    {
        $currentTime = (int) $data['current_time_seconds'];
        $duration    = max(1, (int) $data['duration_seconds']);
        $watched     = isset($data['watched_seconds']) ? (int) $data['watched_seconds'] : null;

        $progressPct = min(100.0, round($currentTime / $duration * 100, 2));

        // Fetch existing row so we never un-complete a video that was already finished
        $existing = UserVideoProgress::where('user_id', $user->id)
            ->where('video_id', $video->id)
            ->first();

        $isCompleted = ($progressPct >= 90)
            || (bool) ($data['is_completed'] ?? false)
            || ($existing?->is_completed ?? false);

        // Preserve the original completed_at timestamp if already set
        $completedAt = $isCompleted
            ? ($existing?->completed_at ?? now())
            : null;

        $attributes = [
            'course_id'             => $video->course_id,
            'category_id'           => $video->category_id,
            'subcategory_id'        => $video->subcategory_id,
            'last_position_seconds' => $currentTime,
            'duration_seconds'      => $duration,
            'progress_percent'      => $progressPct,
            'is_completed'          => $isCompleted,
            'completed_at'          => $completedAt,
            'last_watched_at'       => now(),
        ];

        // Only overwrite watched_seconds when the caller provides it
        if ($watched !== null) {
            $attributes['watched_seconds'] = $watched;
        }

        $progress = UserVideoProgress::updateOrCreate(
            ['user_id' => $user->id, 'video_id' => $video->id],
            $attributes
        );

        return $progress->fresh();
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    public function formatProgress(UserVideoProgress $p): array
    {
        return [
            'video_id'              => $p->video_id,
            'last_position_seconds' => $p->last_position_seconds,
            'duration_seconds'      => $p->duration_seconds,
            'watched_seconds'       => $p->watched_seconds,
            'progress_percent'      => (float) $p->progress_percent,
            'is_completed'          => $p->is_completed,
            'completed_at'          => $p->completed_at?->toIso8601String(),
            'last_watched_at'       => $p->last_watched_at?->toIso8601String(),
        ];
    }

    public function defaultProgress(CourseVideo $video): array
    {
        return [
            'video_id'              => $video->id,
            'last_position_seconds' => 0,
            'duration_seconds'      => $video->duration_seconds,
            'watched_seconds'       => 0,
            'progress_percent'      => 0.0,
            'is_completed'          => false,
            'completed_at'          => null,
            'last_watched_at'       => null,
        ];
    }

    // ─── Course-level progress stats ──────────────────────────────────────────

    /**
     * Summary stats for the course list view (GET /api/user/courses).
     * One DB call per course — acceptable at current scale.
     */
    public function getCourseStats(User $user, int $courseId): array
    {
        $totalVideos = CourseVideo::where('course_id', $courseId)
            ->where('status', 'published')
            ->count();

        if ($totalVideos === 0) {
            return [
                'progress_percent'       => 0.0,
                'completed_videos_count' => 0,
                'total_videos_count'     => 0,
                'last_watched_at'        => null,
            ];
        }

        $rows = UserVideoProgress::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->get(['progress_percent', 'is_completed', 'last_watched_at']);

        $sumPct     = $rows->sum(fn ($r) => (float) $r->progress_percent);
        $completed  = $rows->where('is_completed', true)->count();
        $lastWatched = $rows->max('last_watched_at');

        return [
            // Videos with no progress row count as 0% — divide by total not by rows
            'progress_percent'       => (float) round($sumPct / $totalVideos, 2),
            'completed_videos_count' => $completed,
            'total_videos_count'     => $totalVideos,
            'last_watched_at'        => $lastWatched?->toIso8601String(),
        ];
    }

    /**
     * Returns a map of [video_id => progress array] for every progress row the
     * user has in a given course. Used to decorate the category tree without
     * triggering additional queries per subcategory.
     */
    public function getProgressMapForCourse(User $user, Course $course): array
    {
        return UserVideoProgress::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->get()
            ->keyBy('video_id')
            ->map(fn (UserVideoProgress $p) => [
                'last_position_seconds' => $p->last_position_seconds,
                'progress_percent'      => (float) $p->progress_percent,
                'is_completed'          => $p->is_completed,
                'last_watched_at'       => $p->last_watched_at?->toIso8601String(),
            ])
            ->all();
    }
}
