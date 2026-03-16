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

function safeColor(color: string | null, fallback: string): string {
    if (!color) {
        return fallback;
    }

    return /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : fallback;
}

export default function CalendarTodayWidget({ events }: CalendarTodayWidgetProps) {
    return (
        <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">{today}</p>
            {events.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Nothing scheduled for today.</div>
            ) : (
                <ul className="space-y-2">
                    {events.map((event) => {
                        const color = safeColor(event.color, '#3282b0');

                        return (
                            <li
                                key={event.id}
                                className="flex items-center gap-3 overflow-hidden rounded-lg p-3"
                                style={{ borderLeft: `3px solid ${color}`, backgroundColor: `${color}18` }}
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{event.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {event.is_all_day
                                            ? 'All day'
                                            : `${formatTime(event.start_at)}${event.end_at ? ` – ${formatTime(event.end_at)}` : ''}`}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
