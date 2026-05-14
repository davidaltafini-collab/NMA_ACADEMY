<?php

namespace App\Http\Controllers\Api\Course;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\UserCourse;
use App\Services\CourseAccessService;
use App\Services\VideoProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserCourseController extends Controller
{
    public function __construct(
        private readonly CourseAccessService  $access,
        private readonly VideoProgressService $progress,
    ) {}

    // ─── GET /api/user/courses ────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $userCourses = UserCourse::with('course')
            ->where('user_id', $user->id)
            ->where('access_status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->orderByDesc('purchased_at')
            ->get();

        $data = $userCourses->map(function (UserCourse $uc) use ($user) {
            $stats = $this->progress->getCourseStats($user, $uc->course_id);

            return [
                'id'                     => $uc->id,
                'course_id'              => $uc->course_id,
                'title'                  => $uc->course->title,
                'slug'                   => $uc->course->slug,
                'short_description'      => $uc->course->short_description,
                'thumbnail_url'          => $uc->course->thumbnail_url,
                'price'                  => (float) $uc->course->price,
                'currency'               => $uc->course->currency,
                'purchased_at'           => $uc->purchased_at?->toIso8601String(),
                'expires_at'             => $uc->expires_at?->toIso8601String(),
                'access_status'          => $uc->access_status,
                'progress_percent'       => $stats['progress_percent'],
                'completed_videos_count' => $stats['completed_videos_count'],
                'total_videos_count'     => $stats['total_videos_count'],
                'last_watched_at'        => $stats['last_watched_at'],
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Cursurile tale au fost încărcate cu succes.',
            'data'    => ['courses' => $data],
        ]);
    }

    // ─── GET /api/user/courses/{slug} ─────────────────────────────────────────

    public function show(Request $request, string $slug): JsonResponse
    {
        $course = Course::where('slug', $slug)
            ->where('status', 'published')
            ->first();

        if (! $course) {
            return response()->json([
                'success' => false,
                'message' => 'Cursul nu a fost găsit.',
            ], 404);
        }

        $user = $request->user();

        if (! $this->access->userHasActiveCourseAccess($user, $course)) {
            return response()->json([
                'success' => false,
                'message' => 'Nu ai acces la acest curs. Achiziționează cursul pentru a-l accesa complet.',
            ], 403);
        }

        // Single query for all progress in this course — avoids N+1 during tree build
        $progressMap = $this->progress->getProgressMapForCourse($user, $course);

        $tree  = $this->access->buildCategoryTree($course, allUnlocked: true, progressMap: $progressMap);
        $stats = $this->progress->getCourseStats($user, $course->id);

        $courseData = $this->access->serializeCourse(
            $course,
            $tree['categories'],
            $tree['total_duration_seconds'],
        );

        // Attach course-level progress summary
        $courseData['progress_percent']       = $stats['progress_percent'];
        $courseData['completed_videos_count'] = $stats['completed_videos_count'];
        $courseData['total_videos_count']     = $stats['total_videos_count'];
        $courseData['last_watched_at']        = $stats['last_watched_at'];

        return response()->json([
            'success' => true,
            'message' => 'Cursul a fost încărcat cu succes.',
            'data'    => ['course' => $courseData],
        ]);
    }

    // ─── POST /api/user/courses/{slug}/enroll-test ────────────────────────────
    // TEMPORARY — grants active course access without payment for local testing.
    // Must be removed or restricted before production.
    // Will be superseded by Netopia payment webhook in the payments phase.

    public function enrollTest(Request $request, string $slug): JsonResponse
    {
        $course = Course::where('slug', $slug)
            ->where('status', 'published')
            ->first();

        if (! $course) {
            return response()->json([
                'success' => false,
                'message' => 'Cursul nu a fost găsit.',
            ], 404);
        }

        UserCourse::updateOrCreate(
            [
                'user_id'   => $request->user()->id,
                'course_id' => $course->id,
            ],
            [
                'purchased_at'  => now(),
                'expires_at'    => null,
                'access_status' => 'active',
                'source'        => 'test',
                'payment_id'    => null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Acces de test acordat pentru curs.',
            'data'    => [
                'course_slug'   => $course->slug,
                'access_status' => 'active',
            ],
        ]);
    }
}
