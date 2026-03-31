import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { useMemo } from 'react';
import MemberColumn from '@/components/Calendar/MemberColumn';
import type { CalendarEvent, Chore, FamilyScheduleColumn, Todo, User } from '@/types';

interface Props {
    members: User[];
    events: CalendarEvent[];
    todos: Todo[];
    chores: Chore[];
    selectedDate: string;
    hiddenMembers: Set<number>;
    toggleMember: (memberId: number) => void;
    onEventClick?: (event: CalendarEvent) => void;
    onTodoClick?: (todo: Todo) => void;
    onChoreClick?: (chore: Chore) => void;
}

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

export function FamilyScheduleView({ members, events, todos, chores, selectedDate, hiddenMembers, onEventClick, onTodoClick, onChoreClick }: Props) {
    const columns = useMemo(() => buildColumns(members, events, todos, chores, selectedDate), [members, events, todos, chores, selectedDate]);
    const visibleColumns = columns.filter((col) => !hiddenMembers.has(col.user.id));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
