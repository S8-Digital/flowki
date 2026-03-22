import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { CheckCircle2, Circle, Clock, RefreshCw } from 'lucide-react';
import type { CalendarEvent, Chore, FamilyScheduleColumn, Todo } from '@/types';

interface Props {
    column: FamilyScheduleColumn;
    onEventClick?: (event: CalendarEvent) => void;
    onTodoClick?: (todo: Todo) => void;
    onChoreClick?: (chore: Chore) => void;
}

export const MEMBER_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'];

export function getMemberColor(user: { profile_color?: string | null }, index: number): string {
    if (user.profile_color && /^#[0-9a-fA-F]{6}$/.test(user.profile_color)) {
        return user.profile_color;
    }

    return MEMBER_COLORS[index % MEMBER_COLORS.length];
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatTime(value: string): string {
    return new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const ColumnBox = styled(Box)(({ theme }) => ({
    borderRadius: (theme.shape.borderRadius as number) * 3,
    border: `1px solid ${theme.palette.divider}`,
}));

const AvatarBox = styled(Box)({
    borderRadius: '50%',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#fff',
});

const UserNameText = styled(Typography)({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    fontWeight: 600,
});

const MetaText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
}));

const CapsMetaText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
    textTransform: 'capitalize',
}));

const ProgressStatsBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
}));

const ProgressTrack = styled(Box)(({ theme }) => ({
    height: 6,
    width: '100%',
    overflow: 'hidden',
    borderRadius: '9999px',
    backgroundColor: theme.palette.action.selected,
}));

const ProgressFill = styled(Box)({
    height: '100%',
    borderRadius: '9999px',
    transition: 'all 0.3s',
});

const ItemCard = styled(ButtonBase)(({ theme }) => ({
    width: '100%',
    borderRadius: (theme.shape.borderRadius as number) * 2,
    padding: theme.spacing(1),
    textAlign: 'left',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    '&:hover': { opacity: 0.8 },
}));

const ItemTitle = styled(Box, { shouldForwardProp: (prop) => prop !== 'completed' })<{ completed?: boolean }>(({ theme, completed }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 500,
    ...(completed && {
        color: theme.palette.text.secondary,
        textDecoration: 'line-through',
    }),
}));

const TruncatedMetaText = styled(Typography)(({ theme }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
}));

const EmptyText = styled(Typography)(({ theme }) => ({
    textAlign: 'center',
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
}));

export default function MemberColumn({ column, onEventClick, onTodoClick, onChoreClick }: Props) {
    const { user, events, allDayEvents, todos, chores, totalItems, completedItems, completionPct, colorIndex } = column;
    const color = getMemberColor(user, colorIndex);
    const isEmpty = totalItems === 0;
    const theme = useTheme();

    return (
        <ColumnBox
            sx={{
                display: 'flex',
                maxWidth: 280,
                minWidth: 220,
                flex: 1,
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 1.5 }}
                style={{ backgroundColor: `${color}22`, borderBottom: `3px solid ${color}` }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AvatarBox
                        sx={{
                            display: 'flex',
                            width: 32,
                            height: 32,
                            flexShrink: 0,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        style={{ backgroundColor: color }}
                        aria-label={user.name}
                    >
                        {getInitials(user.name)}
                    </AvatarBox>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <UserNameText>{user.name}</UserNameText>
                        <MetaText>
                            {totalItems} item{totalItems !== 1 ? 's' : ''}
                        </MetaText>
                    </Box>
                </Box>
                {totalItems > 0 && (
                    <Box sx={{ mt: 0.5 }}>
                        <ProgressStatsBox>
                            <Box component="span">{completedItems} done</Box>
                            <Box component="span">{completionPct}%</Box>
                        </ProgressStatsBox>
                        <ProgressTrack sx={{ mt: 0.5 }}>
                            <ProgressFill style={{ width: `${completionPct}%`, backgroundColor: color }} />
                        </ProgressTrack>
                    </Box>
                )}
            </Box>

            {/* Items */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {isEmpty && <EmptyText sx={{ py: 3 }}>Nothing scheduled</EmptyText>}

                {/* Timed events */}
                {events.map((event) => (
                    <ItemCard
                        key={`event-${event.id}`}
                        onClick={() => onEventClick?.(event)}
                        style={{
                            backgroundColor: `${event.color ?? color}22`,
                            borderLeft: `3px solid ${event.color ?? color}`,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Clock style={{ width: 12, height: 12, flexShrink: 0, color: event.color ?? color }} />
                            <ItemTitle>{event.title}</ItemTitle>
                        </Box>
                        <MetaText sx={{ mt: 0.25 }}>
                            {formatTime(event.start_at)}
                            {event.end_at ? ` – ${formatTime(event.end_at)}` : ''}
                        </MetaText>
                        {event.location && <TruncatedMetaText sx={{ mt: 0.25 }}>{event.location}</TruncatedMetaText>}
                    </ItemCard>
                ))}

                {/* All-day events */}
                {allDayEvents.map((event) => (
                    <ItemCard
                        key={`allday-${event.id}`}
                        onClick={() => onEventClick?.(event)}
                        style={{
                            backgroundColor: `${event.color ?? color}22`,
                            borderLeft: `3px solid ${event.color ?? color}`,
                        }}
                    >
                        <ItemTitle>{event.title}</ItemTitle>
                        <MetaText sx={{ mt: 0.25 }}>All day</MetaText>
                    </ItemCard>
                ))}

                {/* Todos */}
                {todos.map((todo) => (
                    <ItemCard
                        key={`todo-${todo.id}`}
                        onClick={() => onTodoClick?.(todo)}
                        style={{
                            backgroundColor: todo.status === 'completed' ? theme.palette.action.disabledBackground : `${color}22`,
                            borderLeft: `3px solid ${
                                todo.status === 'completed' ? 'var(--mui-palette-action-disabled)' : 'var(--mui-palette-warning-main)'
                            }`,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {todo.status === 'completed' ? (
                                <CheckCircle2 style={{ width: 12, height: 12, flexShrink: 0, color: 'var(--mui-palette-text-secondary)' }} />
                            ) : (
                                <Circle style={{ width: 12, height: 12, flexShrink: 0, color: 'var(--mui-palette-warning-main)' }} />
                            )}
                            <ItemTitle completed={todo.status === 'completed'}>{todo.title}</ItemTitle>
                        </Box>
                        {todo.due_date && <MetaText sx={{ mt: 0.25 }}>{formatTime(todo.due_date)}</MetaText>}
                        <CapsMetaText sx={{ mt: 0.25 }}>{todo.priority} priority</CapsMetaText>
                    </ItemCard>
                ))}

                {/* Chores */}
                {chores.map((chore) => (
                    <ItemCard
                        key={`chore-${chore.id}`}
                        onClick={() => onChoreClick?.(chore)}
                        style={{
                            backgroundColor: alpha(theme.palette.success.main, 0.13),
                            borderLeft: '3px solid var(--mui-palette-success-main)',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <RefreshCw style={{ width: 12, height: 12, flexShrink: 0, color: 'var(--mui-palette-success-main)' }} />
                            <ItemTitle>{chore.title}</ItemTitle>
                        </Box>
                        {chore.next_due_date && <MetaText sx={{ mt: 0.25 }}>{formatTime(chore.next_due_date)}</MetaText>}
                        <CapsMetaText sx={{ mt: 0.25 }}>{chore.frequency}</CapsMetaText>
                    </ItemCard>
                ))}
            </Box>
        </ColumnBox>
    );
}
