<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CourseCategory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'course_id',
        'title',
        'slug',
        'description',
        'order_index',
        'is_free_preview',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_free_preview' => 'boolean',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function subcategories(): HasMany
    {
        return $this->hasMany(CourseSubcategory::class, 'category_id')->orderBy('order_index');
    }

    public function videos(): HasMany
    {
        return $this->hasMany(CourseVideo::class, 'category_id');
    }
}
