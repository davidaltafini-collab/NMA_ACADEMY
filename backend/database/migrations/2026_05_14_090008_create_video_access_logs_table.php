<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('video_access_logs', function (Blueprint $table) {
            $table->id();
            // Nullable — logs may be written for unauthenticated probe attempts
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('course_id')->constrained('courses')->restrictOnDelete();
            $table->foreignId('video_id')->constrained('course_videos')->restrictOnDelete();
            $table->foreignId('user_session_id')
                ->nullable()
                ->constrained('user_sessions')
                ->nullOnDelete();
            // Player event: 'play', 'pause', 'seek', 'complete', 'error', etc.
            $table->string('action');
            $table->unsignedInteger('position_seconds')->nullable();
            $table->json('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            // Append-only log — no updated_at needed
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('video_access_logs');
    }
};
