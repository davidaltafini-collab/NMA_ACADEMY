<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_sessions', function (Blueprint $table) {
            // Link to personal_access_tokens so we can revoke the Sanctum token
            // when a session is deactivated. nullOnDelete() handles token deletion
            // without orphaning the session row.
            $table->foreignId('sanctum_token_id')
                ->nullable()
                ->after('user_id')
                ->constrained('personal_access_tokens')
                ->nullOnDelete();

            $table->index('sanctum_token_id');
        });
    }

    public function down(): void
    {
        Schema::table('user_sessions', function (Blueprint $table) {
            $table->dropForeign(['sanctum_token_id']);
            $table->dropIndex(['sanctum_token_id']);
            $table->dropColumn('sanctum_token_id');
        });
    }
};
