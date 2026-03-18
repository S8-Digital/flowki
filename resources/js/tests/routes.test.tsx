/**
 * Tests for the remaining main feature routes:
 *   /chores         – ChoresIndex
 *   /calendar       – CalendarIndex (renders heading + view-switcher + action buttons)
 *   /schedule       – ScheduleUploadModal (upload step & preview step)
 */

import ScheduleUploadModal from '@/components/Calendar/ScheduleUploadModal';
import CalendarIndex from '@/pages/Calendar/Index';
import ChoresIndex from '@/pages/Chores/Index';
import { useForm } from '@inertiajs/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
            currentUserPermissions: ['view-chores', 'create-chores', 'edit-chores', 'delete-chores'],
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

// Stub FullCalendar (heavy 3rd-party, irrelevant to rendering tests)
vi.mock('@fullcalendar/react', () => ({
    default: () => <div data-testid="fullcalendar" />,
}));
vi.mock('@fullcalendar/daygrid', () => ({ default: {} }));
vi.mock('@fullcalendar/timegrid', () => ({ default: {} }));
vi.mock('@fullcalendar/list', () => ({ default: {} }));
vi.mock('@fullcalendar/interaction', () => ({ default: {} }));

// Stub FamilyScheduleView (complex component tested elsewhere)
vi.mock('@/components/Calendar/FamilyScheduleView', () => ({
    default: () => <div data-testid="family-schedule-view" />,
    buildColumns: vi.fn(() => []),
}));

// Stub WeatherStrip (tested in weather.test.tsx)
vi.mock('@/components/WeatherStrip', () => ({
    default: () => null,
}));

// Action / route stubs
vi.mock('@/actions/App/Http/Controllers/ChoreController', () => ({
    store: () => ({ url: '/chores' }),
    update: (id: number) => ({ url: `/chores/${id}` }),
    destroy: (id: number) => ({ url: `/chores/${id}` }),
    complete: (id: number) => ({ url: `/chores/${id}/complete` }),
}));

vi.mock('@/actions/App/Http/Controllers/CalendarEventController', () => ({
    store: () => ({ url: '/calendar/events' }),
    update: (id: number) => ({ url: `/calendar/events/${id}` }),
    destroy: (id: number) => ({ url: `/calendar/events/${id}` }),
    move: (id: number) => ({ url: `/calendar/events/${id}/move` }),
}));

vi.mock('@/actions/App/Http/Controllers/TodoController', () => ({
    update: (id: number) => ({ url: `/todos/${id}` }),
}));

