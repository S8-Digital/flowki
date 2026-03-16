interface CalendarEventItem {
    id: number;
    title: string;
    start_at: string;
    end_at: string | null;
    is_all_day: boolean;
    color: string | null;
    location: string | null;
}

interface CalendarTodayWidgetProps {
    events: CalendarEventItem[];
}

function formatTime(value: string): string {
    return new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

export default function CalendarTodayWidget({ events }: CalendarTodayWidgetProps) {
    return (
        <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">{today}</p>
            {events.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Nothing scheduled for today.</div>
            ) : (
                <ul className="space-y-2">
                    {events.map((event) => (
                        <li key={event.id} className="flex items-center gap-3 rounded-lg border p-3">
                            <div className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: event.color ?? '#6366f1' }} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{event.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {event.is_all_day
                                        ? 'All day'
                                        : `${formatTime(event.start_at)}${event.end_at ? ` – ${formatTime(event.end_at)}` : ''}`}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
