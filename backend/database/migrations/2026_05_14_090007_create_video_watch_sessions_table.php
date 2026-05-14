<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('video_watch_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('course_id')->constrained('courses')->restrictOnDelete();
            $table->foreignId('video_id')->constrained('course_videos')->restrictOnDelete();
            // Links to user_sessions for device-level tracking (nullable — may not always be present)
            $table->foreignId('user_session_id')
                ->nullable()
                ->constrained('user_sessions')
                ->nullOnDelete();
            $table->timestamp('started_at');
            $table->timestamp('last_heartbeat_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->boolean('is_active')->default(true);
            // Reason the session ended: 'completed', 'timeout', 'displaced', 'manual', etc.
            $table->string('ended_reason')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
            $table->index(['video_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('video_watch_sessions');
    }
};
