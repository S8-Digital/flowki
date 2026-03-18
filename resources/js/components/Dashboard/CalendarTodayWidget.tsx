import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--muted-foreground)' }}>{today}</Typography>
            {events.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Nothing scheduled for today.</Box>
            ) : (
                <Stack spacing={1} component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                    {events.map((event) => {
                        const color = safeColor(event.color, '#3282b0');

                        return (
                            <Box
                                component="li"
                                key={event.id}
                                sx={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden', borderRadius: 2, p: 1.5 }}
                                style={{ border: `2px solid ${color}`, backgroundColor: `${color}18` }}
                            >
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                        }}
                                    >
                                        {event.title}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                                        {event.is_all_day
                                            ? 'All day'
                                            : `${formatTime(event.start_at)}${event.end_at ? ` – ${formatTime(event.end_at)}` : ''}`}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
}
