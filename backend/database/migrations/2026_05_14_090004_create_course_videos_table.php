<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->restrictOnDelete();
            $table->foreignId('category_id')->constrained('course_categories')->restrictOnDelete();
            $table->foreignId('subcategory_id')->constrained('course_subcategories')->restrictOnDelete();
            $table->string('title');
            // Cloudflare Stream identifiers — populated later via API upload phase
            $table->string('cloudflare_video_uid')->nullable();
            $table->string('cloudflare_playback_url')->nullable();
            $table->string('cloudflare_thumbnail_url')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->unsignedInteger('order_index')->default(0);
            $table->enum('status', ['draft', 'published', 'processing'])->default('draft');
            $table->timestamps();
            $table->softDeletes();

            // One video per subcategory
            $table->unique('subcategory_id');
            $table->index('course_id');
            $table->index('category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_videos');
    }
};
