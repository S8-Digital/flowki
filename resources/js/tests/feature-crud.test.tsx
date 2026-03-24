/**
 * CRUD interaction tests for Todos, Chores, Shopping Lists and Recipes.
 *
 * These tests focus on the full CRUD lifecycle of each page:
 *   - Create dialog opens and exposes the correct form fields
 *   - Submitting the create form calls the correct Inertia action
 *   - Edit dialog opens and is pre-populated from the record
 *   - Submitting the edit form calls the correct Inertia action
 *   - Delete calls router.delete (after a confirmed prompt)
 *   - Newly created records appear in the correct column / list
 */

import { router, useForm } from '@inertiajs/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChoresIndex from '@/pages/Chores/Index';
import RecipesIndex from '@/pages/Recipes/Index';
import ShoppingIndex from '@/pages/Shopping/Index';
import TodosIndex from '@/pages/Todos/Index';
import { makeUseFormReturn } from './__mocks__/inertia';

// ---------------------------------------------------------------------------
// Global mocks
// ---------------------------------------------------------------------------

vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [_key: string]: unknown }) => (
        <a href={String(href)} {...(rest as object)}>
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
            currentUserPermissions: ['view-todos', 'create-todos', 'edit-todos', 'delete-todos'],
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

vi.mock('@/actions/App/Http/Controllers/TodoController', () => ({
    store: () => ({ url: '/todos' }),
    update: (id: number) => ({ url: `/todos/${id}` }),
    destroy: (id: number) => ({ url: `/todos/${id}` }),
    complete: (id: number) => ({ url: `/todos/${id}/complete` }),
}));

vi.mock('@/actions/App/Http/Controllers/ChoreController', () => ({
    store: () => ({ url: '/chores' }),
    update: (id: number) => ({ url: `/chores/${id}` }),
    destroy: (id: number) => ({ url: `/chores/${id}` }),
    complete: (id: number) => ({ url: `/chores/${id}/complete` }),
}));

vi.mock('@/actions/App/Http/Controllers/ShoppingListController', () => ({
    store: () => ({ url: '/shopping' }),
    show: (id: number) => ({ url: `/shopping/${id}` }),
    destroy: (id: number) => ({ url: `/shopping/${id}` }),
}));

vi.mock('@/actions/App/Http/Controllers/RecipeController', () => ({
    store: () => ({ url: '/recipes' }),
    show: (id: number) => ({ url: `/recipes/${id}` }),
    update: (id: number) => ({ url: `/recipes/${id}` }),
    destroy: (id: number) => ({ url: `/recipes/${id}` }),
}));

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

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

const secondUser = {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    family_id: 1,
    profile_color: null,
    email_verified_at: '2024-01-01T00:00:00.000000Z',
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
};

const baseTodo = {
    id: 1,
    title: 'Buy groceries',
    description: null,
    category: 'home',
    priority: 'medium',
    status: 'pending',
    due_date: null,
    reminder_enabled: false,
    reminder_lead_time: 60,
    family_id: 1,
    assignee: baseUser,
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
};

const unassignedTodo = {
    ...baseTodo,
    id: 2,
    title: 'Walk the dog',
    assignee: null,
};

const baseChore = {
    id: 1,
    title: 'Vacuum living room',
    description: null,
    frequency: 'weekly',
    next_due_date: null,
    reminder_enabled: false,
    reminder_lead_time: 60,
    family_id: 1,
    assignees: [baseUser],
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
};

const baseShoppingList = {
    id: 1,
    name: 'Weekly Groceries',
    is_shared: false,
    family_id: 1,
    items_count: 5,
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
};

const baseRecipe = {
    id: 1,
    title: 'Spaghetti Bolognese',
    description: 'A classic Italian dish',
    category: 'dinner',
    servings: 4,
    prep_time_minutes: 15,
    cook_time_minutes: 30,
    total_time_minutes: 45,
    instructions: 'Cook the pasta...',
    photo_path: null,
    rating: 4,
    is_favorite: false,
    family_id: 1,
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
};

const emptyPaginated = {
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
    links: [],
};

const categories = [{ value: 'home', label: 'Home' }];

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

/**
 * Sets up `useForm` so that the FIRST call on every render returns `createMock`
 * and the SECOND call returns `editMock`.  Using a counter-based
 * `mockImplementation` ensures the correct mock is returned even after
 * re-renders triggered by user interactions.
 */
function mockTwoForms(createOverrides: Record<string, unknown> = {}, editOverrides: Record<string, unknown> = {}) {
    const createMock = makeUseFormReturn(createOverrides) as ReturnType<typeof useForm>;
    const editMock = makeUseFormReturn(editOverrides) as ReturnType<typeof useForm>;
    let callIndex = 0;

    vi.mocked(useForm).mockImplementation(() => {
        return callIndex++ % 2 === 0 ? createMock : editMock;
    });
}

/** Set up useForm to return a single form (for pages with one useForm call). */
function mockSingleForm(overrides: Record<string, unknown> = {}) {
    vi.mocked(useForm).mockReturnValue(makeUseFormReturn(overrides) as ReturnType<typeof useForm>);
}

/**
 * Finds the action icon buttons in the page that have no accessible name,
 * title, or visible text content.  These are the edit / delete icon buttons
 * rendered inside column cards.  The delete button is always the last one.
 */
function findUnnamedActionButtons(): HTMLElement[] {
    return screen.getAllByRole('button').filter((btn) => !btn.getAttribute('aria-label') && !btn.getAttribute('title') && !btn.textContent?.trim());
}

// ===========================================================================
// TODOS
// ===========================================================================

describe('Todos – create dialog', () => {
    beforeEach(() => {
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    category: 'home',
                    priority: 'medium',
                    status: 'pending',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
            {
                data: {
                    title: '',
                    description: '',
                    category: '',
                    priority: '',
                    status: '',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );
    });

    it('opens the create dialog when the New Todo button is clicked', async () => {
        const user = userEvent.setup();
        render(<TodosIndex todos={[]} members={[baseUser]} categories={categories} />);

        await user.click(screen.getByRole('button', { name: /new todo/i }));

        expect(screen.getByRole('heading', { name: /create todo/i })).toBeInTheDocument();
    });

    it('renders the title input in the create dialog', async () => {
        const user = userEvent.setup();
        render(<TodosIndex todos={[]} members={[baseUser]} categories={categories} />);

        await user.click(screen.getByRole('button', { name: /new todo/i }));

        expect(screen.getByPlaceholderText(/what needs doing/i)).toBeInTheDocument();
    });

    it('renders description, category, priority, status and assign-to fields', async () => {
        const user = userEvent.setup();
        render(<TodosIndex todos={[]} members={[baseUser]} categories={categories} />);

        await user.click(screen.getByRole('button', { name: /new todo/i }));

        expect(screen.getByPlaceholderText(/optional details/i)).toBeInTheDocument();
        // MUI Select renders the label both in InputLabel and in the notch outline, so multiple matches are expected
        expect(screen.getAllByText('Category').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Priority').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Status').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Assign To').length).toBeGreaterThan(0);
    });

    it('renders a Create Todo submit button in the dialog', async () => {
        const user = userEvent.setup();
        render(<TodosIndex todos={[]} members={[baseUser]} categories={categories} />);

        await user.click(screen.getByRole('button', { name: /new todo/i }));

        expect(screen.getByRole('button', { name: /create todo/i })).toBeInTheDocument();
    });

    it('calls createForm.post with the /todos URL when the form is submitted', async () => {
        const postFn = vi.fn();
        mockTwoForms(
            {
                data: {
                    title: 'Test task',
                    description: '',
                    category: 'home',
                    priority: 'medium',
                    status: 'pending',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                post: postFn,
                errors: {},
            },
            {
                data: {
                    title: '',
                    description: '',
                    category: '',
                    priority: '',
                    status: '',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );
        const user = userEvent.setup();
        render(<TodosIndex todos={[]} members={[baseUser]} categories={categories} />);

        await user.click(screen.getByRole('button', { name: /new todo/i }));

        const form = document.querySelector('form');
        form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        expect(postFn).toHaveBeenCalledWith('/todos', expect.any(Object));
    });

    it('displays a title validation error when the title error is set', async () => {
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    category: 'home',
                    priority: 'medium',
                    status: 'pending',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: { title: 'The title field is required.' },
            },
            {
                data: {
                    title: '',
                    description: '',
                    category: '',
                    priority: '',
                    status: '',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );
        const user = userEvent.setup();
        render(<TodosIndex todos={[]} members={[baseUser]} categories={categories} />);

        await user.click(screen.getByRole('button', { name: /new todo/i }));

        expect(screen.getByText(/the title field is required/i)).toBeInTheDocument();
    });

    it('disables the Create Todo button while processing', async () => {
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    category: 'home',
                    priority: 'medium',
                    status: 'pending',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                processing: true,
                errors: {},
            },
            {
                data: {
                    title: '',
                    description: '',
                    category: '',
                    priority: '',
                    status: '',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );
        const user = userEvent.setup();
        render(<TodosIndex todos={[]} members={[baseUser]} categories={categories} />);

        await user.click(screen.getByRole('button', { name: /new todo/i }));

        expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
    });
});

describe('Todos – column display', () => {
    beforeEach(() => {
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    category: 'home',
                    priority: 'medium',
                    status: 'pending',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
            {
                data: {
                    title: '',
                    description: '',
                    category: '',
                    priority: '',
                    status: '',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );
    });

    it('displays a todo in the assigned member column', () => {
        render(<TodosIndex todos={[baseTodo]} members={[baseUser]} categories={categories} />);

        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    it('displays an unassigned todo with an Unassigned section', () => {
        render(<TodosIndex todos={[unassignedTodo]} members={[baseUser]} categories={categories} />);

        expect(screen.getByText('Walk the dog')).toBeInTheDocument();
        // The unassigned column header and/or toggle button both say "Unassigned"
        expect(screen.getAllByText('Unassigned').length).toBeGreaterThan(0);
    });

    it('shows todos from multiple members in separate columns', () => {
        const bobTodo = { ...baseTodo, id: 3, title: "Bob's errand", assignee: secondUser };

        render(<TodosIndex todos={[baseTodo, bobTodo]} members={[baseUser, secondUser]} categories={categories} />);

        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
        expect(screen.getByText("Bob's errand")).toBeInTheDocument();
    });

    it('shows the member column header with pending/done counts', () => {
        render(<TodosIndex todos={[baseTodo]} members={[baseUser]} categories={categories} />);

        expect(screen.getByText(/1 pending/i)).toBeInTheDocument();
    });

    it('shows "No todos" per-column empty state when a member has no todos', () => {
        render(<TodosIndex todos={[]} members={[baseUser]} categories={categories} />);

        expect(screen.getByText('No todos')).toBeInTheDocument();
    });

    it('renders edit and delete icon buttons for each todo card', () => {
        render(<TodosIndex todos={[baseTodo]} members={[baseUser]} categories={categories} />);

        const actionButtons = findUnnamedActionButtons();
        // Two action buttons per todo: edit and delete
        expect(actionButtons.length).toBeGreaterThanOrEqual(2);
    });

    /**
     * Regression: TodoController was returning {data:[...]} (paginated) instead of a plain array.
     * Rendering with a plain array must not throw ("todos.filter is not a function").
     */
    it('does not throw when todos is a plain array (regression: .filter is not a function)', () => {
        expect(() => {
            render(<TodosIndex todos={[baseTodo]} members={[baseUser]} categories={categories} />);
        }).not.toThrow();
    });

    /**
     * Regression: newly created todos must appear in the list after a successful
     * Inertia page refresh.  Confirms that if the todos prop is updated with the
     * new item, the component renders it correctly.
     */
    it('shows a newly added todo when todos prop is updated', () => {
        const newTodo = { ...baseTodo, id: 99, title: 'Newly created task' };

        render(<TodosIndex todos={[baseTodo, newTodo]} members={[baseUser]} categories={categories} />);

        expect(screen.getByText('Newly created task')).toBeInTheDocument();
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });
});

describe('Todos – edit dialog', () => {
    it('opens the edit dialog when the edit icon is clicked', async () => {
        const user = userEvent.setup();
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    category: 'home',
                    priority: 'medium',
                    status: 'pending',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
            {
                data: {
                    title: 'Buy groceries',
                    description: '',
                    category: 'home',
                    priority: 'medium',
                    status: 'pending',
                    due_date: '',
                    assigned_to: '1',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                setData: vi.fn(),
                errors: {},
            },
        );

        render(<TodosIndex todos={[baseTodo]} members={[baseUser]} categories={categories} />);

        // First unnamed action button is the edit button
        const [editBtn] = findUnnamedActionButtons();
        expect(editBtn).toBeTruthy();
        await user.click(editBtn);

        expect(screen.getByRole('heading', { name: /edit todo/i })).toBeInTheDocument();
    });

    it('calls editForm.patch with the correct URL on submit', async () => {
        const patchFn = vi.fn();
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    category: 'home',
                    priority: 'medium',
                    status: 'pending',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
            {
                data: {
                    title: 'Buy groceries',
                    description: '',
                    category: 'home',
                    priority: 'medium',
                    status: 'pending',
                    due_date: '',
                    assigned_to: '1',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                patch: patchFn,
                errors: {},
            },
        );

        const user = userEvent.setup();
        render(<TodosIndex todos={[baseTodo]} members={[baseUser]} categories={categories} />);

        const [editBtn] = findUnnamedActionButtons();
        await user.click(editBtn);

        // Dispatch submit on the edit form (it becomes the first form after the create form,
        // but the edit form only renders when editingTodo is set, so it's the only visible form)
        const forms = document.querySelectorAll('form');
        const editForm = forms[forms.length - 1];
        editForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        expect(patchFn).toHaveBeenCalledWith('/todos/1', expect.any(Object));
    });

    it('renders a Save Changes submit button in the edit dialog', async () => {
        const user = userEvent.setup();
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    category: 'home',
                    priority: 'medium',
                    status: 'pending',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
            {
                data: {
                    title: 'Buy groceries',
                    description: '',
                    category: 'home',
                    priority: 'medium',
                    status: 'pending',
                    due_date: '',
                    assigned_to: '1',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );

        render(<TodosIndex todos={[baseTodo]} members={[baseUser]} categories={categories} />);

        const [editBtn] = findUnnamedActionButtons();
        await user.click(editBtn);

        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
});

describe('Todos – delete', () => {
    beforeEach(() => {
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    category: 'home',
                    priority: 'medium',
                    status: 'pending',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
            {
                data: {
                    title: '',
                    description: '',
                    category: '',
                    priority: '',
                    status: '',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );
    });

    it('calls router.delete with the todo URL when confirmed', async () => {
        window.confirm = vi.fn(() => true);
        vi.mocked(router).delete = vi.fn();
        const user = userEvent.setup();

        render(<TodosIndex todos={[baseTodo]} members={[baseUser]} categories={categories} />);

        // Delete button is the last unnamed action button (edit is first, delete is last)
        const actionButtons = findUnnamedActionButtons();
        const deleteBtn = actionButtons.at(-1)!;
        await user.click(deleteBtn);

        expect(vi.mocked(router).delete).toHaveBeenCalledWith('/todos/1');
    });

    it('does NOT call router.delete when the confirm dialog is cancelled', async () => {
        window.confirm = vi.fn(() => false);
        vi.mocked(router).delete = vi.fn();
        const user = userEvent.setup();

        render(<TodosIndex todos={[baseTodo]} members={[baseUser]} categories={categories} />);

        const actionButtons = findUnnamedActionButtons();
        const deleteBtn = actionButtons.at(-1)!;
        await user.click(deleteBtn);

        expect(vi.mocked(router).delete).not.toHaveBeenCalled();
    });
});

describe('Todos – member filter toggles', () => {
    beforeEach(() => {
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    category: 'home',
                    priority: 'medium',
                    status: 'pending',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
            {
                data: {
                    title: '',
                    description: '',
                    category: '',
                    priority: '',
                    status: '',
                    due_date: '',
                    assigned_to: '',
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );
    });

    it('renders a toggle button for each member', () => {
        render(<TodosIndex todos={[baseTodo]} members={[baseUser, secondUser]} categories={categories} />);

        expect(screen.getByTitle(/hide alice smith/i)).toBeInTheDocument();
        expect(screen.getByTitle(/hide bob smith/i)).toBeInTheDocument();
    });

    it('hides a member column when their toggle is clicked', async () => {
        const user = userEvent.setup();

        render(<TodosIndex todos={[baseTodo]} members={[baseUser]} categories={categories} />);

        expect(screen.getByText('Buy groceries')).toBeInTheDocument();

        await user.click(screen.getByTitle(/hide alice smith/i));

        expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    });

    it('shows "No members visible" message when all columns are hidden', async () => {
        const user = userEvent.setup();

        render(<TodosIndex todos={[baseTodo]} members={[baseUser]} categories={categories} />);

        await user.click(screen.getByTitle(/hide alice smith/i));
        await user.click(screen.getByTitle(/hide unassigned/i));

        expect(screen.getByText(/no members visible/i)).toBeInTheDocument();
    });
});

// ===========================================================================
// CHORES
// ===========================================================================

describe('Chores – create dialog', () => {
    beforeEach(() => {
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    frequency: 'weekly',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
            {
                data: {
                    title: '',
                    description: '',
                    frequency: '',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );
    });

    it('opens the create dialog when the New Chore button is clicked', async () => {
        const user = userEvent.setup();
        render(<ChoresIndex chores={[]} members={[baseUser]} />);

        await user.click(screen.getByRole('button', { name: /new chore/i }));

        expect(screen.getByRole('heading', { name: /create chore/i })).toBeInTheDocument();
    });

    it('renders the title input in the create dialog', async () => {
        const user = userEvent.setup();
        render(<ChoresIndex chores={[]} members={[baseUser]} />);

        await user.click(screen.getByRole('button', { name: /new chore/i }));

        expect(screen.getByPlaceholderText(/chore name/i)).toBeInTheDocument();
    });

    it('renders frequency and assign-to fields in the create dialog', async () => {
        const user = userEvent.setup();
        render(<ChoresIndex chores={[]} members={[baseUser]} />);

        await user.click(screen.getByRole('button', { name: /new chore/i }));

        expect(screen.getAllByText('Frequency').length).toBeGreaterThan(0);
        expect(screen.getByText('Assign To')).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: /alice smith/i })).toBeInTheDocument();
    });

    it('calls createForm.post with the /chores URL when the form is submitted', async () => {
        const postFn = vi.fn();
        mockTwoForms(
            {
                data: {
                    title: 'Clean kitchen',
                    description: '',
                    frequency: 'weekly',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                post: postFn,
                errors: {},
            },
            {
                data: {
                    title: '',
                    description: '',
                    frequency: '',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );
        const user = userEvent.setup();
        render(<ChoresIndex chores={[]} members={[baseUser]} />);

        await user.click(screen.getByRole('button', { name: /new chore/i }));

        const form = document.querySelector('form');
        form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        expect(postFn).toHaveBeenCalledWith('/chores', expect.any(Object));
    });

    it('disables the Create Chore button while processing', async () => {
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    frequency: 'weekly',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                processing: true,
                errors: {},
            },
            {
                data: {
                    title: '',
                    description: '',
                    frequency: '',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );
        const user = userEvent.setup();
        render(<ChoresIndex chores={[]} members={[baseUser]} />);

        await user.click(screen.getByRole('button', { name: /new chore/i }));

        expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
    });

    it('shows a title validation error when the title error is set', async () => {
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    frequency: 'weekly',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: { title: 'The title field is required.' },
            },
            {
                data: {
                    title: '',
                    description: '',
                    frequency: '',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );
        const user = userEvent.setup();
        render(<ChoresIndex chores={[]} members={[baseUser]} />);

        await user.click(screen.getByRole('button', { name: /new chore/i }));

        expect(screen.getByText(/the title field is required/i)).toBeInTheDocument();
    });
});

describe('Chores – column display', () => {
    beforeEach(() => {
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    frequency: 'weekly',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
            {
                data: {
                    title: '',
                    description: '',
                    frequency: '',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );
    });

    it('displays a chore in the assigned member column', () => {
        render(<ChoresIndex chores={[baseChore]} members={[baseUser]} />);

        expect(screen.getByText('Vacuum living room')).toBeInTheDocument();
    });

    it('shows "No chores" per-column empty state when a member has no chores', () => {
        render(<ChoresIndex chores={[]} members={[baseUser]} />);

        expect(screen.getByText('No chores')).toBeInTheDocument();
    });

    it('renders mark-complete, edit and delete action buttons for each chore', () => {
        render(<ChoresIndex chores={[baseChore]} members={[baseUser]} />);

        // Mark complete has title="Mark complete" so it's excluded from unnamed buttons.
        // The remaining unnamed buttons are: edit, delete.
        const actionButtons = findUnnamedActionButtons();
        expect(actionButtons.length).toBeGreaterThanOrEqual(2);

        // And the mark-complete button is findable by title
        expect(screen.getByTitle(/mark complete/i)).toBeInTheDocument();
    });

    it('shows a newly added chore when the chores prop is updated', () => {
        const newChore = { ...baseChore, id: 99, title: 'Mow the lawn' };
        render(<ChoresIndex chores={[baseChore, newChore]} members={[baseUser]} />);

        expect(screen.getByText('Vacuum living room')).toBeInTheDocument();
        expect(screen.getByText('Mow the lawn')).toBeInTheDocument();
    });
});

describe('Chores – mark complete', () => {
    beforeEach(() => {
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    frequency: 'weekly',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
            {
                data: {
                    title: '',
                    description: '',
                    frequency: '',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );
    });

    it('calls router.post with the complete URL when the tick button is clicked', async () => {
        vi.mocked(router).post = vi.fn();
        const user = userEvent.setup();

        render(<ChoresIndex chores={[baseChore]} members={[baseUser]} />);

        await user.click(screen.getByTitle(/mark complete/i));

        expect(vi.mocked(router).post).toHaveBeenCalledWith('/chores/1/complete');
    });
});

describe('Chores – delete', () => {
    beforeEach(() => {
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    frequency: 'weekly',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
            {
                data: {
                    title: '',
                    description: '',
                    frequency: '',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );
    });

    it('calls router.delete with the chore URL when confirmed', async () => {
        window.confirm = vi.fn(() => true);
        vi.mocked(router).delete = vi.fn();
        const user = userEvent.setup();

        render(<ChoresIndex chores={[baseChore]} members={[baseUser]} />);

        const actionButtons = findUnnamedActionButtons();
        const deleteBtn = actionButtons.at(-1)!;
        await user.click(deleteBtn);

        expect(vi.mocked(router).delete).toHaveBeenCalledWith('/chores/1');
    });

    it('does NOT call router.delete when confirm is cancelled', async () => {
        window.confirm = vi.fn(() => false);
        vi.mocked(router).delete = vi.fn();
        const user = userEvent.setup();

        render(<ChoresIndex chores={[baseChore]} members={[baseUser]} />);

        const actionButtons = findUnnamedActionButtons();
        const deleteBtn = actionButtons.at(-1)!;
        await user.click(deleteBtn);

        expect(vi.mocked(router).delete).not.toHaveBeenCalled();
    });
});

describe('Chores – edit dialog', () => {
    it('opens the edit dialog when the edit icon is clicked', async () => {
        const user = userEvent.setup();
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    frequency: 'weekly',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
            {
                data: {
                    title: 'Vacuum living room',
                    description: '',
                    frequency: 'weekly',
                    next_due_date: '',
                    assignee_ids: ['1'] as string[],
                    reminder_enabled: false,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
        );

        render(<ChoresIndex chores={[baseChore]} members={[baseUser]} />);

        // First unnamed action button is the edit button (mark-complete has a title)
        const [editBtn] = findUnnamedActionButtons();
        expect(editBtn).toBeTruthy();
        await user.click(editBtn);

        expect(screen.getByRole('heading', { name: /edit chore/i })).toBeInTheDocument();
    });

    it('calls editForm.patch with the correct URL on submit', async () => {
        const patchFn = vi.fn();
        mockTwoForms(
            {
                data: {
                    title: '',
                    description: '',
                    frequency: 'weekly',
                    next_due_date: '',
                    assignee_ids: [] as string[],
                    reminder_enabled: true,
                    reminder_lead_time: 60,
                },
                errors: {},
            },
            {
                data: {
                    title: 'Vacuum living room',
                    description: '',
                    frequency: 'weekly',
                    next_due_date: '',
                    assignee_ids: ['1'] as string[],
                    reminder_enabled: false,
                    reminder_lead_time: 60,
                },
                patch: patchFn,
                errors: {},
            },
        );

        const user = userEvent.setup();
        render(<ChoresIndex chores={[baseChore]} members={[baseUser]} />);

        const [editBtn] = findUnnamedActionButtons();
        await user.click(editBtn!);

        const forms = document.querySelectorAll('form');
        const editForm = forms[forms.length - 1];
        editForm?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        expect(patchFn).toHaveBeenCalledWith('/chores/1', expect.any(Object));
    });
});

// ===========================================================================
// SHOPPING LISTS
// ===========================================================================

describe('Shopping Lists – create dialog', () => {
    beforeEach(() => {
        mockSingleForm({ data: { name: '', is_shared: false }, errors: {} });
    });

    it('opens the create dialog when the New List button is clicked', async () => {
        const user = userEvent.setup();
        render(<ShoppingIndex lists={[]} />);

        await user.click(screen.getByRole('button', { name: /new list/i }));

        expect(screen.getByRole('heading', { name: /create shopping list/i })).toBeInTheDocument();
    });

    it('renders the list name input in the create dialog', async () => {
        const user = userEvent.setup();
        render(<ShoppingIndex lists={[]} />);

        await user.click(screen.getByRole('button', { name: /new list/i }));

        expect(screen.getByPlaceholderText(/weekly groceries/i)).toBeInTheDocument();
    });

    it('renders the shared-with-family checkbox in the create dialog', async () => {
        const user = userEvent.setup();
        render(<ShoppingIndex lists={[]} />);

        await user.click(screen.getByRole('button', { name: /new list/i }));

        expect(screen.getByRole('checkbox', { name: /shared with family/i })).toBeInTheDocument();
    });

    it('calls post with the /shopping URL when the create form is submitted', async () => {
        const postFn = vi.fn();
        mockSingleForm({ data: { name: 'Party supplies', is_shared: false }, post: postFn, errors: {} });

        const user = userEvent.setup();
        render(<ShoppingIndex lists={[]} />);

        await user.click(screen.getByRole('button', { name: /new list/i }));

        const form = document.querySelector('form');
        form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        expect(postFn).toHaveBeenCalledWith('/shopping', expect.any(Object));
    });

    it('disables the Create List button while processing', async () => {
        mockSingleForm({ data: { name: '', is_shared: false }, processing: true, errors: {} });
        const user = userEvent.setup();
        render(<ShoppingIndex lists={[]} />);

        await user.click(screen.getByRole('button', { name: /new list/i }));

        expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
    });

    it('shows a name validation error when the name error is set', async () => {
        mockSingleForm({ data: { name: '', is_shared: false }, errors: { name: 'The name field is required.' } });
        const user = userEvent.setup();
        render(<ShoppingIndex lists={[]} />);

        await user.click(screen.getByRole('button', { name: /new list/i }));

        expect(screen.getByText(/the name field is required/i)).toBeInTheDocument();
    });
});

describe('Shopping Lists – list display', () => {
    beforeEach(() => {
        mockSingleForm({ data: { name: '', is_shared: false }, errors: {} });
    });

    it('renders each shopping list as a clickable card', () => {
        render(<ShoppingIndex lists={[baseShoppingList]} />);
        expect(screen.getByText('Weekly Groceries')).toBeInTheDocument();
    });

    it('shows the item count on the card', () => {
        render(<ShoppingIndex lists={[baseShoppingList]} />);
        expect(screen.getByText(/5 items/i)).toBeInTheDocument();
    });

    it('shows the Shared badge on shared lists', () => {
        const sharedList = { ...baseShoppingList, is_shared: true };
        render(<ShoppingIndex lists={[sharedList]} />);
        expect(screen.getByText(/shared/i)).toBeInTheDocument();
    });

    it('navigates to the list show page when a list card is clicked', async () => {
        vi.mocked(router).visit = vi.fn();
        const user = userEvent.setup();

        render(<ShoppingIndex lists={[baseShoppingList]} />);
        await user.click(screen.getByRole('button', { name: /open weekly groceries shopping list/i }));

        expect(vi.mocked(router).visit).toHaveBeenCalledWith('/shopping/1');
    });

    it('shows a newly added list when lists prop is updated', () => {
        const newList = { ...baseShoppingList, id: 99, name: 'Party Supplies' };
        render(<ShoppingIndex lists={[baseShoppingList, newList]} />);

        expect(screen.getByText('Weekly Groceries')).toBeInTheDocument();
        expect(screen.getByText('Party Supplies')).toBeInTheDocument();
    });
});

describe('Shopping Lists – delete', () => {
    beforeEach(() => {
        mockSingleForm({ data: { name: '', is_shared: false }, errors: {} });
    });

    it('calls router.delete with the list URL when confirmed', async () => {
        window.confirm = vi.fn(() => true);
        vi.mocked(router).delete = vi.fn();
        const user = userEvent.setup();

        render(<ShoppingIndex lists={[baseShoppingList]} />);

        // The delete button is the only <button> element inside the list card
        const listCard = screen.getByRole('button', { name: /open weekly groceries/i });
        const deleteBtn = listCard.querySelector('button') as HTMLButtonElement;
        expect(deleteBtn).toBeTruthy();
        await user.click(deleteBtn);

        expect(vi.mocked(router).delete).toHaveBeenCalledWith('/shopping/1');
    });

    it('does NOT call router.delete when confirm is cancelled', async () => {
        window.confirm = vi.fn(() => false);
        vi.mocked(router).delete = vi.fn();
        const user = userEvent.setup();

        render(<ShoppingIndex lists={[baseShoppingList]} />);

        const listCard = screen.getByRole('button', { name: /open weekly groceries/i });
        const deleteBtn = listCard.querySelector('button') as HTMLButtonElement;
        await user.click(deleteBtn!);

        expect(vi.mocked(router).delete).not.toHaveBeenCalled();
    });
});

// ===========================================================================
// RECIPES
// ===========================================================================

describe('Recipes – create dialog', () => {
    beforeEach(() => {
        mockSingleForm({
            data: {
                title: '',
                description: '',
                category: '',
                servings: '',
                prep_time_minutes: '',
                cook_time_minutes: '',
                instructions: '',
                photo: null,
            },
            errors: {},
        });
    });

    it('opens the create dialog when the New Recipe button is clicked', async () => {
        const user = userEvent.setup();
        render(<RecipesIndex recipes={emptyPaginated} filters={{}} />);

        await user.click(screen.getByRole('button', { name: /new recipe/i }));

        expect(screen.getByRole('heading', { name: /create recipe/i })).toBeInTheDocument();
    });

    it('renders the title input in the create dialog', async () => {
        const user = userEvent.setup();
        render(<RecipesIndex recipes={emptyPaginated} filters={{}} />);

        await user.click(screen.getByRole('button', { name: /new recipe/i }));

        expect(screen.getByPlaceholderText(/recipe name/i)).toBeInTheDocument();
    });

    it('renders category, servings, prep time and cook time fields', async () => {
        const user = userEvent.setup();
        render(<RecipesIndex recipes={emptyPaginated} filters={{}} />);

        await user.click(screen.getByRole('button', { name: /new recipe/i }));

        expect(screen.getAllByText('Category').length).toBeGreaterThan(0);
        expect(screen.getByPlaceholderText(/^4$/)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/^15$/)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/^30$/)).toBeInTheDocument();
    });

    it('renders the instructions textarea in the create dialog', async () => {
        const user = userEvent.setup();
        render(<RecipesIndex recipes={emptyPaginated} filters={{}} />);

        await user.click(screen.getByRole('button', { name: /new recipe/i }));

        expect(screen.getByPlaceholderText(/step by step instructions/i)).toBeInTheDocument();
    });

    it('renders a photo file input in the create dialog', async () => {
        const user = userEvent.setup();
        render(<RecipesIndex recipes={emptyPaginated} filters={{}} />);

        await user.click(screen.getByRole('button', { name: /new recipe/i }));

        const fileInput = document.querySelector('input[type="file"]');
        expect(fileInput).toBeTruthy();
    });

    it('calls post with the /recipes URL when the create form is submitted', async () => {
        const postFn = vi.fn();
        mockSingleForm({
            data: {
                title: 'Pancakes',
                description: '',
                category: 'breakfast',
                servings: '4',
                prep_time_minutes: '10',
                cook_time_minutes: '15',
                instructions: 'Mix and fry.',
                photo: null,
            },
            post: postFn,
            errors: {},
        });

        const user = userEvent.setup();
        render(<RecipesIndex recipes={emptyPaginated} filters={{}} />);

        await user.click(screen.getByRole('button', { name: /new recipe/i }));

        const form = document.querySelector('form');
        form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        expect(postFn).toHaveBeenCalledWith('/recipes', expect.objectContaining({ forceFormData: true }));
    });

    it('disables the Create Recipe button while processing', async () => {
        mockSingleForm({
            data: {
                title: '',
                description: '',
                category: '',
                servings: '',
                prep_time_minutes: '',
                cook_time_minutes: '',
                instructions: '',
                photo: null,
            },
            processing: true,
            errors: {},
        });
        const user = userEvent.setup();
        render(<RecipesIndex recipes={emptyPaginated} filters={{}} />);

        await user.click(screen.getByRole('button', { name: /new recipe/i }));

        expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
    });

    it('shows a title validation error when the title error is set', async () => {
        mockSingleForm({
            data: {
                title: '',
                description: '',
                category: '',
                servings: '',
                prep_time_minutes: '',
                cook_time_minutes: '',
                instructions: '',
                photo: null,
            },
            errors: { title: 'The title field is required.' },
        });
        const user = userEvent.setup();
        render(<RecipesIndex recipes={emptyPaginated} filters={{}} />);

        await user.click(screen.getByRole('button', { name: /new recipe/i }));

        expect(screen.getByText(/the title field is required/i)).toBeInTheDocument();
    });
});

describe('Recipes – recipe card display', () => {
    beforeEach(() => {
        mockSingleForm({
            data: {
                title: '',
                description: '',
                category: '',
                servings: '',
                prep_time_minutes: '',
                cook_time_minutes: '',
                instructions: '',
                photo: null,
            },
            errors: {},
        });
    });

    it('renders a recipe card with the title', () => {
        render(<RecipesIndex recipes={{ ...emptyPaginated, data: [baseRecipe] }} filters={{}} />);
        expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    });

    it('renders the recipe description on the card', () => {
        render(<RecipesIndex recipes={{ ...emptyPaginated, data: [baseRecipe] }} filters={{}} />);
        expect(screen.getByText('A classic Italian dish')).toBeInTheDocument();
    });

    it('renders the total time on the card', () => {
        render(<RecipesIndex recipes={{ ...emptyPaginated, data: [baseRecipe] }} filters={{}} />);
        expect(screen.getByText(/45m/i)).toBeInTheDocument();
    });

    it('renders the recipe rating on the card', () => {
        render(<RecipesIndex recipes={{ ...emptyPaginated, data: [baseRecipe] }} filters={{}} />);
        expect(screen.getByText(/4\/5/i)).toBeInTheDocument();
    });

    it('navigates to the recipe show page when a card is clicked', async () => {
        vi.mocked(router).visit = vi.fn();
        const user = userEvent.setup();

        render(<RecipesIndex recipes={{ ...emptyPaginated, data: [baseRecipe] }} filters={{}} />);

        await user.click(screen.getByRole('button', { name: /view spaghetti bolognese recipe/i }));

        expect(vi.mocked(router).visit).toHaveBeenCalledWith('/recipes/1');
    });

    it('shows a newly created recipe when recipes prop is updated', () => {
        const newRecipe = { ...baseRecipe, id: 99, title: 'Lemon Tart' };

        render(<RecipesIndex recipes={{ ...emptyPaginated, data: [baseRecipe, newRecipe] }} filters={{}} />);

        expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
        expect(screen.getByText('Lemon Tart')).toBeInTheDocument();
    });
});

describe('Recipes – delete', () => {
    beforeEach(() => {
        mockSingleForm({
            data: {
                title: '',
                description: '',
                category: '',
                servings: '',
                prep_time_minutes: '',
                cook_time_minutes: '',
                instructions: '',
                photo: null,
            },
            errors: {},
        });
    });

    it('calls router.delete with the recipe URL when confirmed', async () => {
        window.confirm = vi.fn(() => true);
        vi.mocked(router).delete = vi.fn();
        const user = userEvent.setup();

        render(<RecipesIndex recipes={{ ...emptyPaginated, data: [baseRecipe] }} filters={{}} />);

        // The delete button is the only <button> inside the recipe card
        const recipeCard = screen.getByRole('button', { name: /view spaghetti bolognese recipe/i });
        const deleteBtn = recipeCard.querySelector('button') as HTMLButtonElement;
        expect(deleteBtn).toBeTruthy();
        await user.click(deleteBtn);

        expect(vi.mocked(router).delete).toHaveBeenCalledWith('/recipes/1');
    });

    it('does NOT call router.delete when confirm is cancelled', async () => {
        window.confirm = vi.fn(() => false);
        vi.mocked(router).delete = vi.fn();
        const user = userEvent.setup();

        render(<RecipesIndex recipes={{ ...emptyPaginated, data: [baseRecipe] }} filters={{}} />);

        const recipeCard = screen.getByRole('button', { name: /view spaghetti bolognese recipe/i });
        const deleteBtn = recipeCard.querySelector('button') as HTMLButtonElement;
        await user.click(deleteBtn!);

        expect(vi.mocked(router).delete).not.toHaveBeenCalled();
    });
});
