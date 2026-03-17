import { useForm } from '@inertiajs/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FamilyCreate from '@/pages/Family/Create';
import FamilyJoin from '@/pages/Family/Join';
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

vi.mock('@material-tailwind/react', () => ({
    Button: ({
        children,
        as: Tag = 'button',
        href,
        isFullWidth: _ifw,
        color: _c,
        variant: _v,
        ripple: _ripple,
        size: _size,
        ...rest
    }: {
        children: React.ReactNode;
        as?: string;
        href?: string;
        isFullWidth?: boolean;
        color?: string;
        variant?: string;
        ripple?: boolean;
        size?: string;
        [k: string]: unknown;
    }) => (
        <Tag href={href} {...rest}>
            {children}
        </Tag>
    ),
    InputRoot: React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ ...props }, ref) => <input ref={ref} {...props} />),
    CheckboxRoot: React.forwardRef<
        HTMLButtonElement,
        React.ComponentProps<'button'> & { onCheckedChange?: (checked: boolean) => void; ripple?: boolean }
    >(({ children, onCheckedChange: _occh, ripple: _ripple, ...props }, ref) => (
        <button ref={ref} role="checkbox" {...props}>
            {children}
        </button>
    )),
    CheckboxIndicator: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Collapse: ({ children, open }: { children: React.ReactNode; open?: boolean }) => (open ? <div>{children}</div> : null),
    Card: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <div {...props}>{children}</div>,
    CardBody: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <div {...props}>{children}</div>,
    CardHeader: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <div {...props}>{children}</div>,
    CardFooter: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <div {...props}>{children}</div>,
    TooltipRoot: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Route/action stubs
vi.mock('@/actions/App/Http/Controllers/FamilyController', () => ({
    store: () => ({ url: '/family' }),
    join: () => ({ url: '/family/join' }),
    joinStore: () => ({ url: '/family/join' }),
    create: () => ({ url: '/family/create' }),
}));

vi.mock('@/routes', () => ({
    login: () => '/login',
    register: () => '/register',
    logout: () => '/logout',
    dashboard: () => '/dashboard',
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockForm(overrides = {}) {
    vi.mocked(useForm).mockReturnValue(makeUseFormReturn(overrides) as ReturnType<typeof useForm>);
}

// ---------------------------------------------------------------------------
// Family Create page
// ---------------------------------------------------------------------------

describe('Family Create page', () => {
    beforeEach(() => {
        mockForm({ data: { name: '' }, errors: {} });
    });

    it('renders the heading', () => {
        render(<FamilyCreate />);
        expect(screen.getByRole('heading', { name: /create a family/i })).toBeInTheDocument();
    });

    it('renders the family name input', () => {
        render(<FamilyCreate />);
        expect(screen.getByLabelText(/family name/i)).toBeInTheDocument();
    });

    it('renders the submit button', () => {
        render(<FamilyCreate />);
        expect(screen.getByRole('button', { name: /create family/i })).toBeInTheDocument();
    });

    it('renders a link to join a family instead', () => {
        render(<FamilyCreate />);
        expect(screen.getByText(/join a family instead/i)).toBeInTheDocument();
    });

    it('calls post when the form is submitted', async () => {
        const postFn = vi.fn();
        mockForm({ data: { name: 'The Smiths' }, errors: {}, post: postFn });
        const user = userEvent.setup();
        render(<FamilyCreate />);
        await user.click(screen.getByRole('button', { name: /create family/i }));
        expect(postFn).toHaveBeenCalledOnce();
    });
});

// ---------------------------------------------------------------------------
// Family Join page
// ---------------------------------------------------------------------------

describe('Family Join page', () => {
    beforeEach(() => {
        mockForm({ data: { invite_code: '' }, errors: {} });
    });

    it('renders the heading', () => {
        render(<FamilyJoin />);
        expect(screen.getByRole('heading', { name: /join a family/i })).toBeInTheDocument();
    });

    it('renders the invite code input', () => {
        render(<FamilyJoin />);
        expect(screen.getByLabelText(/invite code/i)).toBeInTheDocument();
    });

    it('renders the submit button', () => {
        render(<FamilyJoin />);
        expect(screen.getByRole('button', { name: /join family/i })).toBeInTheDocument();
    });

    it('renders a link to create a new family', () => {
        render(<FamilyJoin />);
        expect(screen.getByText(/create a new family/i)).toBeInTheDocument();
    });

    it('calls post when the form is submitted', async () => {
        const postFn = vi.fn();
        mockForm({ data: { invite_code: 'ABCD1234' }, errors: {}, post: postFn });
        const user = userEvent.setup();
        render(<FamilyJoin />);
        await user.click(screen.getByRole('button', { name: /join family/i }));
        expect(postFn).toHaveBeenCalledOnce();
    });
});
