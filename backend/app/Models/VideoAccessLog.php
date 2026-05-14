<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoAccessLog extends Model
{
    // Append-only log — no updated_at column
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'course_id',
        'video_id',
        'user_session_id',
        'action',
        'position_seconds',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'metadata'   => 'array',
            'created_at' => 'datetime',
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

    public function video(): BelongsTo
    {
        return $this->belongsTo(CourseVideo::class, 'video_id');
    }

    public function userSession(): BelongsTo
    {
        return $this->belongsTo(UserSession::class, 'user_session_id');
    }
}
