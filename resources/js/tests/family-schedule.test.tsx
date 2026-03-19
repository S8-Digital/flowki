import { buildColumns } from '@/components/Calendar/FamilyScheduleView';
import MemberColumn, { getInitials, getMemberColor, MEMBER_COLORS } from '@/components/Calendar/MemberColumn';
import type { CalendarEvent, Chore, FamilyScheduleColumn, Todo, User } from '@/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const baseUser: User = {
    id: 1,
    name: 'Alice Smith',
    email: 'alice@example.com',
    family_id: 1,
    email_verified_at: '2024-01-01T00:00:00.000000Z',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
};

const baseEvent: CalendarEvent = {
    id: 1,
    title: 'Team Meeting',
    description: null,
    location: 'Office',
    start_at: '2024-06-15T10:00:00+00:00',
    end_at: '2024-06-15T11:00:00+00:00',
    is_all_day: false,
    recurrence: null,
    reminder_at: null,
    color: '#6366f1',
    family_id: 1,
    attendees: [{ ...baseUser }],
    creator: { ...baseUser },
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
};

const baseTodo: Todo = {
    id: 1,
    title: 'Buy groceries',
    description: null,
    category: 'personal',
    priority: 'medium',
    status: 'pending',
    due_date: '2024-06-15T09:00',
    family_id: 1,
    assignee: { ...baseUser },
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
};

const baseChore: Chore = {
    id: 1,
    title: 'Vacuum living room',
    description: null,
    frequency: 'weekly',
    next_due_date: '2024-06-15T08:00',
    family_id: 1,
    assignees: [{ ...baseUser }],
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
};

function makeColumn(overrides: Partial<FamilyScheduleColumn> = {}): FamilyScheduleColumn {
    return {
        user: baseUser,
        colorIndex: 0,
        events: [],
        allDayEvents: [],
        todos: [],
        chores: [],
        totalItems: 0,
        completedItems: 0,
        completionPct: 0,
        ...overrides,
    };
}

describe('getInitials', () => {
    it('returns first letters of first and last name', () => {
        expect(getInitials('Alice Smith')).toBe('AS');
    });

    it('returns single letter for single-word name', () => {
        expect(getInitials('Alice')).toBe('A');
    });

    it('returns max 2 characters', () => {
        expect(getInitials('Alice Bob Charlie')).toBe('AB');
    });
});

describe('getMemberColor', () => {
    it('returns the user profile_color when valid 6-digit hex', () => {
        const user = { ...baseUser, profile_color: '#ff0000' };
        expect(getMemberColor(user, 0)).toBe('#ff0000');
    });

    it('falls back to MEMBER_COLORS when profile_color is null', () => {
        const user = { ...baseUser, profile_color: null };
        expect(getMemberColor(user, 0)).toBe(MEMBER_COLORS[0]);
    });

    it('falls back to MEMBER_COLORS when profile_color is invalid', () => {
        const user = { ...baseUser, profile_color: 'not-a-color' };
        expect(getMemberColor(user, 2)).toBe(MEMBER_COLORS[2]);
    });

    it('falls back to MEMBER_COLORS for short 3-digit hex', () => {
        const user = { ...baseUser, profile_color: '#fff' };
        expect(getMemberColor(user, 1)).toBe(MEMBER_COLORS[1]);
    });

    it('cycles through MEMBER_COLORS based on index', () => {
        const user = { ...baseUser, profile_color: null };
        expect(getMemberColor(user, MEMBER_COLORS.length)).toBe(MEMBER_COLORS[0]);
    });
});

