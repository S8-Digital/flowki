<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('todos', function (Blueprint $table) {
            $table->boolean('reminder_enabled')->default(true);
            $table->unsignedSmallInteger('reminder_lead_time')->default(60);
        });

        Schema::table('chores', function (Blueprint $table) {
            $table->boolean('reminder_enabled')->default(true);
            $table->unsignedSmallInteger('reminder_lead_time')->default(60);
        });
    }

    public function down(): void
    {
        Schema::table('todos', function (Blueprint $table) {
            $table->dropColumn(['reminder_enabled', 'reminder_lead_time']);
        });

        Schema::table('chores', function (Blueprint $table) {
            $table->dropColumn(['reminder_enabled', 'reminder_lead_time']);
        });
    }
};
