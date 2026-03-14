interface CalendarEventItem {
    id: number;
    title: string;
    start_at: string;
    end_at: string | null;
    is_all_day: boolean;
    color: string | null;
    location: string | null;
}

interface CalendarScheduleWidgetProps {
    events: CalendarEventItem[];
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(value: string): string {
    return new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function CalendarScheduleWidget({ events }: CalendarScheduleWidgetProps) {
    return (
        <div className="flex flex-col gap-2">
            {events.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No upcoming events in the next 14 days.</div>
            ) : (
                <ul className="space-y-2">
                    {events.map((event) => (
                        <li key={event.id} className="flex items-start gap-3 rounded-lg border p-3">
                            <div className="mt-0.5 size-2.5 shrink-0 rounded-full" style={{ backgroundColor: event.color ?? '#6366f1' }} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{event.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(event.start_at)}
                                    {!event.is_all_day && ` · ${formatTime(event.start_at)}`}
                                    {event.location && ` · ${event.location}`}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