describe('MemberColumn', () => {
    it('renders member name and initials', () => {
        render(<MemberColumn column={makeColumn()} />);
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.getByText('AS')).toBeInTheDocument();
    });

    it('shows "Nothing scheduled" when column is empty', () => {
        render(<MemberColumn column={makeColumn()} />);
        expect(screen.getByText('Nothing scheduled')).toBeInTheDocument();
    });

    it('renders timed events', () => {
        const column = makeColumn({
            events: [baseEvent],
            totalItems: 1,
        });
        render(<MemberColumn column={column} />);
        expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    });

    it('renders todos with status', () => {
        const column = makeColumn({
            todos: [baseTodo],
            totalItems: 1,
        });
        render(<MemberColumn column={column} />);
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
        expect(screen.getByText('medium priority')).toBeInTheDocument();
    });

    it('renders completed todo with line-through', () => {
        const completedTodo = { ...baseTodo, status: 'completed' };
        const column = makeColumn({
            todos: [completedTodo],
            totalItems: 1,
            completedItems: 1,
            completionPct: 100,
        });
        render(<MemberColumn column={column} />);
        const titleEl = screen.getByText('Buy groceries');
        expect(titleEl).toHaveClass('line-through');
    });

    it('renders chores', () => {
        const column = makeColumn({
            chores: [baseChore],
            totalItems: 1,
        });
        render(<MemberColumn column={column} />);
        expect(screen.getByText('Vacuum living room')).toBeInTheDocument();
        expect(screen.getByText('weekly')).toBeInTheDocument();
    });

    it('shows item count in header', () => {
        const column = makeColumn({
            todos: [baseTodo],
            totalItems: 1,
        });
        render(<MemberColumn column={column} />);
        expect(screen.getByText('1 item')).toBeInTheDocument();
    });

    it('shows progress bar when items exist', () => {
        const column = makeColumn({
            todos: [baseTodo],
            totalItems: 1,
            completedItems: 0,
            completionPct: 0,
        });
        render(<MemberColumn column={column} />);
        expect(screen.getByText('0 done')).toBeInTheDocument();
        expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('calls onEventClick when an event is clicked', async () => {
        const onEventClick = vi.fn();
        const column = makeColumn({ events: [baseEvent], totalItems: 1 });
        render(<MemberColumn column={column} onEventClick={onEventClick} />);
        await userEvent.click(screen.getByText('Team Meeting'));
        expect(onEventClick).toHaveBeenCalledWith(baseEvent);
    });

    it('calls onTodoClick when a todo is clicked', async () => {
        const onTodoClick = vi.fn();
        const column = makeColumn({ todos: [baseTodo], totalItems: 1 });
        render(<MemberColumn column={column} onTodoClick={onTodoClick} />);
        await userEvent.click(screen.getByText('Buy groceries'));
        expect(onTodoClick).toHaveBeenCalledWith(baseTodo);
    });

    it('calls onChoreClick when a chore is clicked', async () => {
        const onChoreClick = vi.fn();
        const column = makeColumn({ chores: [baseChore], totalItems: 1 });
        render(<MemberColumn column={column} onChoreClick={onChoreClick} />);
        await userEvent.click(screen.getByText('Vacuum living room'));
        expect(onChoreClick).toHaveBeenCalledWith(baseChore);
    });
});

describe('buildColumns', () => {
    const date = '2024-06-15';
    const member2: User = { ...baseUser, id: 2, name: 'Bob Jones' };

    it('groups events by attendee', () => {
        const columns = buildColumns([baseUser], [baseEvent], [], [], date);
        expect(columns).toHaveLength(1);
        expect(columns[0].events).toHaveLength(1);
        expect(columns[0].events[0].id).toBe(1);
        expect(columns[0].colorIndex).toBe(0);
    });

    it('excludes events for the wrong date', () => {
        const wrongDateEvent: CalendarEvent = { ...baseEvent, start_at: '2024-06-16T10:00:00+00:00' };
        const columns = buildColumns([baseUser], [wrongDateEvent], [], [], date);
        expect(columns[0].events).toHaveLength(0);
    });

    it('groups todos by assignee', () => {
        const columns = buildColumns([baseUser], [], [baseTodo], [], date);
        expect(columns[0].todos).toHaveLength(1);
    });

    it('does not include other member todos', () => {
        const columns = buildColumns([member2], [], [baseTodo], [], date);
        expect(columns[0].todos).toHaveLength(0);
    });

    it('groups chores by assignee', () => {
        const columns = buildColumns([baseUser], [], [], [baseChore], date);
        expect(columns[0].chores).toHaveLength(1);
    });

    it('calculates totalItems correctly', () => {
        const columns = buildColumns([baseUser], [baseEvent], [baseTodo], [baseChore], date);
        expect(columns[0].totalItems).toBe(3);
    });

    it('calculates completionPct for completed todos', () => {
        const completedTodo = { ...baseTodo, status: 'completed' };
        const columns = buildColumns([baseUser], [], [completedTodo], [], date);
        expect(columns[0].completionPct).toBe(100);
    });

    it('returns 0% completion when no items', () => {
        const columns = buildColumns([baseUser], [], [], [], date);
        expect(columns[0].completionPct).toBe(0);
    });

    it('separates all-day events from timed events', () => {
        const allDayEvent: CalendarEvent = { ...baseEvent, id: 2, is_all_day: true };
        const columns = buildColumns([baseUser], [baseEvent, allDayEvent], [], [], date);
        expect(columns[0].events).toHaveLength(1);
        expect(columns[0].allDayEvents).toHaveLength(1);
    });
});
