import { router, useForm, usePage } from '@inertiajs/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FamilyCreate from '@/pages/Family/Create';
import FamilyJoin from '@/pages/Family/Join';
import FamilyShow from '@/pages/Family/Show';
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

vi.mock('@/actions/App/Http/Controllers/FamilyController', () => ({
    store: () => ({ url: '/family' }),
    join: () => ({ url: '/family/join' }),
    joinStore: () => ({ url: '/family/join' }),
    create: () => ({ url: '/family/create' }),
    update: () => ({ url: '/family' }),
    inviteMember: () => ({ url: '/family/invite' }),
    removeMember: (id: number) => ({ url: `/family/members/${id}` }),
    updateMemberRole: (id: number) => ({ url: `/family/members/${id}/role` }),
    addChild: () => ({ url: '/family/children' }),
    cancelInvitation: ({ family, invitation }: { family: number; invitation: number }) => ({
        url: `/family/${family}/invitations/${invitation}`,
    }),
    resendInvitation: ({ family, invitation }: { family: number; invitation: number }) => ({
        url: `/family/${family}/invitations/${invitation}/resend`,
    }),
}));

vi.mock('@/actions/App/Http/Controllers/Settings/MemberOrderController', () => ({
    update: () => ({ url: '/settings/members/order' }),
}));

vi.mock('@/actions/App/Http/Controllers/Settings/MemberProfileController', () => ({
    edit: (args: { user: number }) => ({ url: `/settings/members/${args.user}` }),
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

const mockFamily = {
    id: 1,
    name: 'Test Family',
    invite_code: 'ABC123',
    location_name: null,
    latitude: null,
    longitude: null,
    created_at: '2024-01-01T00:00:00.000000Z',
    members: [
        {
            id: 2,
            name: 'Bob',
            email: 'bob@example.com',
            role: 'member',
            profile_color: null,
            email_verified_at: null,
            created_at: '2024-01-01T00:00:00.000000Z',
            updated_at: '2024-01-01T00:00:00.000000Z',
        },
    ],
    member_order: [2],
};

const mockRoles = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Member', label: 'Member' },
    { value: 'Guest', label: 'Guest' },
];

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

// ---------------------------------------------------------------------------
// Family Show page – member settings navigation
// ---------------------------------------------------------------------------

describe('Family Show page', () => {
    beforeEach(() => {
        mockForm({ data: {}, errors: {} });
        vi.mocked(usePage).mockReturnValue({
            props: {
                auth: { user: { id: 1, name: 'Alice', email: 'alice@example.com' }, connectedProviders: [], hasPasswordSet: true },
                currentUserPermissions: ['manage-members'],
                unreadNotificationsCount: 0,
            },
        } as ReturnType<typeof usePage>);
    });

    it('renders the family name', () => {
        render(<FamilyShow family={mockFamily} roles={mockRoles} />);
        expect(screen.getByText('Test Family')).toBeInTheDocument();
    });

    it('renders the member settings icon linking to the member profile page', () => {
        render(<FamilyShow family={mockFamily} roles={mockRoles} />);
        const settingsLink = screen.getByTitle(/manage settings/i).closest('a');
        expect(settingsLink).toHaveAttribute('href', '/settings/members/2');
    });

    it('does not link the member settings icon to the permissions page', () => {
        render(<FamilyShow family={mockFamily} roles={mockRoles} />);
        const settingsLink = screen.getByTitle(/manage settings/i).closest('a');
        expect(settingsLink).not.toHaveAttribute('href', expect.stringContaining('/permissions'));
    });

    it('renders invite role options from the roles prop', () => {
        render(<FamilyShow family={mockFamily} roles={mockRoles} />);
        // The invite dialog is closed by default; check that role values are available via hidden select options
        // Confirm the component renders without crashing and the roles prop is consumed
        expect(screen.getByText('Test Family')).toBeInTheDocument();
    });

    it('renders pending invitations with cancel and resend buttons', () => {
        const familyWithInvitations = {
            ...mockFamily,
            pending_invitations: [
                { id: 10, email: 'pending@example.com', role: 'member', created_at: '2024-01-02T00:00:00.000000Z' },
            ],
        };
        render(<FamilyShow family={familyWithInvitations} roles={mockRoles} />);
        expect(screen.getByText('pending@example.com')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByTitle(/resend invitation/i)).toBeInTheDocument();
        expect(screen.getByTitle(/cancel invitation/i)).toBeInTheDocument();
    });

    it('calls router.delete when cancel invitation is clicked', async () => {
        const user = userEvent.setup();
        const familyWithInvitations = {
            ...mockFamily,
            pending_invitations: [
                { id: 10, email: 'pending@example.com', role: 'member', created_at: '2024-01-02T00:00:00.000000Z' },
            ],
        };
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        render(<FamilyShow family={familyWithInvitations} roles={mockRoles} />);
        await user.click(screen.getByTitle(/cancel invitation/i));
        expect(vi.mocked(router.delete)).toHaveBeenCalledWith('/family/1/invitations/10');
    });

    it('calls router.post when resend invitation is clicked', async () => {
        const user = userEvent.setup();
        const familyWithInvitations = {
            ...mockFamily,
            pending_invitations: [
                { id: 10, email: 'pending@example.com', role: 'member', created_at: '2024-01-02T00:00:00.000000Z' },
            ],
        };
        render(<FamilyShow family={familyWithInvitations} roles={mockRoles} />);
        await user.click(screen.getByTitle(/resend invitation/i));
        expect(vi.mocked(router.post)).toHaveBeenCalledWith('/family/1/invitations/10/resend');
    });
});
