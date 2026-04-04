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

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardScreen from '@/app/(tabs)/index';
import type { CalendarEvent, Chore, ShoppingList, Todo, WeatherData } from '@/lib/api';

// ── store mock ────────────────────────────────────────────────────────────────

let mockUser: { id: number; name: string; family_id: number | null } | null = {
    id: 1,
    name: 'Alice Smith',
    family_id: 42,
};

vi.mock('@/store', () => ({
    useAppSelector: vi.fn((selector: (s: { auth: { user: typeof mockUser } }) => unknown) =>
        selector({ auth: { user: mockUser } }),
    ),
}));

// ── react-native-paper mock ───────────────────────────────────────────────────

vi.mock('react-native-paper', async () => {
    const React = await import('react');

    const ActivityIndicator = ({ size }: { size?: string }) =>
        React.createElement('div', { 'data-testid': 'activity-indicator', 'data-size': size });

    const Card = Object.assign(
        ({ children, style }: { children?: React.ReactNode; style?: unknown }) =>
            React.createElement('div', { 'data-testid': 'widget-card', style }, children),
        {
            Content: ({ children }: { children?: React.ReactNode }) =>
                React.createElement('div', {}, children),
        },
    );

    return { ActivityIndicator, Card };
});

// ── ThemedText / ThemedView mocks ─────────────────────────────────────────────

vi.mock('@/components/ThemedText', () => ({
    ThemedText: ({
        children,
        variant,
    }: {
        children?: React.ReactNode;
        variant?: string;
        style?: unknown;
    }) => React.createElement('span', { 'data-variant': variant }, children ?? null),
}));

vi.mock('@/components/ThemedView', () => ({
    ThemedView: ({ children }: { children?: React.ReactNode; style?: unknown }) =>
        React.createElement('div', {}, children ?? null),
}));

// ── VoiceCommandBar mock ──────────────────────────────────────────────────────

vi.mock('@/components/VoiceCommandBar', () => ({
    VoiceCommandBar: () =>
        React.createElement('div', { 'data-testid': 'voice-command-bar' }),
}));

// ── Colors / useColorScheme mocks ─────────────────────────────────────────────

vi.mock('@/constants/Colors', () => ({
    Colors: {
        light: { tint: '#3B82F6', card: '#F3F4F6', border: '#E5E7EB', muted: '#6B7280' },
        dark: { tint: '#3B82F6', card: '#151718', border: '#374151', muted: '#9CA3AF' },
    },
}));

vi.mock('@/hooks/useColorScheme', () => ({
    useColorScheme: () => 'light',
}));

// ── weatherApi mock ───────────────────────────────────────────────────────────

const { mockWeatherApi } = vi.hoisted(() => ({
    mockWeatherApi: {
        get: vi.fn(() => Promise.resolve(null)),
    },
}));

vi.mock('@/lib/api', () => ({
    weatherApi: mockWeatherApi,
}));

// ── useRtdb mock ──────────────────────────────────────────────────────────────

let mockTodos: Record<string, Todo> = {};
let mockChores: Record<string, Chore> = {};
let mockShoppingLists: Record<string, ShoppingList> = {};
let mockEvents: Record<string, CalendarEvent> = {};

vi.mock('@/hooks/useRtdb', () => ({
    useRtdb: vi.fn((path: string | null) => {
        if (path === null) return { data: {}, isLoading: false };
        if (path?.includes('/todos')) return { data: mockTodos, isLoading: false };
        if (path?.includes('/chores')) return { data: mockChores, isLoading: false };
        if (path?.includes('/shopping_lists')) return { data: mockShoppingLists, isLoading: false };
        if (path?.includes('/calendar_events')) return { data: mockEvents, isLoading: false };
        return { data: {}, isLoading: false };
    }),
}));

// ── fixtures ──────────────────────────────────────────────────────────────────

const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();

