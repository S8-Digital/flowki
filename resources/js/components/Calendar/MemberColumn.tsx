import Box from '@mui/material/Box';
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
                border: '1px solid',
                borderColor: 'var(--border)',
            }}
        >
            {/* Header */}
            <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: '4px', p: 1.5 }}
                style={{ backgroundColor: `${color}22`, borderBottom: `3px solid ${color}` }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        <Typography sx={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
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
                                color: 'var(--muted-foreground)',
                            }}
                        >
                            <span>{completedItems} done</span>
                            <span>{completionPct}%</span>
                        </Box>
                        <Box sx={{ mt: 0.5, height: 6, width: '100%', overflow: 'hidden', borderRadius: '9999px', bgcolor: 'var(--muted)' }}>
                            <Box
                                sx={{ height: '100%', borderRadius: '9999px', transition: 'all 0.3s' }}
                                style={{ width: `${completionPct}%`, backgroundColor: color }}
                            />
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Items */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {isEmpty && (
                    <Typography sx={{ py: 3, textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                        Nothing scheduled
                    </Typography>
                )}

                {/* Timed events */}
                {events.map((event) => (
                    <button
                        key={`event-${event.id}`}
                        type="button"
                        onClick={() => onEventClick?.(event)}
                        style={{
                            width: '100%',
                            borderRadius: 8,
                            padding: 8,
                            textAlign: 'left',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            border: 'none',
                            transition: 'opacity 0.15s',
                            backgroundColor: `${event.color ?? color}22`,
                            borderLeft: `3px solid ${event.color ?? color}`,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock style={{ width: 12, height: 12, flexShrink: 0, color: event.color ?? color }} />
                            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                {event.title}
                            </Box>
                        </Box>
                        <Typography sx={{ mt: 0.25, color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>
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
                                    color: 'var(--muted-foreground)',
                                    fontSize: '0.75rem',
                                }}
                            >
                                {event.location}
                            </Typography>
                        )}
                    </button>
                ))}

                {/* All-day events */}
                {allDayEvents.map((event) => (
                    <button
                        key={`allday-${event.id}`}
                        type="button"
                        onClick={() => onEventClick?.(event)}
                        style={{
                            width: '100%',
                            borderRadius: 8,
                            padding: 8,
                            textAlign: 'left',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            border: 'none',
                            transition: 'opacity 0.15s',
                            backgroundColor: `${event.color ?? color}22`,
                            borderLeft: `3px solid ${event.color ?? color}`,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                {event.title}
                            </Box>
                        </Box>
                        <Typography sx={{ mt: 0.25, color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>All day</Typography>
                    </button>
                ))}

                {/* Todos */}
                {todos.map((todo) => (
                    <button
                        key={`todo-${todo.id}`}
                        type="button"
                        onClick={() => onTodoClick?.(todo)}
                        style={{
                            width: '100%',
                            borderRadius: 8,
                            padding: 8,
                            textAlign: 'left',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            border: 'none',
                            transition: 'opacity 0.15s',
                            backgroundColor: todo.status === 'completed' ? '#9ca3af22' : '#f59e0b22',
                            borderLeft: `3px solid ${todo.status === 'completed' ? '#9ca3af' : '#f59e0b'}`,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {todo.status === 'completed' ? (
                                <CheckCircle2 style={{ width: 12, height: 12, flexShrink: 0, color: 'var(--muted-foreground)' }} />
                            ) : (
                                <Circle style={{ width: 12, height: 12, flexShrink: 0, color: '#f59e0b' }} />
                            )}
                            <Box
                                component="span"
                                className={todo.status === 'completed' ? 'line-through' : undefined}
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontWeight: 500,
                                    ...(todo.status === 'completed' ? { color: 'var(--muted-foreground)' } : {}),
                                }}
                            >
                                {todo.title}
                            </Box>
                        </Box>
                        {todo.due_date && (
                            <Typography sx={{ mt: 0.25, color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>
                                {formatTime(todo.due_date)}
                            </Typography>
                        )}
                        <Typography sx={{ mt: 0.25, color: 'var(--muted-foreground)', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                            {todo.priority} priority
                        </Typography>
                    </button>
                ))}

                {/* Chores */}
                {chores.map((chore) => (
                    <button
                        key={`chore-${chore.id}`}
                        type="button"
                        onClick={() => onChoreClick?.(chore)}
                        style={{
                            width: '100%',
                            borderRadius: 8,
                            padding: 8,
                            textAlign: 'left',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            border: 'none',
                            transition: 'opacity 0.15s',
                            backgroundColor: '#10b98122',
                            borderLeft: '3px solid #10b981',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <RefreshCw style={{ width: 12, height: 12, flexShrink: 0, color: '#10b981' }} />
                            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                {chore.title}
                            </Box>
                        </Box>
                        {chore.next_due_date && (
                            <Typography sx={{ mt: 0.25, color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>
                                {formatTime(chore.next_due_date)}
                            </Typography>
                        )}
                        <Typography sx={{ mt: 0.25, color: 'var(--muted-foreground)', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                            {chore.frequency}
                        </Typography>
                    </button>
                ))}
            </Box>
        </Box>
    );
}
