<?php

namespace App\Ai\Tools;

use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class DeleteEvent implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Delete a calendar event. Call this when the user asks to remove, cancel, or delete an event. Use list_events to find the event ID first.';
    }

    public function handle(Request $request): string
    {
        $event = CalendarEvent::query()
            ->forFamily($this->user->family_id)
            ->find($request['event_id']);

        if (! $event) {
            return 'Error: event not found. Use list_events to find the correct event ID.';
        }

        $title = $event->title;
        $event->delete();

        return "✓ Event deleted: \"{$title}\"";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'event_id' => $schema->integer()->description('ID of the event to delete')->required(),
        ];
    }
}
