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
            'recurrence' => $request['recurrence'] ?? null,
            'reminder_at' => $request['reminder_at'] ?? null,
            'color' => $request['color'] ?? null,
        ]);

        if (! empty($request['attendee_ids'])) {
            $attendeeIds = array_unique(array_map('intval', (array) $request['attendee_ids']));

            $validAttendeeIds = User::query()
                ->where('family_id', $this->user->family_id)
                ->whereIn('id', $attendeeIds)
                ->pluck('id')
                ->all();

            sort($attendeeIds);
            sort($validAttendeeIds);

            if ($attendeeIds !== $validAttendeeIds) {
                $invalidIds = array_values(array_diff($attendeeIds, $validAttendeeIds));

                return 'Error: One or more attendee IDs are invalid or do not belong to this family: '.implode(', ', $invalidIds);
            }

            $event->attendees()->sync($validAttendeeIds);
        }

        return "✓ Event scheduled: \"{$event->title}\" on {$event->start_at->toDateTimeString()} (ID: {$event->id})";
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
            'recurrence' => $schema->string()->description('Recurrence pattern: daily, weekly, or monthly'),
            'reminder_at' => $schema->string()->description('Reminder datetime ISO 8601'),
            'color' => $schema->string()->description('Hex color code, e.g. #6366f1'),
            'attendee_ids' => $schema->array()->description('List of family member user IDs to invite as attendees'),
        ];
    }
}