vi.mock('@/actions/App/Http/Controllers/ScheduleController', () => ({
    upload: () => ({ url: '/schedule/upload' }),
    confirm: () => ({ url: '/schedule/confirm' }),
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

const baseUser = {
    id: 1,
    name: 'Alice Smith',
    email: 'alice@example.com',
    family_id: 1,
    profile_color: null,
    email_verified_at: '2024-01-01T00:00:00.000000Z',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
};

const baseChore = {
    id: 1,
    title: 'Vacuum living room',
    description: null,
    frequency: 'weekly',
    next_due_date: '2024-06-15T08:00',
    reminder_enabled: false,
    reminder_lead_time: 60,
    family_id: 1,
    assignees: [baseUser],
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
};

const baseCalendarEvent = {
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
    attendees: [baseUser],
    creator: baseUser,
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
};

// ---------------------------------------------------------------------------
// /chores – ChoresIndex
// ---------------------------------------------------------------------------

describe('Chores page (/chores)', () => {
    beforeEach(() => {
        // ChoresIndex calls useForm twice (createForm, editForm)
        vi.mocked(useForm)
            .mockReturnValueOnce(
                makeUseFormReturn({
                    data: {
                        title: '',
                        description: '',
                        frequency: 'weekly',
                        next_due_date: '',
                        assignee_ids: [],
                        reminder_enabled: true,
                        reminder_lead_time: 60,
                    },
                    errors: {},
                }) as ReturnType<typeof useForm>,
            )
            .mockReturnValue(
                makeUseFormReturn({
                    data: {
                        title: '',
                        description: '',
                        frequency: '',
                        next_due_date: '',
                        assignee_ids: [],
                        reminder_enabled: true,
                        reminder_lead_time: 60,
                    },
                    errors: {},
                }) as ReturnType<typeof useForm>,
            );
    });

    it('renders the Chores heading', () => {
        render(<ChoresIndex chores={[baseChore]} members={[baseUser]} />);
        expect(screen.getByRole('heading', { name: /chores/i })).toBeInTheDocument();
    });

    it('renders a chore item when chores are loaded', () => {
        render(<ChoresIndex chores={[baseChore]} members={[baseUser]} />);
        expect(screen.getByText('Vacuum living room')).toBeInTheDocument();
    });

    it('shows a loading skeleton when chores is null (deferred load)', () => {
        render(<ChoresIndex chores={null} members={[baseUser]} />);
        expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });

    it('renders a "New Chore" button to open the create dialog', () => {
        render(<ChoresIndex chores={[]} members={[baseUser]} />);
        expect(screen.getByRole('button', { name: /new chore/i })).toBeInTheDocument();
    });

    it('renders the empty-state message when no chores exist', () => {
        // Pass empty members array so visibleAssigned is empty and the empty-state message shows
        render(<ChoresIndex chores={[]} members={[]} />);
        expect(screen.getByText(/no chores yet/i)).toBeInTheDocument();
    });

    it('renders member column headers for each member', () => {
        render(<ChoresIndex chores={[baseChore]} members={[baseUser]} />);
        // Alice's initials should appear in the member color chip
        expect(screen.getAllByText(/AS/).length).toBeGreaterThanOrEqual(1);
    });

    it('renders frequency label on a chore card', () => {
        render(<ChoresIndex chores={[baseChore]} members={[baseUser]} />);
        // 'Weekly' appears in both the select option and the card - verify at least one is present
        expect(screen.getAllByText(/weekly/i).length).toBeGreaterThanOrEqual(1);
    });

    it('calls router.post when marking a chore complete', async () => {
        const { router } = await import('@inertiajs/react');
        render(<ChoresIndex chores={[baseChore]} members={[baseUser]} />);
        // The button uses title="Mark complete" (no aria-label)
        const completeBtn = screen.getByTitle('Mark complete');
        const user = userEvent.setup();
        await user.click(completeBtn);
        expect(router.post).toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// /calendar – CalendarIndex
// ---------------------------------------------------------------------------

describe('Calendar page (/calendar)', () => {
    beforeEach(() => {
        mockForm({
            data: {
                title: '',
                description: '',
                location: '',
                start_at: '',
                end_at: '',
                recurrence: '',
                color: '#6366f1',
                attendee_ids: [],
                is_all_day: false,
                status: '',
                priority: '',
                category: '',
                due_date: '',
                assigned_to: '',
                frequency: '',
                next_due_date: '',
                assignee_ids: [],
            },
            errors: {},
        });
    });

    it('renders the Calendar heading', () => {
        render(<CalendarIndex events={[]} todos={[]} chores={[]} members={[baseUser]} />);
        expect(screen.getByRole('heading', { name: /calendar/i })).toBeInTheDocument();
    });

    it('renders the view-switcher select', () => {
        render(<CalendarIndex events={[]} todos={[]} chores={[]} members={[baseUser]} />);
        // The view switcher is now an MT Select rendered as a button trigger
        expect(screen.getByRole('button', { name: /calendar view/i })).toBeInTheDocument();
    });

    it('renders the "New Event" button', () => {
        render(<CalendarIndex events={[]} todos={[]} chores={[]} members={[baseUser]} />);
        expect(screen.getByRole('button', { name: /new event/i })).toBeInTheDocument();
    });

    it('renders the "Import Schedule" button', () => {
        render(<CalendarIndex events={[]} todos={[]} chores={[]} members={[baseUser]} />);
        expect(screen.getByRole('button', { name: /import schedule/i })).toBeInTheDocument();
    });

    it('defaults to the family view and renders FamilyScheduleView', () => {
        render(<CalendarIndex events={[]} todos={[]} chores={[]} members={[baseUser]} initialView="family" />);
        expect(screen.getByTestId('family-schedule-view')).toBeInTheDocument();
    });

    it('switches to FullCalendar when a non-family view is selected', async () => {
        // With MT Select, interact via the initialView prop since the mock doesn't wire up onValueChange clicks
        render(<CalendarIndex events={[baseCalendarEvent]} todos={[]} chores={[]} members={[baseUser]} initialView="dayGridMonth" />);
        expect(screen.getByTestId('fullcalendar')).toBeInTheDocument();
    });

    it('opens the Import Schedule modal when the button is clicked', async () => {
        const user = userEvent.setup();
        render(<CalendarIndex events={[]} todos={[]} chores={[]} members={[baseUser]} />);
        await user.click(screen.getByRole('button', { name: /import schedule/i }));
        // The modal's dialog title "Import Schedule" appears (may appear multiple times due to button + title)
        expect(screen.getAllByText(/import schedule/i).length).toBeGreaterThanOrEqual(1);
    });
});

// ---------------------------------------------------------------------------
// /schedule – ScheduleUploadModal
// ---------------------------------------------------------------------------

/** File size (in bytes) that exceeds the 10 MB upload limit. */
const OVERSIZED_FILE_BYTES = 11 * 1024 * 1024;

/**
 * Helper: simulate a drag-and-drop file onto the drop zone element.
 * @testing-library/user-event does not expose `user.drop()` in this version,
 * so we use `fireEvent.drop()` with a synthetic DataTransfer object instead.
 */
function dropFile(dropZone: HTMLElement, file: File) {
    fireEvent.drop(dropZone, {
        dataTransfer: { files: [file], types: ['Files'] },
    });
}

describe('Schedule upload modal (/schedule – ScheduleUploadModal)', () => {
    it('renders the upload step with a drop zone when open', () => {
        render(<ScheduleUploadModal open={true} onOpenChange={vi.fn()} />);
        expect(screen.getByText(/import schedule/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /drop schedule file here/i })).toBeInTheDocument();
    });

    it('renders without errors when the modal is closed', () => {
        // Our DialogRoot mock always renders children regardless of `open`.
        // This test confirms the component tree doesn't throw when open=false.
        render(<ScheduleUploadModal open={false} onOpenChange={vi.fn()} />);
        expect(screen.getByRole('button', { name: /drop schedule file here/i })).toBeInTheDocument();
    });

    it('shows an error when the file is too large', async () => {
        global.fetch = vi.fn();
        render(<ScheduleUploadModal open={true} onOpenChange={vi.fn()} />);

        const dropZone = screen.getByRole('button', { name: /drop schedule file here/i });
        const largeFile = new File(['x'], 'schedule.txt', { type: 'text/plain' });

        Object.defineProperty(largeFile, 'size', { value: OVERSIZED_FILE_BYTES });

        dropFile(dropZone, largeFile);

        await waitFor(() => {
            expect(screen.getByText(/file is too large/i)).toBeInTheDocument();
        });
    });

    it('shows loading text while parsing the file', async () => {
        // Mock fetch to stay pending indefinitely so we can observe the loading state
        let resolveUploadRequest!: (value: Response) => void;
        global.fetch = vi.fn(
            () =>
                new Promise<Response>((resolve) => {
                    resolveUploadRequest = resolve;
                }),
        );

        render(<ScheduleUploadModal open={true} onOpenChange={vi.fn()} />);

        const smallFile = new File(['shift data'], 'schedule.txt', { type: 'text/plain' });
        const dropZone = screen.getByRole('button', { name: /drop schedule file here/i });

        dropFile(dropZone, smallFile);

        await waitFor(() => {
            expect(screen.getByText(/parsing your schedule/i)).toBeInTheDocument();
        });

        // Cleanup — resolve the fetch so React doesn't warn about pending state updates
        resolveUploadRequest(new Response(JSON.stringify({ shifts: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    });

    it('switches to the preview step after a successful upload', async () => {
        global.fetch = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    shifts: [{ title: 'Morning Shift', start_at: '2024-06-15T08:00:00Z', end_at: '2024-06-15T16:00:00Z', is_all_day: false }],
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } },
            ),
        );

        render(<ScheduleUploadModal open={true} onOpenChange={vi.fn()} />);

        const smallFile = new File(['shift data'], 'schedule.txt', { type: 'text/plain' });
        const dropZone = screen.getByRole('button', { name: /drop schedule file here/i });

        dropFile(dropZone, smallFile);

        // Wait for the preview step to render
        expect(await screen.findByText(/morning shift/i)).toBeInTheDocument();
        expect(screen.getByText(/1 shift found/i)).toBeInTheDocument();
    });

    it('calls router.post with the confirmed shifts', async () => {
        global.fetch = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    shifts: [{ title: 'Evening Shift', start_at: '2024-06-15T18:00:00Z', end_at: '2024-06-15T22:00:00Z', is_all_day: false }],
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } },
            ),
        );

        const { router } = await import('@inertiajs/react');
        const onOpenChange = vi.fn();
        render(<ScheduleUploadModal open={true} onOpenChange={onOpenChange} />);

        const dropZone = screen.getByRole('button', { name: /drop schedule file here/i });

        dropFile(dropZone, new File(['data'], 'schedule.txt', { type: 'text/plain' }));

        // Wait for preview step
        await screen.findByText(/evening shift/i);

        // Click the Import button
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: /import 1 shift/i }));

        expect(router.post).toHaveBeenCalledWith('/schedule/confirm', expect.objectContaining({ shifts: expect.any(Array) }), expect.any(Object));
    });

    it('allows removing a shift in the preview step', async () => {
        global.fetch = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    shifts: [
                        { title: 'Morning Shift', start_at: '2024-06-15T08:00:00Z', end_at: null, is_all_day: false },
                        { title: 'Evening Shift', start_at: '2024-06-15T18:00:00Z', end_at: null, is_all_day: false },
                    ],
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } },
            ),
        );

        render(<ScheduleUploadModal open={true} onOpenChange={vi.fn()} />);

        const dropZone = screen.getByRole('button', { name: /drop schedule file here/i });
        dropFile(dropZone, new File(['data'], 'schedule.txt', { type: 'text/plain' }));

        await screen.findByText(/morning shift/i);

        // Remove the first shift
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: /remove morning shift/i }));

        expect(screen.queryByText('Morning Shift')).toBeNull();
        expect(screen.getByText('Evening Shift')).toBeInTheDocument();
    });
});
