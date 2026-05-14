<?php

namespace App\Http\Controllers\Api\Course;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Services\CourseAccessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicCourseController extends Controller
{
    public function __construct(private readonly CourseAccessService $access) {}

    // ─── GET /api/courses ─────────────────────────────────────────────────────

    public function index(): JsonResponse
    {
        $courses = Course::where('status', 'published')
            ->withCount([
                'categories as categories_count' => fn ($q) => $q->where('status', 'published'),
                'subcategories as subcategories_count' => fn ($q) => $q->where('status', 'published'),
                'videos as videos_count'         => fn ($q) => $q->where('status', 'published'),
            ])
            ->withSum([
                'videos as total_duration_seconds' => fn ($q) => $q->where('status', 'published'),
            ], 'duration_seconds')
            ->orderBy('published_at')
            ->get();

        $data = $courses->map(function (Course $course) {
            $freePreviewAvailable = $course->categories()
                ->where('is_free_preview', true)
                ->where('status', 'published')
                ->exists();

            return [
                'id'                     => $course->id,
                'title'                  => $course->title,
                'slug'                   => $course->slug,
                'short_description'      => $course->short_description,
                'price'                  => (float) $course->price,
                'currency'               => $course->currency,
                'thumbnail_url'          => $course->thumbnail_url,
                'published_at'           => $course->published_at?->toIso8601String(),
                'features'               => $course->features ?? [],
                'target_audience'        => $course->target_audience ?? [],
                'results_promised'       => $course->results_promised ?? [],
                'categories_count'       => $course->categories_count,
                'subcategories_count'    => $course->subcategories_count,
                'videos_count'           => $course->videos_count,
                'total_duration_seconds' => (int) ($course->total_duration_seconds ?? 0),
                'free_preview_available' => $freePreviewAvailable,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Cursurile au fost încărcate cu succes.',
            'data'    => ['courses' => $data],
        ]);
    }

    // ─── GET /api/courses/{slug} ──────────────────────────────────────────────
    // Unauthenticated: only free-preview categories are unlocked.
    // Authenticated with active access: all categories are unlocked.

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

        // Attempt to resolve the Sanctum user without enforcing auth middleware.
        // Returns null for unauthenticated or invalid-token requests.
        $user       = auth('sanctum')->user();
        $allUnlocked = $user !== null && $this->access->userHasActiveCourseAccess($user, $course);

        $tree = $this->access->buildCategoryTree($course, allUnlocked: $allUnlocked);

        return response()->json([
            'success' => true,
            'message' => 'Cursul a fost încărcat cu succes.',
            'data'    => [
                'course'          => $this->access->serializeCourse(
                    $course,
                    $tree['categories'],
                    $tree['total_duration_seconds'],
                ),
                'user_has_access' => $allUnlocked,
            ],
        ]);
    }
}
