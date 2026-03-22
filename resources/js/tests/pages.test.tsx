import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import NotificationsIndex from '@/pages/Notifications/Index';
import Welcome from '@/pages/Welcome';

// ---------------------------------------------------------------------------
// Global mocks
// ---------------------------------------------------------------------------

vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
        <a href={String(href)} {...rest}>
            {children}
        </a>
    ),
    useForm: vi.fn(),
    usePage: vi.fn(() => ({
        props: {
            auth: { user: { id: 1, name: 'Alice', email: 'alice@example.com' }, connectedProviders: [], hasPasswordSet: true },
            currentUserPermissions: [],
            unreadNotificationsCount: 0,
        },
    })),
    router: {
        visit: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        reload: vi.fn(),
    },
}));

vi.mock('@/layouts/AppLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="app-layout">{children}</div>,
}));

vi.mock('@/layouts/AuthLayout', () => ({
    default: ({ children, title }: { children: React.ReactNode; title?: string }) => (
        <div>
            {title && <h1>{title}</h1>}
            {children}
        </div>
    ),
}));

// Route stubs
vi.mock('@/routes', () => ({
    login: () => '/login',
    register: () => '/register',
    logout: () => '/logout',
    dashboard: () => '/dashboard',
    privacy: () => '/privacy',
    terms: () => '/terms',
}));

vi.mock('@/components/AppearanceToggle', () => ({
    default: () => <button>Toggle appearance</button>,
}));

// ---------------------------------------------------------------------------
// Welcome page
// ---------------------------------------------------------------------------

describe('Welcome page', () => {
    it('renders the main heading', () => {
        render(<Welcome />);
        expect(screen.getByRole('heading', { name: /family life/i })).toBeInTheDocument();
    });

    it('renders a Log in link', () => {
        render(<Welcome />);
        expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
    });

    it('renders a Get Started / Create your family link', () => {
        render(<Welcome />);
        expect(screen.getByRole('button', { name: /Get started free/i })).toBeInTheDocument();
    });

    it('renders feature cards', () => {
        render(<Welcome />);
        expect(screen.getByText('Shared Todos')).toBeInTheDocument();
        expect(screen.getByText('Family Calendar')).toBeInTheDocument();
        expect(screen.getByText('Recipes')).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Notifications page
// ---------------------------------------------------------------------------

const emptyPaginated = {
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    links: [],
};

const makeNotification = (overrides: Partial<{ id: string; read_at: string | null; data: Record<string, unknown>; created_at: string }> = {}) => ({
    id: '1',
    type: 'App\\Notifications\\TodoAssigned',
    data: { type: 'todo_assigned', todo_title: 'Buy milk' },
    read_at: null,
    created_at: '2024-06-15T10:00:00.000000Z',
    ...overrides,
});

describe('Notifications page', () => {
    it('shows empty state when there are no notifications', () => {
        render(<NotificationsIndex notifications={emptyPaginated} />);
        expect(screen.getByText(/you have no notifications/i)).toBeInTheDocument();
    });

    it('renders a notification item', () => {
        const notifications = { ...emptyPaginated, data: [makeNotification()] };
        render(<NotificationsIndex notifications={notifications} />);
        expect(screen.getByText(/you were assigned a task: buy milk/i)).toBeInTheDocument();
    });

    it('shows "Mark all read" button when there are unread notifications', () => {
        const notifications = { ...emptyPaginated, data: [makeNotification({ read_at: null })] };
        render(<NotificationsIndex notifications={notifications} />);
        expect(screen.getByRole('button', { name: /mark all read/i })).toBeInTheDocument();
    });

    it('hides "Mark all read" button when all notifications are read', () => {
        const notifications = {
            ...emptyPaginated,
            data: [makeNotification({ read_at: '2024-06-15T10:00:00.000000Z' })],
        };
        render(<NotificationsIndex notifications={notifications} />);
        expect(screen.queryByRole('button', { name: /mark all read/i })).toBeNull();
    });

    it('renders a delete button for each notification', () => {
        const notifications = { ...emptyPaginated, data: [makeNotification(), makeNotification({ id: '2' })] };
        render(<NotificationsIndex notifications={notifications} />);
        expect(screen.getAllByRole('button', { name: /delete notification/i })).toHaveLength(2);
    });

    it('renders a mark-as-read button for unread notifications', () => {
        const notifications = { ...emptyPaginated, data: [makeNotification({ read_at: null })] };
        render(<NotificationsIndex notifications={notifications} />);
        expect(screen.getByRole('button', { name: /mark as read/i })).toBeInTheDocument();
    });

    it('handles different notification types', () => {
        const choreNotification = makeNotification({ data: { type: 'chore_assigned', chore_title: 'Vacuum' } });
        render(<NotificationsIndex notifications={{ ...emptyPaginated, data: [choreNotification] }} />);
        expect(screen.getByText(/you were assigned a chore: vacuum/i)).toBeInTheDocument();
    });

    it('shows "You have a new notification" for unknown types', () => {
        const unknown = makeNotification({ data: { type: 'unknown_type' } });
        render(<NotificationsIndex notifications={{ ...emptyPaginated, data: [unknown] }} />);
        expect(screen.getByText(/you have a new notification/i)).toBeInTheDocument();
    });

    it('calls router.post when marking a notification as read', async () => {
        const { router } = await import('@inertiajs/react');
        const notifications = { ...emptyPaginated, data: [makeNotification({ id: 'abc-123' })] };
        const user = userEvent.setup();
        render(<NotificationsIndex notifications={notifications} />);
        await user.click(screen.getByRole('button', { name: /mark as read/i }));
        expect(router.post).toHaveBeenCalledWith('/notifications/abc-123/read', {}, { preserveScroll: true });
    });

    it('calls router.delete when deleting a notification', async () => {
        const { router } = await import('@inertiajs/react');
        const notifications = { ...emptyPaginated, data: [makeNotification({ id: 'abc-123' })] };
        const user = userEvent.setup();
        render(<NotificationsIndex notifications={notifications} />);
        await user.click(screen.getByRole('button', { name: /delete notification/i }));
        expect(router.delete).toHaveBeenCalledWith('/notifications/abc-123', { preserveScroll: true });
    });
});
