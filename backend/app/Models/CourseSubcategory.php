<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class CourseSubcategory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'course_id',
        'category_id',
        'title',
        'slug',
        'description',
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

    public function video(): HasOne
    {
        return $this->hasOne(CourseVideo::class, 'subcategory_id');
    }
}
