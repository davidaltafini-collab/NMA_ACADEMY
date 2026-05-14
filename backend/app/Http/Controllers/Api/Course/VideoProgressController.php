<?php

namespace App\Http\Controllers\Api\Course;

use App\Http\Controllers\Controller;
use App\Http\Requests\Course\SaveVideoProgressRequest;
use App\Models\CourseVideo;
use App\Services\VideoProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VideoProgressController extends Controller
{
    public function __construct(private readonly VideoProgressService $progress) {}

    // ─── POST /api/user/videos/{video}/progress ───────────────────────────────

    public function save(SaveVideoProgressRequest $request, CourseVideo $video): JsonResponse
    {
        if (! $this->progress->canAccess($request->user(), $video)) {
            return response()->json([
                'success' => false,
                'message' => 'Nu ai acces la acest video.',
            ], 403);
        }

        $record = $this->progress->saveProgress($request->user(), $video, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Progresul a fost salvat.',
            'data'    => ['progress' => $this->progress->formatProgress($record)],
        ]);
    }

    // ─── GET /api/user/videos/{video}/progress ────────────────────────────────

    public function show(Request $request, CourseVideo $video): JsonResponse
    {
        if (! $this->progress->canAccess($request->user(), $video)) {
            return response()->json([
                'success' => false,
                'message' => 'Nu ai acces la acest video.',
            ], 403);
        }

        $record = \App\Models\UserVideoProgress::where('user_id', $request->user()->id)
            ->where('video_id', $video->id)
            ->first();

        $data = $record
            ? $this->progress->formatProgress($record)
            : $this->progress->defaultProgress($video);

        return response()->json([
            'success' => true,
            'message' => 'Progresul a fost încărcat.',
            'data'    => ['progress' => $data],
        ]);
    }
}
