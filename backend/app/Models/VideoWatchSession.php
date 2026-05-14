<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoWatchSession extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'video_id',
        'user_session_id',
        'started_at',
        'last_heartbeat_at',
        'ended_at',
        'is_active',
        'ended_reason',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'started_at'        => 'datetime',
            'last_heartbeat_at' => 'datetime',
            'ended_at'          => 'datetime',
            'is_active'         => 'boolean',
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
