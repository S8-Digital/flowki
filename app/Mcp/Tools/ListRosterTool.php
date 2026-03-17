<?php

namespace App\Mcp\Tools;

use App\Models\CalendarEvent;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Auth;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('List calendar events for the authenticated user filtered by attendee (i.e. their personal schedule / imported roster shifts), with optional date range filters.')]
class ListRosterTool extends Tool
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

        $input = $request->input();

        $events = CalendarEvent::query()
            ->forFamily($user->family_id)
            ->whereHas('attendees', fn ($q) => $q->where('users.id', $user->id))
            ->when(! empty($input['from']), fn ($q) => $q->where('start_at', '>=', $input['from']))
            ->when(! empty($input['to']), fn ($q) => $q->where('start_at', '<=', $input['to']))
            ->orderBy('start_at')
            ->limit(50)
            ->get();

        if ($events->isEmpty()) {
            return Response::text('No schedule shifts found for the requested period.');
        }

        $lines = $events->map(function (CalendarEvent $event) {
            if ($event->is_all_day) {
                $time = $event->start_at->toDateString().' (all day)';
            } else {
                $time = $event->start_at->toDateTimeString();
                if ($event->end_at) {
                    $time .= ' – '.$event->end_at->toDateTimeString();
                }
            }

            return "• {$event->title} on {$time}";
        });

        return Response::text("Schedule shifts ({$events->count()}):\n".$lines->implode("\n"));
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'from' => $schema->string()->description('Filter shifts from this date/datetime (ISO 8601)'),
            'to' => $schema->string()->description('Filter shifts up to this date/datetime (ISO 8601)'),
        ];
    }
}
