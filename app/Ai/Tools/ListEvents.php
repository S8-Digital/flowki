<?php

namespace App\Ai\Tools;

use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class ListEvents implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'List upcoming calendar events for the family. Call this when the user asks about appointments, events, or the family schedule.';
    }

    public function handle(Request $request): string
    {
        $events = CalendarEvent::query()
            ->forFamily($this->user->family_id)
            ->when(
                $request['from'] ?? null,
                fn ($q) => $q->where('start_at', '>=', $request['from'])
            )
            ->when(
                $request['to'] ?? null,
                fn ($q) => $q->where('start_at', '<=', $request['to'])
            )
            ->orderBy('start_at')
            ->limit(20)
            ->get();

        if ($events->isEmpty()) {
            return 'No events found matching that criteria.';
        }

        return $events->map(function (CalendarEvent $event) {
            $date = $event->is_all_day
                ? $event->start_at->toDateString()
                : $event->start_at->toDateTimeString();
            $location = $event->location ? " @ {$event->location}" : '';

            return "• [ID:{$event->id}] {$event->title} on {$date}{$location}";
        })->implode("\n");
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'from' => $schema->string()->description('Filter events from this date/datetime (ISO 8601)'),
            'to' => $schema->string()->description('Filter events up to this date/datetime (ISO 8601)'),
        ];
    }
}
