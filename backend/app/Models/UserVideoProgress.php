<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserVideoProgress extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'category_id',
        'subcategory_id',
        'video_id',
        'last_position_seconds',
        'duration_seconds',
        'watched_seconds',
        'progress_percent',
        'is_completed',
        'completed_at',
        'last_watched_at',
    ];

    protected function casts(): array
    {
        return [
            'is_completed'    => 'boolean',
            'completed_at'    => 'datetime',
            'last_watched_at' => 'datetime',
            'progress_percent' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CourseCategory::class, 'category_id');
    }

    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(CourseSubcategory::class, 'subcategory_id');
    }

    public function video(): BelongsTo
    {
        return $this->belongsTo(CourseVideo::class, 'video_id');
    }
}
