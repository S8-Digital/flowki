<?php

namespace App\Ai\Tools;

use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class CreateEvent implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Schedule a calendar event for the family. Call this when the user asks to add an appointment, event, or schedule something.';
    }

    public function handle(Request $request): string
    {
        $event = CalendarEvent::create([
            'family_id' => $this->user->family_id,
            'created_by' => $this->user->id,
            'title' => $request['title'],
            'description' => $request['description'] ?? null,
            'location' => $request['location'] ?? null,
            'start_at' => $request['start_at'],
            'end_at' => $request['end_at'] ?? null,
            'is_all_day' => (bool) ($request['is_all_day'] ?? false),
        ]);

        return "✓ Event scheduled: \"{$event->title}\" on {$event->start_at->toDateTimeString()}";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->description('Event title')->required(),
            'start_at' => $schema->string()->description('Start datetime ISO 8601, e.g. 2026-03-20T14:00:00')->required(),
            'end_at' => $schema->string()->description('End datetime ISO 8601'),
            'description' => $schema->string()->description('Optional description'),
            'location' => $schema->string()->description('Optional location'),
            'is_all_day' => $schema->boolean()->description('Whether this is an all-day event'),
        ];
    }
}

