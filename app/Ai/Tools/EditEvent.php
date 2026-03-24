<?php

namespace App\Ai\Tools;

use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class EditEvent implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Edit an existing calendar event. Call this when the user asks to update, change, or modify an event. Use list_events to find the event ID first.';
    }

    public function handle(Request $request): string
    {
        $event = CalendarEvent::query()
            ->forFamily($this->user->family_id)
            ->find($request['event_id']);

        if (! $event) {
            return 'Error: event not found. Use list_events to find the correct event ID.';
        }

        $fields = array_filter([
            'title' => $request['title'] ?? null,
            'description' => $request['description'] ?? null,
            'location' => $request['location'] ?? null,
            'start_at' => $request['start_at'] ?? null,
            'end_at' => $request['end_at'] ?? null,
            'is_all_day' => isset($request['is_all_day']) ? (bool) $request['is_all_day'] : null,
            'recurrence' => $request['recurrence'] ?? null,
            'reminder_at' => $request['reminder_at'] ?? null,
            'color' => $request['color'] ?? null,
        ], fn ($v) => $v !== null);

        if (! empty($fields)) {
            $event->update($fields);
        }

        if (isset($request['attendee_ids'])) {
            $attendeeIds = is_array($request['attendee_ids'])
                ? $request['attendee_ids']
                : [$request['attendee_ids']];

            $attendeeIds = array_values(array_unique(array_map('intval', $attendeeIds)));

            if ($attendeeIds === []) {
                $event->attendees()->sync([]);
            } else {
                $validAttendeeIds = User::query()
                    ->where('family_id', $this->user->family_id)
                    ->whereIn('id', $attendeeIds)
                    ->pluck('id')
                    ->all();

                sort($attendeeIds);
                sort($validAttendeeIds);

                if ($attendeeIds !== $validAttendeeIds) {
                    $invalidIds = array_values(array_diff($attendeeIds, $validAttendeeIds));

                    return 'Error: some attendee IDs are invalid for this family: '.implode(', ', $invalidIds).'.';
                }

                $event->attendees()->sync($validAttendeeIds);
            }
        }

        return "✓ Event updated: \"{$event->title}\" (ID: {$event->id})";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'event_id' => $schema->integer()->description('ID of the event to edit')->required(),
            'title' => $schema->string()->description('New event title'),
            'start_at' => $schema->string()->description('New start datetime ISO 8601'),
            'end_at' => $schema->string()->description('New end datetime ISO 8601'),
            'description' => $schema->string()->description('New description'),
            'location' => $schema->string()->description('New location'),
            'is_all_day' => $schema->boolean()->description('Whether this is an all-day event'),
            'recurrence' => $schema->string()->description('Recurrence pattern: daily, weekly, or monthly'),
            'reminder_at' => $schema->string()->description('New reminder datetime ISO 8601'),
            'color' => $schema->string()->description('New hex color code, e.g. #6366f1'),
            'attendee_ids' => $schema->array()->description('List of family member user IDs to set as attendees (replaces existing)'),
        ];
    }
}
