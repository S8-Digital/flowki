import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import MemberColumn, { getMemberColor } from '@/components/Calendar/MemberColumn';
import { Button } from '@/components/ui/button';
import { DateTimeInput } from '@/components/ui/datetime-input';
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

function shiftDate(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function localToday(): string {
    const d = new Date();

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const MemberToggle = styled(ButtonBase)({
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
});

const EmptyStateBox = styled(Box)(({ theme }) => ({
    borderRadius: (theme.shape.borderRadius as number) * 3,
    border: `1px solid ${theme.palette.divider}`,
    textAlign: 'center',
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
}));

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Date navigation */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Button variant="outline" size="icon" onClick={() => onDateChange(shiftDate(selectedDate, -1))} aria-label="Previous day">
                        <ChevronLeft style={{ width: 16, height: 16 }} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDateChange(localToday())}>
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onDateChange(shiftDate(selectedDate, 1))} aria-label="Next day">
                        <ChevronRight style={{ width: 16, height: 16 }} />
                    </Button>
                </Box>

                <DateTimeInput
                    type="date"
                    label="Selected Date"
                    value={dayjs(selectedDate)}
                    onChange={(value) => onDateChange(value?.format('YYYY-MM-DD') ?? '')}
                    slotProps={{ textField: { size: 'small', inputProps: { 'aria-label': 'Select date' }, color: 'primary' } }}
                />

                {/* Member toggles */}
                <Box sx={{ ml: 'auto', display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {members.map((member, idx) => {
                        const color = getMemberColor(member, idx);
                        const hidden = hiddenMembers.has(member.id);

                        return (
                            <MemberToggle
                                key={member.id}
                                onClick={() => toggleMember(member.id)}
                                aria-pressed={!hidden}
                                title={hidden ? `Show ${member.name}` : `Hide ${member.name}`}
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5 }}
                                style={{
                                    opacity: hidden ? 0.4 : 1,
                                    color: hidden ? 'inherit' : color,
                                    backgroundColor: hidden ? 'transparent' : `${color}15`,
                                    border: `1px solid ${color}`,
                                }}
                            >
                                {hidden ? <EyeOff style={{ width: 12, height: 12 }} /> : <Eye style={{ width: 12, height: 12 }} />}
                                {member.name}
                            </MemberToggle>
                        );
                    })}
                </Box>
            </Box>

            {/* Columns */}
            {visibleColumns.length === 0 ? (
                <EmptyStateBox sx={{ py: 8 }}>No members visible. Toggle members above to show their schedules.</EmptyStateBox>
            ) : (
                <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                    {visibleColumns.map((column) => (
                        <MemberColumn
                            key={column.user.id}
                            column={column}
                            onEventClick={onEventClick}
                            onTodoClick={onTodoClick}
                            onChoreClick={onChoreClick}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}

export { buildColumns };
