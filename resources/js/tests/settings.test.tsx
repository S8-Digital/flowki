import { useForm } from '@inertiajs/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Appearance from '@/pages/settings/Appearance';
import NotificationSettings from '@/pages/settings/Notifications';
import Password from '@/pages/settings/Password';
import { makeUseFormReturn } from './__mocks__/inertia';

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
            auth: {
                user: { id: 1, name: 'Alice', email: 'alice@example.com', profile_color: null, email_verified_at: null },
                connectedProviders: [],
                hasPasswordSet: true,
            },
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

vi.mock('@/layouts/settings/Layout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="settings-layout">{children}</div>,
}));

// Route/action stubs
vi.mock('@/routes', () => ({
    login: () => '/login',
    register: () => '/register',
    logout: () => '/logout',
    dashboard: () => '/dashboard',
    appearance: () => '/settings/appearance',
    update: () => ({ url: '/settings/password' }),
}));
vi.mock('@/actions/App/Http/Controllers/Settings/ProfileController', () => ({
    update: () => ({ url: '/settings/profile' }),
}));
vi.mock('@/routes/social', () => ({
    redirect: (provider: string) => ({ url: `/auth/${provider}/redirect` }),
    link: (provider: string) => ({ url: `/auth/${provider}/link` }),
    unlink: (provider: string) => ({ url: `/auth/${provider}/unlink` }),
}));
vi.mock('@/routes/verification', () => ({
    send: () => ({ url: '/email/verification-notification' }),
}));

vi.mock('@/hooks/useAppearance', () => ({
    useAppearance: () => ({ appearance: 'system', updateAppearance: vi.fn() }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockForm(overrides = {}) {
    vi.mocked(useForm).mockReturnValue(makeUseFormReturn(overrides) as ReturnType<typeof useForm>);
}

// ---------------------------------------------------------------------------
// Appearance settings page
// ---------------------------------------------------------------------------

describe('Appearance settings page', () => {
    beforeEach(() => {
        mockForm({});
    });

    it('renders the settings layout', () => {
        render(<Appearance />);
        expect(screen.getByTestId('settings-layout')).toBeInTheDocument();
    });

    it('renders the heading', () => {
        render(<Appearance />);
        expect(screen.getByRole('heading', { name: /appearance settings/i })).toBeInTheDocument();
    });

    it('renders appearance tabs (Light, Dark, System)', () => {
        render(<Appearance />);
        expect(screen.getByText('Light')).toBeInTheDocument();
        expect(screen.getByText('Dark')).toBeInTheDocument();
        expect(screen.getByText('System')).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Password settings page
// ---------------------------------------------------------------------------

describe('Password settings page', () => {
    beforeEach(() => {
        mockForm({
            data: { current_password: '', password: '', password_confirmation: '' },
            errors: {},
        });
    });

    it('renders the password form fields', () => {
        render(<Password />);
        expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('renders the update button', () => {
        render(<Password />);
        expect(screen.getByRole('button', { name: /save password/i })).toBeInTheDocument();
    });

    it('shows success message when recently successful', () => {
        mockForm({
            data: { current_password: '', password: '', password_confirmation: '' },
            errors: {},
            recentlySuccessful: true,
        });
        render(<Password />);
        expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });

    it('calls put when the form is submitted', async () => {
        const putFn = vi.fn();
        mockForm({ data: { current_password: 'old', password: 'new', password_confirmation: 'new' }, errors: {}, put: putFn });
        const user = userEvent.setup();
        render(<Password />);
        await user.click(screen.getByRole('button', { name: /save password/i }));
        expect(putFn).toHaveBeenCalledOnce();
    });
});

// ---------------------------------------------------------------------------
// Notification settings page
// ---------------------------------------------------------------------------

describe('Notification settings page', () => {
    const defaultPrefs = { email: true, push: false };

    beforeEach(() => {
        mockForm({
            data: { email: true, push: false },
            errors: {},
        });
    });

    it('renders email and push notification toggles', () => {
        render(<NotificationSettings preferences={defaultPrefs} />);
        expect(screen.getByText(/email notifications/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/push notifications/i)).toBeInTheDocument();
    });

    it('renders the Save button', () => {
        render(<NotificationSettings preferences={defaultPrefs} />);
        expect(screen.getByRole('button', { name: /save preferences/i })).toBeInTheDocument();
    });

    it('shows saved state after successful update', () => {
        mockForm({ data: { email: true, push: false }, errors: {}, recentlySuccessful: true });
        render(<NotificationSettings preferences={defaultPrefs} />);
        expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });

    it('calls put when the form is submitted', async () => {
        const putFn = vi.fn();
        mockForm({ data: { email: true, push: false }, errors: {}, put: putFn });
        const user = userEvent.setup();
        render(<NotificationSettings preferences={defaultPrefs} />);
        await user.click(screen.getByRole('button', { name: /save preferences/i }));
        expect(putFn).toHaveBeenCalledOnce();
    });
});
