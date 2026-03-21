<?php

namespace App\Mcp\Tools;

use App\Models\CalendarEvent;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Auth;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('List calendar events for the authenticated user\'s family, with optional date range filters.')]
class ListEventsTool extends Tool
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

        $events = CalendarEvent::query()
            ->forFamily($user->family_id)
            ->when(! empty($input['from']), fn ($q) => $q->where('start_at', '>=', $input['from']))
            ->when(! empty($input['to']), fn ($q) => $q->where('start_at', '<=', $input['to']))
            ->orderBy('start_at')
            ->limit(20)
            ->get();

        if ($events->isEmpty()) {
            return Response::text('No events found matching those criteria.');
        }

        $lines = $events->map(function (CalendarEvent $event) {
            $date = $event->is_all_day
                ? $event->start_at->toDateString()
                : $event->start_at->toDateTimeString();
            $location = $event->location ? " @ {$event->location}" : '';

            return "• {$event->title} on {$date}{$location}";
        });

        return Response::text("Events ({$events->count()}):\n".$lines->implode("\n"));
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'from' => $schema->string()->description('Filter events from this date/datetime (ISO 8601)'),
            'to' => $schema->string()->description('Filter events up to this date/datetime (ISO 8601)'),
        ];
    }
}
