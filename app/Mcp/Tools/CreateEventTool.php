<?php

namespace App\Mcp\Tools;

use App\Models\CalendarEvent;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Auth;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Create a new calendar event for the authenticated user\'s family.')]
class CreateEventTool extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $user = Auth::user();

        if (! $user?->family_id) {
            return Response::text('Error: User is not part of a family.');
        }

        $input = $request->all();

        if (empty($input['title']) || empty($input['start_at'])) {
            return Response::text('Error: title and start_at are required.');
        }

        $event = CalendarEvent::create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => $input['title'],
            'description' => $input['description'] ?? null,
            'location' => $input['location'] ?? null,
            'start_at' => $input['start_at'],
            'end_at' => $input['end_at'] ?? null,
            'is_all_day' => ! empty($input['is_all_day']),
        ]);

        return Response::text("Event created: \"{$event->title}\" on {$event->start_at->toDateTimeString()}");
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->description('The event title')->required(),
            'start_at' => $schema->string()->description('Start datetime in ISO 8601 format, e.g. 2026-03-15T14:00:00')->required(),
            'end_at' => $schema->string()->description('End datetime in ISO 8601 format'),
            'description' => $schema->string()->description('Optional description or notes'),
            'location' => $schema->string()->description('Optional location'),
            'is_all_day' => $schema->boolean()->description('Whether this is an all-day event'),
        ];
    }
}
