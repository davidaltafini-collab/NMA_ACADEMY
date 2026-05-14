<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->string('password');

            $table->enum('role', ['user', 'admin', 'superadmin'])->default('user');
            // 'unverified' → email sent, code not yet confirmed
            // 'active'     → email verified, account in good standing
            // 'suspended'  → manually disabled by admin
            $table->enum('status', ['unverified', 'active', 'suspended'])->default('unverified');

            $table->timestamp('email_verified_at')->nullable();

            // Verification code stored as SHA-256 hash (64 hex chars)
            $table->string('email_verification_code', 64)->nullable();
            $table->timestamp('email_verification_expires_at')->nullable();
            $table->tinyInteger('email_verification_attempts')->unsigned()->default(0);
            $table->timestamp('email_verification_blocked_until')->nullable();

            // Login brute-force protection
            $table->tinyInteger('failed_login_attempts')->unsigned()->default(0);
            $table->timestamp('login_blocked_until')->nullable();

            $table->boolean('marketing_consent')->default(false);
            $table->timestamp('terms_accepted_at')->nullable();
            $table->timestamp('last_login_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        // Kept for the future forgot-password phase
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
