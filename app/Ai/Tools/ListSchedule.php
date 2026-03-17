<?php

namespace App\Ai\Tools;

use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class ListSchedule implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'List the personal schedule shifts for the current user (e.g. imported work schedule or roster). '
            .'Use this when the user asks about their work schedule, shifts, roster, or personal calendar entries. '
            .'Optionally filter by date range.';
    }

    public function handle(Request $request): string
    {
        $events = CalendarEvent::query()
            ->forFamily($this->user->family_id)
            ->whereHas('attendees', fn ($q) => $q->where('users.id', $this->user->id))
            ->when(! empty($request['from']), fn ($q) => $q->where('start_at', '>=', $request['from']))
            ->when(! empty($request['to']), fn ($q) => $q->where('start_at', '<=', $request['to']))
            ->orderBy('start_at')
            ->limit(50)
            ->get();

        if ($events->isEmpty()) {
            return 'No schedule shifts found for the requested period.';
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

        return "Schedule shifts ({$events->count()}):\n".$lines->implode("\n");
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'from' => $schema->string()->description('Filter shifts from this date (ISO 8601), e.g. 2026-03-17'),
            'to' => $schema->string()->description('Filter shifts up to this date (ISO 8601), e.g. 2026-03-31'),
        ];
    }
}
