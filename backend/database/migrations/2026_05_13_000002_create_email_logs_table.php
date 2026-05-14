<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // e.g. 'verification_code', 'welcome', 'password_reset'
            $table->string('email_type', 50);
            $table->string('recipient_email');
            $table->string('subject');
            $table->enum('status', ['sent', 'failed'])->default('sent');

            // SMTP / provider message ID for delivery tracking
            $table->string('provider_id')->nullable();
            $table->text('error_message')->nullable();

            $table->timestamp('sent_at');
            $table->timestamps();

            $table->index(['user_id', 'email_type']);
            $table->index('sent_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_logs');
    }
};
