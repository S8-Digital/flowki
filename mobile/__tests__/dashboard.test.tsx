/**
 * Tests for the mobile Dashboard (home) screen – mobile/app/(tabs)/index.tsx
 *
 * Covers:
 * - Greeting renders with first name
 * - Default widget cards are all visible
 * - Empty states per widget when RTDB returns no data
 * - Events/todos/chores/shopping items render when RTDB has data
 * - Weather widget loading state and successful render
 * - Widget reorder buttons (move-up / move-down)
 * - VoiceCommandBar is shown only for users with a family
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardScreen from '@/app/(tabs)/index';
import type { CalendarEvent, Chore, ShoppingList, Todo, WeatherData } from '@/lib/api';

let mockUser: { id: number; name: string | null; family_id: number | null } | null = {
    id: 1,
    name: 'Alice Smith',
    family_id: 42,
};

vi.mock('@/store', () => ({
    useAppSelector: vi.fn((selector: (s: { auth: { user: typeof mockUser } }) => unknown) =>
        selector({ auth: { user: mockUser } }),
    ),
}));

vi.mock('react-native-paper', async () => {
    const React = await import('react');

    const ActivityIndicator = ({ size }: { size?: string }) =>
        React.createElement('div', { 'data-testid': 'activity-indicator', 'data-size': size });

    const Card = Object.assign(
        ({
            children,
            style,
        }: {
            children?: React.ReactNode;
            style?: unknown;
        }) => React.createElement('div', { 'data-testid': 'widget-card', style }, children),
        {
            Content: ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children),
        },
    );

    return { ActivityIndicator, Card };
});

vi.mock('@/components/ThemedText', () => ({
    ThemedText: ({
        children,
        style,
        variant,
    }: {
        children?: React.ReactNode;
        style?: unknown;
        variant?: string;
    }) => React.createElement('span', { style, 'data-variant': variant }, children ?? null),
}));

vi.mock('@/components/ThemedView', () => ({
    ThemedView: ({ children }: { children?: React.ReactNode; style?: unknown }) =>
        React.createElement('div', {}, children ?? null),
}));

vi.mock('@/components/VoiceCommandBar', () => ({
    VoiceCommandBar: () => React.createElement('div', { 'data-testid': 'voice-command-bar' }),
}));

vi.mock('@/constants/Colors', () => ({
    Colors: {
        light: { tint: '#3B82F6', card: '#F3F4F6', border: '#E5E7EB', muted: '#6B7280' },
        dark: { tint: '#3B82F6', card: '#151718', border: '#374151', muted: '#9CA3AF' },
    },
}));

vi.mock('@/hooks/useColorScheme', () => ({
    useColorScheme: () => 'light',
}));

const { mockWeatherApi } = vi.hoisted(() => ({
    mockWeatherApi: {
        get: vi.fn<[], Promise<WeatherData | null>>(),
    },
}));

vi.mock('@/lib/api', () => ({
    weatherApi: mockWeatherApi,
}));

type RtdbReturn<T> = { data: T; isLoading: boolean };
type RtdbMock = {
    todos: RtdbReturn<Record<string, Todo>>;
    chores: RtdbReturn<Record<string, Chore>>;
    shoppingLists: RtdbReturn<Record<string, ShoppingList>>;
    events: RtdbReturn<Record<string, CalendarEvent>>;
};

let mockRtdb: RtdbMock = {
    todos: { data: {}, isLoading: false },
    chores: { data: {}, isLoading: false },
    shoppingLists: { data: {}, isLoading: false },
    events: { data: {}, isLoading: false },
};

vi.mock('@/hooks/useRtdb', () => ({
    useRtdb: vi.fn((path: string | null) => {
        if (!path) {
            return { data: {}, isLoading: false };
        }

        if (path.includes('todos')) {
            return mockRtdb.todos;
        }

        if (path.includes('chores')) {
            return mockRtdb.chores;
        }

        if (path.includes('shopping')) {
            return mockRtdb.shoppingLists;
        }

        if (path.includes('calendar')) {
            return mockRtdb.events;
        }

        return { data: {}, isLoading: false };
    }),
}));

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

const makeEvent = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
    id: 1,
    family_id: 42,
    created_by: 1,
    title: 'Team standup',
    start_at: `${today}T09:00:00.000Z`,
    end_at: `${today}T09:30:00.000Z`,
    is_all_day: false,
    color: '#6366F1',
    description: null,
    location: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
});

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
    id: 1,
    family_id: 42,
    created_by: 1,
    title: 'Buy milk',
    status: 'pending',
    assigned_to: null,
    priority: 'medium',
    category: 'home',
    description: null,
    due_date: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
});

const makeChore = (overrides: Partial<Chore> = {}): Chore => ({
    id: 1,
    family_id: 42,
    created_by: 1,
    title: 'Vacuum living room',
    description: null,
    frequency: 'weekly',
    next_due_date: null,
    last_completed_at: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
});

const makeShoppingList = (overrides: Partial<ShoppingList> = {}): ShoppingList => ({
    id: 1,
    family_id: 42,
    name: 'Weekly groceries',
    items: [],
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
});

const makeWeather = (): WeatherData => ({
    location: 'Sydney, AU',
    current: {
        temp: 22,
        feels_like: 21,
        humidity: 60,
        wind_speed: 15,
        description: 'partly cloudy',
        icon_url: null,
    },
    forecast: [],
});

describe('DashboardScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = { id: 1, name: 'Alice Smith', family_id: 42 };
        mockRtdb = {
            todos: { data: {}, isLoading: false },
            chores: { data: {}, isLoading: false },
            shoppingLists: { data: {}, isLoading: false },
            events: { data: {}, isLoading: false },
        };
        mockWeatherApi.get.mockResolvedValue(null);
    });

    it('renders a greeting with the user first name', () => {
        render(<DashboardScreen />);

        expect(screen.getByText(/Hey, Alice/)).toBeInTheDocument();
    });

    it('renders a generic greeting when user is not logged in', () => {
        mockUser = null;

        render(<DashboardScreen />);

        expect(screen.getByText(/Hey, there/)).toBeInTheDocument();
    });

    it('renders a generic greeting when user has no name', () => {
        mockUser = { id: 1, name: null, family_id: 42 };

        render(<DashboardScreen />);

        expect(screen.getByText(/Hey, there/)).toBeInTheDocument();
    });

    it('renders all 5 default widget titles', () => {
        render(<DashboardScreen />);

        expect(screen.getByText('Weather')).toBeInTheDocument();
        expect(screen.getByText("Today's Schedule")).toBeInTheDocument();
        expect(screen.getByText('Todos')).toBeInTheDocument();
        expect(screen.getByText('Shopping')).toBeInTheDocument();
        expect(screen.getByText('Chores')).toBeInTheDocument();
    });

    it('renders all default widget cards', () => {
        render(<DashboardScreen />);

        expect(screen.getAllByTestId('widget-card')).toHaveLength(5);
    });

    it('shows the VoiceCommandBar when user has a family', () => {
        render(<DashboardScreen />);

        expect(screen.getByTestId('voice-command-bar')).toBeInTheDocument();
    });

    it('hides the VoiceCommandBar when user has no family', () => {
        mockUser = { id: 1, name: 'Alice', family_id: null };

        render(<DashboardScreen />);

        expect(screen.queryByTestId('voice-command-bar')).toBeNull();
    });

    it('shows schedule empty state when there are no events', () => {
        render(<DashboardScreen />);

        expect(screen.getByText('No events today')).toBeInTheDocument();
    });

    it('renders today events in the schedule widget', () => {
        mockRtdb.events = {
            data: { '1': makeEvent({ title: 'Morning standup' }) },
            isLoading: false,
        };

        render(<DashboardScreen />);

        expect(screen.getByText(/Morning standup/)).toBeInTheDocument();
    });

    it('does not render events from other days in schedule widget', () => {
        mockRtdb.events = {
            data: {
                '1': makeEvent({
                    title: 'Yesterday event',
                    start_at: '2020-01-01T09:00:00.000Z',
                    end_at: '2020-01-01T09:30:00.000Z',
                }),
            },
            isLoading: false,
        };

        render(<DashboardScreen />);

        expect(screen.queryByText('Yesterday event')).toBeNull();
        expect(screen.getByText('No events today')).toBeInTheDocument();
    });

    it('shows todos empty state when there are no pending todos', () => {
        render(<DashboardScreen />);

        expect(screen.getByText('All caught up!')).toBeInTheDocument();
    });

    it('renders pending todos in the todos widget', () => {
        mockRtdb.todos = {
            data: { '1': makeTodo({ title: 'Buy groceries', status: 'pending' }) },
            isLoading: false,
        };

        render(<DashboardScreen />);

        expect(screen.getByText(/Buy groceries/)).toBeInTheDocument();
    });

    it('does not render completed todos in the todos widget', () => {
        mockRtdb.todos = {
            data: { '1': makeTodo({ title: 'Completed task', status: 'done' }) },
            isLoading: false,
        };

        render(<DashboardScreen />);

        expect(screen.queryByText('Completed task')).toBeNull();
        expect(screen.getByText('All caught up!')).toBeInTheDocument();
    });

    it('shows shopping empty state when no unchecked items exist', () => {
        render(<DashboardScreen />);

        expect(screen.getByText('Nothing to buy')).toBeInTheDocument();
    });

    it('renders unchecked shopping items and hides checked items', () => {
        mockRtdb.shoppingLists = {
            data: {
                '1': makeShoppingList({
                    items: [
                        {
                            id: 1,
                            shopping_list_id: 1,
                            name: 'Milk',
                            quantity: null,
                            category: null,
                            is_checked: false,
                            added_by: 1,
                            created_at: '2025-01-01T00:00:00.000Z',
                            updated_at: '2025-01-01T00:00:00.000Z',
                        },
                        {
                            id: 2,
                            shopping_list_id: 1,
                            name: 'Eggs',
                            quantity: null,
                            category: null,
                            is_checked: true,
                            added_by: 1,
                            created_at: '2025-01-01T00:00:00.000Z',
                            updated_at: '2025-01-01T00:00:00.000Z',
                        },
                    ],
                }),
            },
            isLoading: false,
        };

        render(<DashboardScreen />);

        expect(screen.getByText(/Milk/)).toBeInTheDocument();
        expect(screen.queryByText(/Eggs/)).toBeNull();
    });

    it('shows chores empty state when no chores exist', () => {
        render(<DashboardScreen />);

        expect(screen.getByText('No chores assigned')).toBeInTheDocument();
    });

    it('renders chores in the chores widget', () => {
        mockRtdb.chores = {
            data: { '1': makeChore({ title: 'Take out trash' }) },
            isLoading: false,
        };

        render(<DashboardScreen />);

        expect(screen.getByText(/Take out trash/)).toBeInTheDocument();
    });

    it('shows weather loading state while weather request is pending', () => {
        mockWeatherApi.get.mockReturnValue(new Promise<WeatherData | null>(() => {}));

        const { unmount } = render(<DashboardScreen />);

        expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();

        unmount();
    });

    it('shows weather data when weather fetch succeeds', async () => {
        mockWeatherApi.get.mockResolvedValue(makeWeather());

        render(<DashboardScreen />);

        await waitFor(() => {
            expect(screen.getByText(/22°C/)).toBeInTheDocument();
        });
        expect(screen.getByText(/partly cloudy/i)).toBeInTheDocument();
        expect(screen.getByText(/📍 Sydney, AU/)).toBeInTheDocument();
    });

    it('hides weather widget when weather fetch resolves null', async () => {
        mockWeatherApi.get.mockResolvedValue(null);

        render(<DashboardScreen />);

        await waitFor(() => {
            expect(screen.queryByTestId('activity-indicator')).toBeNull();
        });
        expect(screen.queryByText(/°C/)).toBeNull();
    });

    it('hides weather widget when weather fetch fails', async () => {
        mockWeatherApi.get.mockRejectedValue(new Error('Network error'));

        render(<DashboardScreen />);

        await waitFor(() => {
            expect(screen.queryByTestId('activity-indicator')).toBeNull();
        });
        expect(screen.queryByText(/°C/)).toBeNull();
    });

    it('keeps rendering widgets when reorder controls are clicked', () => {
        render(<DashboardScreen />);

        const upArrows = screen.getAllByText('↑');
        const downArrows = screen.getAllByText('↓');

        fireEvent.click(upArrows[1]);
        fireEvent.click(downArrows[0]);

        expect(screen.getByText('Weather')).toBeInTheDocument();
        expect(screen.getByText("Today's Schedule")).toBeInTheDocument();
        expect(screen.getByText('Todos')).toBeInTheDocument();
        expect(screen.getByText('Shopping')).toBeInTheDocument();
        expect(screen.getByText('Chores')).toBeInTheDocument();
    });
});
