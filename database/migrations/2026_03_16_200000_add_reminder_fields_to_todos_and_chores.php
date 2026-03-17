<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('todos', function (Blueprint $table) {
            $table->boolean('reminder_enabled')->default(true)->after('due_date');
            $table->unsignedSmallInteger('reminder_lead_time')->default(60)->after('reminder_enabled');
        });

        Schema::table('chores', function (Blueprint $table) {
            $table->boolean('reminder_enabled')->default(true)->after('next_due_date');
            $table->unsignedSmallInteger('reminder_lead_time')->default(60)->after('reminder_enabled');
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
