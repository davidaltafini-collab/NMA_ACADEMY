<?php

namespace App\Services;

use App\Models\Course;
use App\Models\User;
use App\Models\UserCourse;

class CourseAccessService
{
    /**
     * Returns true if the user has an active, non-expired course access record.
     * Used by video access, progress tracking, checkout, and protected player in later phases.
     */
    public function userHasActiveCourseAccess(User $user, Course $course): bool
    {
        return UserCourse::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->where('access_status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    /**
     * Builds the category → subcategory → video tree for a published course.
     *
     * $allUnlocked   — when true every category/video has is_locked = false (user has full access).
     * $progressMap   — keyed by video_id, each value is an array with:
     *                  last_position_seconds, progress_percent, is_completed, last_watched_at.
     *                  When empty (default) all progress fields are set to zero/false defaults.
     *
     * Returns ['categories' => array, 'total_duration_seconds' => int].
     */
    public function buildCategoryTree(
        Course $course,
        bool $allUnlocked = false,
        array $progressMap = [],
    ): array {
        $totalDurationSeconds = 0;

        $categories = $course->categories()
            ->where('status', 'published')
            ->orderBy('order_index')
            ->with([
                'subcategories' => fn ($q) => $q
                    ->where('status', 'published')
                    ->orderBy('order_index')
                    ->with([
                        'video' => fn ($q) => $q->where('status', 'published'),
                    ]),
            ])
            ->get();

        $categoriesData = $categories->map(function ($category) use ($allUnlocked, $progressMap, &$totalDurationSeconds) {
            $isLocked = $allUnlocked ? false : ! $category->is_free_preview;

            $subcategoriesData = $category->subcategories->map(function ($sub) use ($isLocked, $progressMap, &$totalDurationSeconds) {
                $video = $sub->video;
                $totalDurationSeconds += $video?->duration_seconds ?? 0;

                $vProgress = $video ? ($progressMap[$video->id] ?? null) : null;

                return [
                    'id'                    => $sub->id,
                    'title'                 => $sub->title,
                    'slug'                  => $sub->slug,
                    'description'           => $sub->description,
                    'order_index'           => $sub->order_index,
                    'is_locked'             => $isLocked,
                    'progress_percent'      => (float) ($vProgress['progress_percent'] ?? 0),
                    'is_completed'          => (bool)  ($vProgress['is_completed'] ?? false),
                    'last_position_seconds' => (int)   ($vProgress['last_position_seconds'] ?? 0),
                    'video'                 => $video ? [
                        'id'                    => $video->id,
                        'title'                 => $video->title,
                        'duration_seconds'      => $video->duration_seconds,
                        'thumbnail_url'         => $video->cloudflare_thumbnail_url,
                        'is_locked'             => $isLocked,
                        'progress_percent'      => (float) ($vProgress['progress_percent'] ?? 0),
                        'is_completed'          => (bool)  ($vProgress['is_completed'] ?? false),
                        'last_position_seconds' => (int)   ($vProgress['last_position_seconds'] ?? 0),
                        'last_watched_at'       => $vProgress['last_watched_at'] ?? null,
                    ] : null,
                ];
            });

            // Aggregate category-level progress from its subcategories
            $videosInCat  = $subcategoriesData->filter(fn ($s) => $s['video'] !== null);
            $totalVidCount = $videosInCat->count();
            $catProgress  = $totalVidCount > 0
                ? round($videosInCat->sum('progress_percent') / $totalVidCount, 2)
                : 0.0;
            $catCompleted = $videosInCat->where('is_completed', true)->count();

            return [
                'id'                     => $category->id,
                'title'                  => $category->title,
                'slug'                   => $category->slug,
                'description'            => $category->description,
                'order_index'            => $category->order_index,
                'is_free_preview'        => (bool) $category->is_free_preview,
                'is_locked'              => $isLocked,
                'progress_percent'       => (float) $catProgress,
                'completed_videos_count' => $catCompleted,
                'total_videos_count'     => $totalVidCount,
                'subcategories'          => $subcategoriesData->values()->all(),
            ];
        });

        return [
            'categories'             => $categoriesData->values()->all(),
            'total_duration_seconds' => $totalDurationSeconds,
        ];
    }

    /**
     * Serialises core course fields shared by both public and authenticated responses.
     */
    public function serializeCourse(Course $course, array $categories, int $totalDurationSeconds): array
    {
        return [
            'id'                     => $course->id,
            'title'                  => $course->title,
            'slug'                   => $course->slug,
            'short_description'      => $course->short_description,
            'description'            => $course->description,
            'price'                  => (float) $course->price,
            'currency'               => $course->currency,
            'thumbnail_url'          => $course->thumbnail_url,
            'published_at'           => $course->published_at?->toIso8601String(),
            'features'               => $course->features ?? [],
            'target_audience'        => $course->target_audience ?? [],
            'results_promised'       => $course->results_promised ?? [],
            'total_duration_seconds' => $totalDurationSeconds,
            'categories'             => $categories,
        ];
    }
}
