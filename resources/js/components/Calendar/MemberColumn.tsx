import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
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

/** Shared sx styles for clickable item cards inside a member column */
const itemCardSx = {
    width: '100%',
    borderRadius: 2,
    p: 1,
    textAlign: 'left',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    '&:hover': { opacity: 0.8 },
} as const;

export default function MemberColumn({ column, onEventClick, onTodoClick, onChoreClick }: Props) {
    const { user, events, allDayEvents, todos, chores, totalItems, completedItems, completionPct, colorIndex } = column;
    const color = getMemberColor(user, colorIndex);
    const isEmpty = totalItems === 0;

    return (
        <Box
            sx={{
                display: 'flex',
                maxWidth: 280,
                minWidth: 220,
                flex: 1,
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
            }}
        >
            {/* Header */}
            <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 1.5 }}
                style={{ backgroundColor: `${color}22`, borderBottom: `3px solid ${color}` }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            width: 32,
                            height: 32,
                            flexShrink: 0,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#fff',
                        }}
                        style={{ backgroundColor: color }}
                        aria-label={user.name}
                    >
                        {getInitials(user.name)}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: 600 }}
                        >
                            {user.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {totalItems} item{totalItems !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                </Box>
                {totalItems > 0 && (
                    <Box sx={{ mt: 0.5 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.75rem',
                                color: 'text.secondary',
                            }}
                        >
                            <Box component="span">{completedItems} done</Box>
                            <Box component="span">{completionPct}%</Box>
                        </Box>
                        <Box sx={{ mt: 0.5, height: 6, width: '100%', overflow: 'hidden', borderRadius: '9999px', bgcolor: 'action.selected' }}>
                            <Box
                                sx={{ height: '100%', borderRadius: '9999px', transition: 'all 0.3s' }}
                                style={{ width: `${completionPct}%`, backgroundColor: color }}
                            />
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Items */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {isEmpty && (
                    <Typography sx={{ py: 3, textAlign: 'center', fontSize: '0.75rem', color: 'text.secondary' }}>
                        Nothing scheduled
                    </Typography>
                )}

                {/* Timed events */}
                {events.map((event) => (
                    <ButtonBase
                        key={`event-${event.id}`}
                        onClick={() => onEventClick?.(event)}
                        sx={{
                            ...itemCardSx,
                            backgroundColor: `${event.color ?? color}22`,
                            borderLeft: `3px solid ${event.color ?? color}`,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Clock style={{ width: 12, height: 12, flexShrink: 0, color: event.color ?? color }} />
                            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                {event.title}
                            </Box>
                        </Box>
                        <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: '0.75rem' }}>
                            {formatTime(event.start_at)}
                            {event.end_at ? ` – ${formatTime(event.end_at)}` : ''}
                        </Typography>
                        {event.location && (
                            <Typography
                                sx={{
                                    mt: 0.25,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    color: 'text.secondary',
                                    fontSize: '0.75rem',
                                }}
                            >
                                {event.location}
                            </Typography>
                        )}
                    </ButtonBase>
                ))}

                {/* All-day events */}
                {allDayEvents.map((event) => (
                    <ButtonBase
                        key={`allday-${event.id}`}
                        onClick={() => onEventClick?.(event)}
                        sx={{
                            ...itemCardSx,
                            backgroundColor: `${event.color ?? color}22`,
                            borderLeft: `3px solid ${event.color ?? color}`,
                        }}
                    >
                        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                            {event.title}
                        </Box>
                        <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: '0.75rem' }}>All day</Typography>
                    </ButtonBase>
                ))}

                {/* Todos */}
                {todos.map((todo) => (
                    <ButtonBase
                        key={`todo-${todo.id}`}
                        onClick={() => onTodoClick?.(todo)}
                        sx={{
                            ...itemCardSx,
                            backgroundColor: todo.status === 'completed' ? 'action.disabledBackground' : 'var(--mui-palette-warning-main)22',
                            borderLeft: `3px solid ${todo.status === 'completed' ? 'var(--mui-palette-action-disabled)' : 'var(--mui-palette-warning-main)'}`,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {todo.status === 'completed' ? (
                                <CheckCircle2 style={{ width: 12, height: 12, flexShrink: 0, color: 'var(--mui-palette-text-secondary)' }} />
                            ) : (
                                <Circle style={{ width: 12, height: 12, flexShrink: 0, color: 'var(--mui-palette-warning-main)' }} />
                            )}
                            <Box
                                component="span"
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontWeight: 500,
                                    ...(todo.status === 'completed'
                                        ? { color: 'text.secondary', textDecoration: 'line-through' }
                                        : {}),
                                }}
                            >
                                {todo.title}
                            </Box>
                        </Box>
                        {todo.due_date && (
                            <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: '0.75rem' }}>
                                {formatTime(todo.due_date)}
                            </Typography>
                        )}
                        <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                            {todo.priority} priority
                        </Typography>
                    </ButtonBase>
                ))}

                {/* Chores */}
                {chores.map((chore) => (
                    <ButtonBase
                        key={`chore-${chore.id}`}
                        onClick={() => onChoreClick?.(chore)}
                        sx={{
                            ...itemCardSx,
                            backgroundColor: 'var(--mui-palette-success-main)22',
                            borderLeft: '3px solid var(--mui-palette-success-main)',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <RefreshCw style={{ width: 12, height: 12, flexShrink: 0, color: 'var(--mui-palette-success-main)' }} />
                            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                {chore.title}
                            </Box>
                        </Box>
                        {chore.next_due_date && (
                            <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: '0.75rem' }}>
                                {formatTime(chore.next_due_date)}
                            </Typography>
                        )}
                        <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                            {chore.frequency}
                        </Typography>
                    </ButtonBase>
                ))}
            </Box>
        </Box>
    );
}
