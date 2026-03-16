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
        <div className="flex max-w-[280px] min-w-[220px] flex-1 flex-col overflow-hidden rounded-xl border">
            {/* Header */}
            <div className="flex flex-col gap-1 p-3" style={{ backgroundColor: `${color}22`, borderBottom: `3px solid ${color}` }}>
                <div className="flex items-center gap-2">
                    <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: color }}
                        aria-label={user.name}
                    >
                        {getInitials(user.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {totalItems} item{totalItems !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                {totalItems > 0 && (
                    <div className="mt-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{completedItems} done</span>
                            <span>{completionPct}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{ width: `${completionPct}%`, backgroundColor: color }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Items */}
            <div className="flex-1 space-y-1 overflow-y-auto p-2">
                {isEmpty && <p className="py-6 text-center text-xs text-muted-foreground">Nothing scheduled</p>}

                {/* Timed events */}
                {events.map((event) => (
                    <button
                        key={`event-${event.id}`}
                        type="button"
                        onClick={() => onEventClick?.(event)}
                        className="w-full rounded-lg p-2 text-left text-xs transition-opacity hover:opacity-80"
                        style={{ backgroundColor: `${event.color ?? color}22`, borderLeft: `3px solid ${event.color ?? color}` }}
                    >
                        <div className="flex items-center gap-1">
                            <Clock className="size-3 shrink-0" style={{ color: event.color ?? color }} />
                            <span className="truncate font-medium">{event.title}</span>
                        </div>
                        <p className="mt-0.5 text-muted-foreground">
                            {formatTime(event.start_at)}
                            {event.end_at ? ` – ${formatTime(event.end_at)}` : ''}
                        </p>
                        {event.location && <p className="mt-0.5 truncate text-muted-foreground">{event.location}</p>}
                    </button>
                ))}

                {/* All-day events */}
                {allDayEvents.map((event) => (
                    <button
                        key={`allday-${event.id}`}
                        type="button"
                        onClick={() => onEventClick?.(event)}
                        className="w-full rounded-lg p-2 text-left text-xs transition-opacity hover:opacity-80"
                        style={{ backgroundColor: `${event.color ?? color}22`, borderLeft: `3px solid ${event.color ?? color}` }}
                    >
                        <div className="flex items-center gap-1">
                            <span className="truncate font-medium">{event.title}</span>
                        </div>
                        <p className="mt-0.5 text-muted-foreground">All day</p>
                    </button>
                ))}

                {/* Todos */}
                {todos.map((todo) => (
                    <button
                        key={`todo-${todo.id}`}
                        type="button"
                        onClick={() => onTodoClick?.(todo)}
                        className="w-full rounded-lg p-2 text-left text-xs transition-opacity hover:opacity-80"
                        style={{
                            backgroundColor: todo.status === 'completed' ? '#9ca3af22' : '#f59e0b22',
                            borderLeft: `3px solid ${todo.status === 'completed' ? '#9ca3af' : '#f59e0b'}`,
                        }}
                    >
                        <div className="flex items-center gap-1">
                            {todo.status === 'completed' ? (
                                <CheckCircle2 className="size-3 shrink-0 text-muted-foreground" />
                            ) : (
                                <Circle className="size-3 shrink-0 text-amber-500" />
                            )}
                            <span className={`truncate font-medium ${todo.status === 'completed' ? 'text-muted-foreground line-through' : ''}`}>
                                {todo.title}
                            </span>
                        </div>
                        {todo.due_date && <p className="mt-0.5 text-muted-foreground">{formatTime(todo.due_date)}</p>}
                        <p className="mt-0.5 text-muted-foreground capitalize">{todo.priority} priority</p>
                    </button>
                ))}

                {/* Chores */}
                {chores.map((chore) => (
                    <button
                        key={`chore-${chore.id}`}
                        type="button"
                        onClick={() => onChoreClick?.(chore)}
                        className="w-full rounded-lg p-2 text-left text-xs transition-opacity hover:opacity-80"
                        style={{ backgroundColor: '#10b98122', borderLeft: '3px solid #10b981' }}
                    >
                        <div className="flex items-center gap-1">
                            <RefreshCw className="size-3 shrink-0 text-emerald-500" />
                            <span className="truncate font-medium">{chore.title}</span>
                        </div>
                        {chore.next_due_date && <p className="mt-0.5 text-muted-foreground">{formatTime(chore.next_due_date)}</p>}
                        <p className="mt-0.5 text-muted-foreground capitalize">{chore.frequency}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
