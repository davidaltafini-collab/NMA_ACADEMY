<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'short_description',
        'description',
        'price',
        'currency',
        'thumbnail_url',
        'status',
        'created_by',
        'published_at',
        'features',
        'target_audience',
        'results_promised',
    ];

    protected function casts(): array
    {
        return [
            'price'            => 'decimal:2',
            'published_at'     => 'datetime',
            'features'         => 'array',
            'target_audience'  => 'array',
            'results_promised' => 'array',
        ];
    }

    public function categories(): HasMany
    {
        return $this->hasMany(CourseCategory::class)->orderBy('order_index');
    }

    public function subcategories(): HasMany
    {
        return $this->hasMany(CourseSubcategory::class);
    }

    public function videos(): HasMany
    {
        return $this->hasMany(CourseVideo::class);
    }

    public function userCourses(): HasMany
    {
        return $this->hasMany(UserCourse::class);
    }
}
