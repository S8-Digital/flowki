import { useForm } from '@inertiajs/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AcceptInvite from '@/pages/auth/AcceptInvite';
import ConfirmPassword from '@/pages/auth/ConfirmPassword';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ResetPassword from '@/pages/auth/ResetPassword';
import TwoFactorChallenge from '@/pages/auth/TwoFactorChallenge';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import { makeUseFormReturn } from './__mocks__/inertia';

// ---------------------------------------------------------------------------
// Global mocks – hoisted by Vitest
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
                user: { id: 1, name: 'Alice', email: 'alice@example.com' },
                connectedProviders: [],
                hasPasswordSet: true,
            },
            currentUserPermissions: [],
        },
    })),
    router: {
        visit: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        get: vi.fn(),
        reload: vi.fn(),
    },
}));

vi.mock('@/layouts/AuthLayout', () => ({
    default: ({ children, title, description }: { children: React.ReactNode; title?: string; description?: string }) => (
        <div>
            {title && <h1>{title}</h1>}
            {description && <p>{description}</p>}
            {children}
        </div>
    ),
}));

vi.mock('@/layouts/AppLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Stub Wayfinder action modules used by auth pages
vi.mock('@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController', () => ({
    store: () => ({ url: '/login' }),
}));
vi.mock('@/actions/App/Http/Controllers/Auth/RegisteredUserController', () => ({
    store: () => ({ url: '/register' }),
}));
vi.mock('@/actions/App/Http/Controllers/Auth/PasswordResetLinkController', () => ({
    store: () => ({ url: '/forgot-password' }),
}));
vi.mock('@/actions/App/Http/Controllers/Auth/NewPasswordController', () => ({
    store: () => ({ url: '/reset-password' }),
}));
vi.mock('@/actions/App/Http/Controllers/Auth/EmailVerificationNotificationController', () => ({
    store: () => ({ url: '/email/verification-notification' }),
}));
vi.mock('@/actions/App/Http/Controllers/Auth/ConfirmablePasswordController', () => ({
    store: () => ({ url: '/confirm-password' }),
}));
vi.mock('@/actions/App/Http/Controllers/AcceptInviteController', () => ({
    store: () => ({ url: '/accept-invite' }),
}));

// Route helpers used inside the pages
vi.mock('@/routes', () => ({
    login: () => '/login',
    register: () => '/register',
    logout: () => '/logout',
    dashboard: () => '/dashboard',
}));
vi.mock('@/routes/password', () => ({
    request: () => '/forgot-password',
}));
vi.mock('@/routes/social', () => ({
    redirect: (provider: string) => ({ url: `/auth/${provider}/redirect` }),
    link: (provider: string) => ({ url: `/auth/${provider}/link` }),
    unlink: (provider: string) => ({ url: `/auth/${provider}/unlink` }),
}));
vi.mock('@/routes/verification', () => ({
    send: () => ({ url: '/email/verification-notification' }),
}));

// Material Tailwind – stubs for all used components

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockForm(overrides = {}) {
    vi.mocked(useForm).mockReturnValue(makeUseFormReturn(overrides) as ReturnType<typeof useForm>);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Login page', () => {
    beforeEach(() => {
        mockForm({ data: { email: '', password: '', remember: false }, errors: {} });
    });

    it('renders the email and password fields', () => {
        render(<Login canResetPassword={true} />);
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders a "Log in" button', () => {
        render(<Login canResetPassword={true} />);
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('shows the forgot password link when canResetPassword is true', () => {
        render(<Login canResetPassword={true} />);
        expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('hides the forgot password link when canResetPassword is false', () => {
        render(<Login canResetPassword={false} />);
        expect(screen.queryByText(/forgot password/i)).toBeNull();
    });

    it('renders a sign-up link', () => {
        render(<Login canResetPassword={true} />);
        expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    });

    it('shows a status message when provided', () => {
        render(<Login canResetPassword={true} status="Password reset successfully." />);
        expect(screen.getByText(/password reset successfully/i)).toBeInTheDocument();
    });

    it('calls post when the form is submitted', async () => {
        const postFn = vi.fn();
        mockForm({ data: { email: 'a@b.com', password: 'pass', remember: false }, errors: {}, post: postFn });
        const user = userEvent.setup();
        render(<Login canResetPassword={true} />);
        await user.click(screen.getByRole('button', { name: /log in/i }));
        expect(postFn).toHaveBeenCalledOnce();
    });
});

describe('Register page', () => {
    beforeEach(() => {
        mockForm({ data: { name: '', email: '', password: '', password_confirmation: '' }, errors: {} });
    });

    it('renders all registration fields', () => {
        render(<Register />);
        expect(screen.getByRole('textbox', { name: /^name$/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password\b/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('renders a Create account button', () => {
        render(<Register />);
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('renders a login link', () => {
        render(<Register />);
        expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
    });

    it('calls post when the form is submitted', async () => {
        const postFn = vi.fn();
        mockForm({
            data: { name: 'Alice', email: 'a@b.com', password: 'pass', password_confirmation: 'pass' },
            errors: {},
            post: postFn,
        });
        const user = userEvent.setup();
        render(<Register />);
        await user.click(screen.getByRole('button', { name: /create account/i }));
        expect(postFn).toHaveBeenCalledOnce();
    });
});

describe('ForgotPassword page', () => {
    beforeEach(() => {
        mockForm({ data: { email: '' }, errors: {} });
    });

    it('renders the email field', () => {
        render(<ForgotPassword />);
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('renders the submit button', () => {
        render(<ForgotPassword />);
        expect(screen.getByRole('button', { name: /email password reset link/i })).toBeInTheDocument();
    });

    it('shows status message when provided', () => {
        render(<ForgotPassword status="We have emailed your password reset link." />);
        expect(screen.getByText(/we have emailed your password reset link/i)).toBeInTheDocument();
    });

    it('renders a link back to login', () => {
        render(<ForgotPassword />);
        expect(screen.getByText(/log in/i)).toBeInTheDocument();
    });
});

describe('ResetPassword page', () => {
    beforeEach(() => {
        mockForm({ data: { token: '', email: '', password: '', password_confirmation: '' }, errors: {} });
    });

    it('renders password fields', () => {
        render(<ResetPassword token="abc123" email="user@example.com" />);
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('renders the submit button', () => {
        render(<ResetPassword token="abc123" email="user@example.com" />);
        expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
});

describe('VerifyEmail page', () => {
    beforeEach(() => {
        mockForm({});
    });

    it('renders the resend button', () => {
        render(<VerifyEmail />);
        expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument();
    });

    it('shows confirmation message when status is verification-link-sent', () => {
        render(<VerifyEmail status="verification-link-sent" />);
        expect(screen.getByText(/new verification link has been sent/i)).toBeInTheDocument();
    });
});

describe('ConfirmPassword page', () => {
    beforeEach(() => {
        mockForm({ data: { password: '' }, errors: {} });
    });

    it('renders the password field', () => {
        render(<ConfirmPassword />);
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders the confirm button', () => {
        render(<ConfirmPassword />);
        expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });
});

describe('AcceptInvite page', () => {
    beforeEach(() => {
        mockForm({ data: { name: '', password: '', password_confirmation: '' }, errors: {} });
    });

    it('renders family name in the heading', () => {
        render(<AcceptInvite token="tok123" email="user@example.com" familyName="The Smiths" role="member" />);
        expect(screen.getAllByText(/join the smiths/i).length).toBeGreaterThanOrEqual(1);
    });

    it('shows the pre-filled email as disabled', () => {
        render(<AcceptInvite token="tok123" email="user@example.com" familyName="The Smiths" role="member" />);
        const emailInput = screen.getByDisplayValue('user@example.com');
        expect(emailInput).toBeDisabled();
    });

    it('renders name and password fields', () => {
        render(<AcceptInvite token="tok123" email="user@example.com" familyName="The Smiths" role="member" />);
        expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password\b/i)).toBeInTheDocument();
    });
});

describe('TwoFactorChallenge page', () => {
    beforeEach(() => {
        mockForm({ data: { code: '', recovery_code: '' }, errors: {} });
    });

    it('renders the authentication code input by default', () => {
        render(<TwoFactorChallenge />);
        expect(screen.getByLabelText(/authentication code/i)).toBeInTheDocument();
    });

    it('renders the Log in button', () => {
        render(<TwoFactorChallenge />);
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('renders the "Use a recovery code instead" toggle', () => {
        render(<TwoFactorChallenge />);
        expect(screen.getByText(/use a recovery code instead/i)).toBeInTheDocument();
    });

    it('switches to recovery code input when toggled', async () => {
        const user = userEvent.setup({ pointerEventsCheck: 0 });
        render(<TwoFactorChallenge />);
        await user.click(screen.getByText(/use a recovery code instead/i));
        expect(screen.getByLabelText(/recovery code/i)).toBeInTheDocument();
        expect(screen.getByText(/use an authentication code instead/i)).toBeInTheDocument();
    });
});
