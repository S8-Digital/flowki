import { useForm } from '@inertiajs/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Categories from '@/pages/settings/Categories';
import MemberPermissions from '@/pages/settings/MemberPermissions';
import Password from '@/pages/settings/Password';
import Profile from '@/pages/settings/Profile';
import { makeUseFormReturn } from './__mocks__/inertia';

// ---------------------------------------------------------------------------
// Global mocks
// ---------------------------------------------------------------------------

vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [_key: string]: unknown }) => (
        <a href={String(href)} {...rest}>
            {children}
        </a>
    ),
    useForm: vi.fn(),
    usePage: vi.fn(() => ({
        props: {
            auth: {
                user: {
                    id: 1,
                    name: 'Alice Smith',
                    email: 'alice@example.com',
                    profile_color: null,
                    email_verified_at: '2024-01-01T00:00:00.000000Z',
                },
                connectedProviders: [],
                hasPasswordSet: true,
            },
            currentUserPermissions: ['manage-members'],
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

vi.mock('@/layouts/settings/MemberLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="member-settings-layout">{children}</div>,
}));

vi.mock('@/routes', () => ({
    login: () => '/login',
    register: () => '/register',
    logout: () => '/logout',
    dashboard: () => '/dashboard',
}));

vi.mock('@/routes/social', () => ({
    redirect: (provider: string) => ({ url: `/auth/${provider}/redirect` }),
    link: (provider: string) => ({ url: `/auth/${provider}/link` }),
    unlink: (provider: string) => ({ url: `/auth/${provider}/unlink` }),
}));

vi.mock('@/routes/verification', () => ({
    send: () => ({ url: '/email/verification-notification' }),
}));

vi.mock('@/actions/App/Http/Controllers/Settings/CategoriesController', () => ({
    update: () => ({ url: '/settings/categories', method: 'post' }),
}));

vi.mock('@/actions/App/Http/Controllers/Settings/PasswordController', () => ({
    update: () => ({ url: '/settings/security', method: 'put' }),
}));

vi.mock('@/actions/App/Http/Controllers/Settings/ProfileController', () => ({
    update: () => ({ url: '/settings/profile', method: 'patch' }),
}));

vi.mock('@/actions/App/Http/Controllers/Settings/PermissionController', () => ({
    edit: (args: { user: number }) => ({ url: `/settings/members/${args.user}/permissions` }),
    update: (args: { user: number }) => ({ url: `/settings/members/${args.user}/permissions` }),
}));

vi.mock('@/actions/App/Http/Controllers/Settings/MemberProfileController', () => ({
    edit: (args: { user: number }) => ({ url: `/settings/members/${args.user}` }),
}));

vi.mock('@/components/UserPermissionsPanel', () => ({
    default: ({
        permissionGroups,
        onChange,
    }: {
        permissionGroups: unknown[];
        grantedPermissions: string[];
        onChange: (p: string, g: boolean) => void;
    }) => (
        <div data-testid="permissions-panel">
            {permissionGroups.map((_, i) => (
                <button key={i} onClick={() => onChange('some-permission', true)}>
                    Toggle {i}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('@/components/DeleteUser', () => ({
    default: () => <div data-testid="delete-user" />,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockForm(overrides = {}) {
    vi.mocked(useForm).mockReturnValue(makeUseFormReturn(overrides) as ReturnType<typeof useForm>);
}

// ---------------------------------------------------------------------------
// Password settings page
// ---------------------------------------------------------------------------

describe('Password settings page', () => {
    beforeEach(() => {
        mockForm({
            data: { current_password: '', password: '', password_confirmation: '' },
        });
    });

    it('renders the password form heading', () => {
        render(<Password />);
        expect(screen.getByText(/update password/i)).toBeInTheDocument();
    });

    it('renders current password input', () => {
        render(<Password />);
        expect(screen.getByPlaceholderText(/current password/i)).toBeInTheDocument();
    });

    it('renders new password input', () => {
        render(<Password />);
        expect(screen.getByPlaceholderText(/new password/i)).toBeInTheDocument();
    });

    it('renders confirm password input', () => {
        render(<Password />);
        expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
    });

    it('renders the Save password button', () => {
        render(<Password />);
        expect(screen.getByRole('button', { name: /save password/i })).toBeInTheDocument();
    });

    it('shows saved message when recentlySuccessful is true', () => {
        mockForm({ recentlySuccessful: true });
        render(<Password />);
        expect(screen.getByText(/saved\./i)).toBeInTheDocument();
    });

    it('calls put when the form is submitted', async () => {
        const putFn = vi.fn();
        mockForm({ put: putFn });
        const user = userEvent.setup();
        render(<Password />);
        await user.click(screen.getByRole('button', { name: /save password/i }));
        expect(putFn).toHaveBeenCalledWith('/settings/security', expect.any(Object));
    });
});

// ---------------------------------------------------------------------------
// Profile settings page
// ---------------------------------------------------------------------------

describe('Profile settings page', () => {
    beforeEach(() => {
        mockForm({
            data: { name: 'Alice Smith', email: 'alice@example.com' },
        });
    });

    it('renders the profile information heading', () => {
        render(<Profile mustVerifyEmail={false} hasGoogleCalendarConnected={false} />);
        expect(screen.getByText(/profile information/i)).toBeInTheDocument();
    });

    it('renders name and email inputs', () => {
        render(<Profile mustVerifyEmail={false} hasGoogleCalendarConnected={false} />);
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('renders the Save button', () => {
        render(<Profile mustVerifyEmail={false} hasGoogleCalendarConnected={false} />);
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('shows email verification notice when mustVerifyEmail is true and email is unverified', async () => {
        const { usePage } = await import('@inertiajs/react');
        vi.mocked(usePage).mockReturnValueOnce({
            props: {
                auth: {
                    user: { id: 1, name: 'Alice Smith', email: 'alice@example.com', profile_color: null, email_verified_at: null },
                    connectedProviders: [],
                    hasPasswordSet: true,
                },
                currentUserPermissions: [],
                unreadNotificationsCount: 0,
            },
        } as unknown as ReturnType<typeof usePage>);
        render(<Profile mustVerifyEmail={true} hasGoogleCalendarConnected={false} />);
        expect(screen.getByText(/your email address is unverified/i)).toBeInTheDocument();
    });

    it('shows Google Calendar connect button when not connected', () => {
        render(<Profile mustVerifyEmail={false} hasGoogleCalendarConnected={false} />);
        expect(screen.getByRole('button', { name: /connect google calendar/i })).toBeInTheDocument();
    });

    it('shows disconnect button when Google Calendar is connected', () => {
        render(<Profile mustVerifyEmail={false} hasGoogleCalendarConnected={true} />);
        expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument();
    });

    it('shows a success status message when profile was recently saved', () => {
        mockForm({
            data: { name: 'Alice Smith', email: 'alice@example.com' },
            recentlySuccessful: true,
        });
        render(<Profile mustVerifyEmail={false} hasGoogleCalendarConnected={false} />);
        expect(screen.getByText(/saved\./i)).toBeInTheDocument();
    });

    it('does not show the inbound email section when no address is provided', () => {
        render(<Profile mustVerifyEmail={false} hasGoogleCalendarConnected={false} />);
        expect(screen.queryByText(/inbound email address/i)).not.toBeInTheDocument();
    });

    it('shows the inbound email address section when provided', () => {
        render(
            <Profile
                mustVerifyEmail={false}
                hasGoogleCalendarConnected={false}
                inboundEmailAddress="abc123@in.flowki.family"
            />,
        );
        expect(screen.getByText(/inbound email address/i)).toBeInTheDocument();
        expect(screen.getByText('abc123@in.flowki.family')).toBeInTheDocument();
    });

    it('shows the Copy button when an inbound email address is provided', () => {
        render(
            <Profile
                mustVerifyEmail={false}
                hasGoogleCalendarConnected={false}
                inboundEmailAddress="abc123@in.flowki.family"
            />,
        );
        expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Categories settings page
// ---------------------------------------------------------------------------

describe('Categories settings page', () => {
    const emptyCategories: { value: string; label: string }[] = [] as { value: string; label: string }[];

    it('renders the Todo Categories heading', () => {
        render(<Categories todoCategories={emptyCategories} recipeCategories={emptyCategories} shoppingCategories={emptyCategories} />);
        expect(screen.getByText(/todo categories/i)).toBeInTheDocument();
    });

    it('renders the Recipe Categories heading', () => {
        render(<Categories todoCategories={emptyCategories} recipeCategories={emptyCategories} shoppingCategories={emptyCategories} />);
        expect(screen.getByText(/recipe categories/i)).toBeInTheDocument();
    });

    it('renders the Shopping Categories heading', () => {
        render(<Categories todoCategories={emptyCategories} recipeCategories={emptyCategories} shoppingCategories={emptyCategories} />);
        expect(screen.getByText(/shopping categories/i)).toBeInTheDocument();
    });

    it('renders existing todo categories', () => {
        const todos = [{ value: 'work', label: 'Work' }];
        render(<Categories todoCategories={todos} recipeCategories={emptyCategories} shoppingCategories={emptyCategories} />);
        expect(screen.getByDisplayValue('Work')).toBeInTheDocument();
    });

    it('renders Add button for each category type', () => {
        render(<Categories todoCategories={emptyCategories} recipeCategories={emptyCategories} shoppingCategories={emptyCategories} />);
        const addButtons = screen.getAllByRole('button', { name: /add/i });
        expect(addButtons.length).toBeGreaterThanOrEqual(3);
    });

    it('allows adding a new todo category', async () => {
        const user = userEvent.setup();
        render(<Categories todoCategories={emptyCategories} recipeCategories={emptyCategories} shoppingCategories={emptyCategories} />);
        const [addTodoBtn] = screen.getAllByRole('button', { name: /add/i });
        await user.click(addTodoBtn);
        // A new empty label input should appear
        const inputs = screen.getAllByPlaceholderText(/label/i);
        expect(inputs.length).toBeGreaterThan(0);
    });

    it('renders a Save button', () => {
        render(<Categories todoCategories={emptyCategories} recipeCategories={emptyCategories} shoppingCategories={emptyCategories} />);
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Member Permissions settings page
// ---------------------------------------------------------------------------

describe('Member Permissions settings page', () => {
    const makeMember = (overrides = {}) => ({
        id: 2,
        name: 'Bob Smith',
        role: 'Member',
        profile_color: null,
        permissionGroups: [
            {
                group: 'Todos',
                permissions: [
                    { name: 'view-todos', label: 'View Todos', granted: true },
                    { name: 'create-todos', label: 'Create Todos', granted: false },
                ],
            },
        ],
        ...overrides,
    });

    beforeEach(() => {
        mockForm({ put: vi.fn() });
    });

    it('renders the member name in a heading context', () => {
        render(<MemberPermissions member={makeMember()} />);
        expect(screen.getAllByText(/bob smith/i).length).toBeGreaterThan(0);
    });

    it('renders the permissions panel', () => {
        render(<MemberPermissions member={makeMember()} />);
        expect(screen.getByTestId('permissions-panel')).toBeInTheDocument();
    });

    it('renders the Save Permissions button', () => {
        render(<MemberPermissions member={makeMember()} />);
        expect(screen.getByRole('button', { name: /save permissions/i })).toBeInTheDocument();
    });

    it('calls put when the form is submitted', async () => {
        const putFn = vi.fn();
        mockForm({ put: putFn });
        const user = userEvent.setup();
        render(<MemberPermissions member={makeMember()} />);
        await user.click(screen.getByRole('button', { name: /save permissions/i }));
        expect(putFn).toHaveBeenCalled();
    });

    it('shows saved message after successful save', async () => {
        const putFn = vi.fn().mockImplementation((_url, options) => {
            options?.onSuccess?.();
        });
        mockForm({ put: putFn });
        const user = userEvent.setup();
        render(<MemberPermissions member={makeMember()} />);
        await user.click(screen.getByRole('button', { name: /save permissions/i }));
        expect(screen.getByText(/saved/i)).toBeInTheDocument();
    });
});
