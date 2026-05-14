<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // ip_address varchar(45) supports both IPv4 and IPv6
            $table->string('ip_address', 45);
            $table->text('user_agent');

            // Optional fingerprint sent by the frontend
            $table->string('device_fingerprint', 64)->nullable();
            // Human-readable description parsed from user_agent (e.g. "Chrome on macOS")
            $table->string('device_info')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamp('last_active_at');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('revoked_at')->nullable();

            $table->timestamps();

            // Most common query: active sessions for a given user
            $table->index(['user_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_sessions');
    }
};
