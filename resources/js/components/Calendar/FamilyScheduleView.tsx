import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import MemberColumn, { getMemberColor } from '@/components/Calendar/MemberColumn';
import { Button } from '@/components/ui/button';
import type { CalendarEvent, Chore, FamilyScheduleColumn, Todo, User } from '@/types';

interface Props {
    members: User[];
    events: CalendarEvent[];
    todos: Todo[];
    chores: Chore[];
    selectedDate: string;
    onDateChange: (date: string) => void;
    onEventClick?: (event: CalendarEvent) => void;
    onTodoClick?: (todo: Todo) => void;
    onChoreClick?: (chore: Chore) => void;
}

function dateLabel(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (d.getTime() === today.getTime()) {
        return 'Today – ' + d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }

    if (d.getTime() === tomorrow.getTime()) {
        return 'Tomorrow – ' + d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }

    if (d.getTime() === yesterday.getTime()) {
        return 'Yesterday – ' + d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    }

    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function shiftDate(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function localToday(): string {
    const d = new Date();

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildColumns(members: User[], events: CalendarEvent[], todos: Todo[], chores: Chore[], date: string): FamilyScheduleColumn[] {
    return members.map((member, idx) => {
        const memberEvents = events.filter(
            (e) =>
                !e.is_all_day && e.start_at.split('T')[0] === date && (e.attendees?.some((a) => a.id === member.id) || e.creator?.id === member.id),
        );

        const memberAllDayEvents = events.filter(
            (e) => e.is_all_day && e.start_at.split('T')[0] === date && (e.attendees?.some((a) => a.id === member.id) || e.creator?.id === member.id),
        );

        const memberTodos = todos.filter((t) => t.due_date?.split('T')[0] === date && t.assignee?.id === member.id);

        const memberChores = chores.filter((c) => c.next_due_date?.split('T')[0] === date && c.assignees?.some((a) => a.id === member.id));

        const totalItems = memberEvents.length + memberAllDayEvents.length + memberTodos.length + memberChores.length;
        const completedItems = memberTodos.filter((t) => t.status === 'completed').length;
        const completionPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        return {
            user: member,
            colorIndex: idx,
            events: memberEvents,
            allDayEvents: memberAllDayEvents,
            todos: memberTodos,
            chores: memberChores,
            totalItems,
            completedItems,
            completionPct,
        };
    });
}

export default function FamilyScheduleView({
    members,
    events,
    todos,
    chores,
    selectedDate,
    onDateChange,
    onEventClick,
    onTodoClick,
    onChoreClick,
}: Props) {
    const [hiddenMembers, setHiddenMembers] = useState<Set<number>>(new Set());

    const columns = useMemo(() => buildColumns(members, events, todos, chores, selectedDate), [members, events, todos, chores, selectedDate]);

    const visibleColumns = columns.filter((col) => !hiddenMembers.has(col.user.id));

    function toggleMember(memberId: number) {
        setHiddenMembers((prev) => {
            const next = new Set(prev);

            if (next.has(memberId)) {
                next.delete(memberId);
            } else {
                next.add(memberId);
            }

            return next;
        });
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Date navigation */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={() => onDateChange(shiftDate(selectedDate, -1))} aria-label="Previous day">
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDateChange(localToday())} className="px-3">
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onDateChange(shiftDate(selectedDate, 1))} aria-label="Next day">
                        <ChevronRight className="size-4" />
                    </Button>
                </div>

                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    aria-label="Select date"
                />

                <p className="text-sm font-medium text-muted-foreground">{dateLabel(selectedDate)}</p>

                {/* Member toggles */}
                <div className="ml-auto flex flex-wrap gap-1">
                    {members.map((member, idx) => {
                        const color = getMemberColor(member, idx);
                        const hidden = hiddenMembers.has(member.id);

                        return (
                            <button
                                key={member.id}
                                type="button"
                                onClick={() => toggleMember(member.id)}
                                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${hidden ? 'opacity-40' : ''}`}
                                style={{ borderColor: color, color: hidden ? undefined : color, backgroundColor: hidden ? undefined : `${color}15` }}
                                aria-pressed={!hidden}
                                title={hidden ? `Show ${member.name}` : `Hide ${member.name}`}
                            >
                                {hidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                                {member.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Columns */}
            {visibleColumns.length === 0 ? (
                <div className="rounded-xl border py-16 text-center text-sm text-muted-foreground">
                    No members visible. Toggle members above to show their schedules.
                </div>
            ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {visibleColumns.map((column) => (
                        <MemberColumn
                            key={column.user.id}
                            column={column}
                            onEventClick={onEventClick}
                            onTodoClick={onTodoClick}
                            onChoreClick={onChoreClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export { buildColumns };
