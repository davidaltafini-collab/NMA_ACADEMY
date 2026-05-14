<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CourseVideo extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'course_id',
        'category_id',
        'subcategory_id',
        'title',
        'cloudflare_video_uid',
        'cloudflare_playback_url',
        'cloudflare_thumbnail_url',
        'duration_seconds',
        'order_index',
        'status',
    ];

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

    public function progress(): HasMany
    {
        return $this->hasMany(UserVideoProgress::class, 'video_id');
    }
}
