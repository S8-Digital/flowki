import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

const DateLabel = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
}));

const EmptyStateBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
}));

const EventItem = styled('li')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    overflow: 'hidden',
    borderRadius: Number(theme.shape.borderRadius) * 2,
    padding: theme.spacing(1.5),
}));

const EventTitle = styled(Typography)({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    fontWeight: 500,
});

const EventMeta = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
}));

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <DateLabel>{today}</DateLabel>
            {events.length === 0 ? (
                <EmptyStateBox sx={{ py: 4 }}>Nothing scheduled for today.</EmptyStateBox>
            ) : (
                <Stack spacing={1} component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                    {events.map((event) => {
                        const color = safeColor(event.color, '#3282b0');

                        return (
                            <EventItem key={event.id} style={{ border: `2px solid ${color}`, backgroundColor: `${color}18` }}>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <EventTitle>{event.title}</EventTitle>
                                    <EventMeta>
                                        {event.is_all_day
                                            ? 'All day'
                                            : `${formatTime(event.start_at)}${event.end_at ? ` – ${formatTime(event.end_at)}` : ''}`}
                                    </EventMeta>
                                </Box>
                            </EventItem>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
}
