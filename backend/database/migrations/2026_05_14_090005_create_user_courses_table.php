<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('course_id')->constrained('courses')->restrictOnDelete();
            $table->timestamp('purchased_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->enum('access_status', ['active', 'expired', 'revoked', 'pending'])->default('pending');
            // How access was granted — nullable placeholder for Netopia and future sources
            $table->string('source')->nullable();
            // Nullable foreign reference — Netopia payment integration comes in a later phase
            $table->string('payment_id')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'course_id']);
            $table->index(['user_id', 'access_status']);
            $table->index(['course_id', 'access_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_courses');
    }
};
