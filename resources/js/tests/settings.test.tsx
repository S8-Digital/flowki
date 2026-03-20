import { useForm } from '@inertiajs/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import Appearance from '@/pages/settings/Appearance';
import MemberProfile from '@/pages/settings/MemberProfile';
import NotificationSettings from '@/pages/settings/Notifications';
import Security from '@/pages/settings/Security';
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

vi.mock('@/layouts/settings/MemberLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="member-settings-layout">{children}</div>,
}));

vi.mock('@/actions/App/Http/Controllers/Settings/MemberColorController', () => ({
    update: (args: { user: number }) => ({ url: `/settings/members/${args.user}/color` }),
}));

vi.mock('@/actions/App/Http/Controllers/Settings/MemberProfileController', () => ({
    edit: (args: { user: number }) => ({ url: `/settings/members/${args.user}` }),
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
// Security settings page (password + 2FA)
// ---------------------------------------------------------------------------

describe('Security settings page', () => {
    beforeEach(() => {
        mockForm({
            data: { current_password: '', password: '', password_confirmation: '' },
            errors: {},
        });
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve({ svg: '<svg/>', secretKey: 'SECRET' }) }));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders the password form fields', () => {
        render(<Security twoFactorEnabled={false} twoFactorConfirmed={false} />);
        expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('renders the update button', () => {
        render(<Security twoFactorEnabled={false} twoFactorConfirmed={false} />);
        expect(screen.getByRole('button', { name: /save password/i })).toBeInTheDocument();
    });

    it('shows success message when recently successful', () => {
        mockForm({
            data: { current_password: '', password: '', password_confirmation: '' },
            errors: {},
            recentlySuccessful: true,
        });
        render(<Security twoFactorEnabled={false} twoFactorConfirmed={false} />);
        expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });

    it('calls put when the form is submitted', async () => {
        const putFn = vi.fn();
        mockForm({ data: { current_password: 'old', password: 'new', password_confirmation: 'new' }, errors: {}, put: putFn });
        const user = userEvent.setup();
        render(<Security twoFactorEnabled={false} twoFactorConfirmed={false} />);
        await user.click(screen.getByRole('button', { name: /save password/i }));
        expect(putFn).toHaveBeenCalledOnce();
    });

    it('shows "enable" button when 2FA is not enabled', () => {
        render(<Security twoFactorEnabled={false} twoFactorConfirmed={false} />);
        expect(screen.getByRole('button', { name: /enable/i })).toBeInTheDocument();
        expect(screen.getByText(/two-factor authentication is not enabled/i)).toBeInTheDocument();
    });

    it('shows setup QR code prompt when 2FA is enabled but not confirmed', () => {
        render(<Security twoFactorEnabled={true} twoFactorConfirmed={false} />);
        expect(screen.getByText(/finish setting up two-factor authentication/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });

    it('shows active 2FA state and disable button when fully enabled', () => {
        render(<Security twoFactorEnabled={true} twoFactorConfirmed={true} />);
        expect(screen.getByText(/two-factor authentication is enabled/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /disable/i })).toBeInTheDocument();
    });

    it('calls router.post when enabling 2FA', async () => {
        const { router } = await import('@inertiajs/react');
        const user = userEvent.setup({ pointerEventsCheck: 0 });
        render(<Security twoFactorEnabled={false} twoFactorConfirmed={false} />);
        await user.click(screen.getByRole('button', { name: /enable/i }));
        expect(router.post).toHaveBeenCalledWith('/user/two-factor-authentication', {}, expect.any(Object));
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

// ---------------------------------------------------------------------------
// Member Profile settings page
// ---------------------------------------------------------------------------

const mockMember = {
    id: 5,
    name: 'Bob',
    role: 'member',
    profile_color: null,
};

describe('Member Profile settings page', () => {
    beforeEach(() => {
        mockForm({ data: { profile_color: null }, errors: {} });
    });

    it('renders the member settings layout', () => {
        render(<MemberProfile member={mockMember} />);
        expect(screen.getByTestId('member-settings-layout')).toBeInTheDocument();
    });

    it('renders the Profile Colour section', () => {
        render(<MemberProfile member={mockMember} />);
        expect(screen.getByText(/profile colour/i)).toBeInTheDocument();
    });

    it('renders the Save colour button', () => {
        render(<MemberProfile member={mockMember} />);
        expect(screen.getByRole('button', { name: /save colour/i })).toBeInTheDocument();
    });

    it('shows "No colour set" when profile_color is null', () => {
        render(<MemberProfile member={mockMember} />);
        expect(screen.getByText(/no colour set/i)).toBeInTheDocument();
    });

    it('shows the colour value when profile_color is set', () => {
        mockForm({ data: { profile_color: '#ff0000' }, errors: {} });
        render(<MemberProfile member={{ ...mockMember, profile_color: '#ff0000' }} />);
        expect(screen.getByText('#ff0000')).toBeInTheDocument();
    });

    it('calls patch when colour form is submitted', async () => {
        const patchFn = vi.fn();
        mockForm({ data: { profile_color: '#ff0000' }, errors: {}, patch: patchFn });
        const user = userEvent.setup();
        render(<MemberProfile member={{ ...mockMember, profile_color: '#ff0000' }} />);
        await user.click(screen.getByRole('button', { name: /save colour/i }));
        expect(patchFn).toHaveBeenCalledOnce();
    });
});