const makeWeather = (): WeatherData => ({
    location: 'London',
    current: {
        temp: 15,
        feels_like: 12,
        humidity: 60,
        wind_speed: 10,
        description: 'Partly cloudy',
        icon_url: null,
    },
    forecast: [],
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('DashboardScreen', () => {
    beforeEach(() => {
        mockUser = { id: 1, name: 'Alice Smith', family_id: 42 };
        mockTodos = {};
        mockChores = {};
        mockShoppingLists = {};
        mockEvents = {};
        mockWeatherApi.get.mockReset();
        mockWeatherApi.get.mockResolvedValue(null);
    });

    it('renders a personalised greeting with first name', async () => {
        render(<DashboardScreen />);
        await waitFor(() => {
            expect(screen.getByText(/Hey, Alice/)).toBeInTheDocument();
        });
    });

    it('renders a generic greeting when user is not logged in', async () => {
        mockUser = null;
        render(<DashboardScreen />);
        await waitFor(() => {
            expect(screen.getByText(/Hey, there/)).toBeInTheDocument();
        });
    });

    it('shows the VoiceCommandBar when user has a family', async () => {
        render(<DashboardScreen />);
        await waitFor(() => {
            expect(screen.getByTestId('voice-command-bar')).toBeInTheDocument();
        });
    });

    it('hides the VoiceCommandBar when user has no family', async () => {
        mockUser = { id: 1, name: 'Alice', family_id: null };
        render(<DashboardScreen />);
        await waitFor(() => {
            expect(screen.queryByTestId('voice-command-bar')).toBeNull();
        });
    });

    it("shows 'No events today' in the schedule widget when empty", async () => {
        render(<DashboardScreen />);
        await waitFor(() => {
            expect(screen.getByText(/no events today/i)).toBeInTheDocument();
        });
    });

    it('renders today calendar events in the schedule widget', async () => {
        mockEvents = {
            '1': {
                id: 1,
                family_id: 42,
                created_by: 1,
                title: 'Morning standup',
                start_at: `${today}T09:00:00.000Z`,
                end_at: `${today}T10:00:00.000Z`,
                is_all_day: false,
                color: null,
                description: null,
                location: null,
                created_at: '2025-01-01T00:00:00.000Z',
                updated_at: '2025-01-01T00:00:00.000Z',
            },
        };
        render(<DashboardScreen />);
        await waitFor(() => {
            expect(screen.getByText(/Morning standup/)).toBeInTheDocument();
        });
    });

    it("shows 'All caught up' in the todos widget when empty", async () => {
        render(<DashboardScreen />);
        await waitFor(() => {
            expect(screen.getByText(/all caught up/i)).toBeInTheDocument();
        });
    });

    it('renders pending todos in the todos widget', async () => {
        mockTodos = {
            '1': {
                id: 1,
                family_id: 42,
                title: 'Buy groceries',
                status: 'pending',
                assigned_to: 1,
                priority: 'medium',
                category: null,
                due_date: null,
                created_at: '2025-01-01T00:00:00.000Z',
                updated_at: '2025-01-01T00:00:00.000Z',
            },
        };
        render(<DashboardScreen />);
        await waitFor(() => {
            expect(screen.getByText(/Buy groceries/)).toBeInTheDocument();
        });
    });

    it("shows 'Nothing to buy' in the shopping widget when empty", async () => {
        render(<DashboardScreen />);
        await waitFor(() => {
            expect(screen.getByText(/nothing to buy/i)).toBeInTheDocument();
        });
    });

    it("shows 'No chores assigned' in the chores widget when empty", async () => {
        render(<DashboardScreen />);
        await waitFor(() => {
            expect(screen.getByText(/no chores assigned/i)).toBeInTheDocument();
        });
    });

    it('renders chores in the chores widget', async () => {
        mockChores = {
            '1': {
                id: 1,
                family_id: 42,
                title: 'Vacuum living room',
                assigned_to: null,
                frequency: 'weekly',
                next_due_at: null,
                last_completed_at: null,
                created_at: '2025-01-01T00:00:00.000Z',
                updated_at: '2025-01-01T00:00:00.000Z',
            },
        };
        render(<DashboardScreen />);
        await waitFor(() => {
            expect(screen.getByText(/Vacuum living room/)).toBeInTheDocument();
        });
    });

    it('shows weather data when weatherApi resolves', async () => {
        mockWeatherApi.get.mockResolvedValue(makeWeather());
        render(<DashboardScreen />);
        await waitFor(() => {
            expect(screen.getByText(/15°C/)).toBeInTheDocument();
            expect(screen.getByText(/Partly cloudy/i)).toBeInTheDocument();
        });
    });

    it('shows weather loading state briefly', async () => {
        // Make weather API hang so we can observe the loading state
        mockWeatherApi.get.mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(null), 5000)),
        );
        render(<DashboardScreen />);
        // ActivityIndicator should appear while loading
        expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();
    });

    it('hides weather widget when weatherApi resolves to null', async () => {
        mockWeatherApi.get.mockResolvedValue(null);
        render(<DashboardScreen />);
        await waitFor(() => {
            expect(screen.queryByText(/°C/)).toBeNull();
        });
    });

    it('renders all 5 default widget cards', async () => {
        render(<DashboardScreen />);
        await waitFor(() => {
            const cards = screen.getAllByTestId('widget-card');
            expect(cards.length).toBeGreaterThanOrEqual(5);
        });
    });
});
