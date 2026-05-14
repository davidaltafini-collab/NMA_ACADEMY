<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Marketing/sales copy — stored as JSON arrays for flexibility
            $table->json('features')->nullable()->after('description');
            $table->json('target_audience')->nullable()->after('features');
            $table->json('results_promised')->nullable()->after('target_audience');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['features', 'target_audience', 'results_promised']);
        });
    }
};
