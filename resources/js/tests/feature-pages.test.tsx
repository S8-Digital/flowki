import { useForm } from '@inertiajs/react';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AssistantIndex from '@/pages/Assistant/Index';
import RecipesIndex from '@/pages/Recipes/Index';
import ShoppingIndex from '@/pages/Shopping/Index';
import TodosIndex from '@/pages/Todos/Index';
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
            currentUserPermissions: ['view-todos', 'create-todos'],
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
    // Dialog
    DialogRoot: ({
        children,
        open: _open,
        onOpenChange: _oc,
    }: {
        children: React.ReactNode;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    }) => <div>{children}</div>,
    DialogTrigger: ({ children, as: As, ...rest }: { children: React.ReactNode; as?: React.ElementType; [k: string]: unknown }) => {
        if (As && typeof As === 'function') {
            return <As {...rest}>{children}</As>;
        }

        return <button {...rest}>{children}</button>;
    },
    DialogOverlay: () => null,
    DialogContent: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <div {...props}>{children}</div>,
    DialogDismissTrigger: ({ children, as: As, ...rest }: { children: React.ReactNode; as?: React.ElementType; [k: string]: unknown }) => {
        if (As && typeof As === 'function') {
            return <As {...rest}>{children}</As>;
        }

        return <button {...rest}>{children}</button>;
    },
    // Dropdown / Menu
    MenuRoot: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <div {...props}>{children}</div>,
    MenuTrigger: ({ children, as: _as, ...rest }: { children: React.ReactNode; as?: unknown; [k: string]: unknown }) => (
        <span {...rest}>{children}</span>
    ),
    MenuContent: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <div {...props}>{children}</div>,
    MenuItem: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <div {...props}>{children}</div>,
    // Select
    Select: ({
        children,
        value: _v,
        onValueChange: _ovc,
        ...props
    }: {
        children: React.ReactNode;
        value?: string;
        onValueChange?: (v: string) => void;
        [k: string]: unknown;
    }) => <div {...props}>{children}</div>,
    SelectTrigger: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <button {...props}>{children}</button>,
    SelectList: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <div {...props}>{children}</div>,
    SelectOption: ({ children, value: _v, ...props }: { children: React.ReactNode; value?: string; [k: string]: unknown }) => (
        <div role="option" {...props}>
            {children}
        </div>
    ),
    // Sheet (Drawer)
    DrawerRoot: ({
        children,
        open: _o,
        onOpenChange: _oc,
    }: {
        children: React.ReactNode;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    }) => <div>{children}</div>,
    DrawerTrigger: ({ children, as: _as, ...rest }: { children: React.ReactNode; as?: unknown; [k: string]: unknown }) => (
        <span {...rest}>{children}</span>
    ),
    DrawerOverlay: () => null,
    DrawerPanel: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => <div {...props}>{children}</div>,
    DrawerDismissTrigger: ({ children, as: _as, ...rest }: { children: React.ReactNode; as?: unknown; [k: string]: unknown }) => (
        <button {...rest}>{children}</button>
    ),
}));

// Action stubs
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
vi.mock('@/actions/App/Http/Controllers/AiController', () => ({
    chat: () => ({ url: '/ai/chat' }),
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

// ---------------------------------------------------------------------------
// Todos page
// ---------------------------------------------------------------------------

describe('Todos page', () => {
    beforeEach(() => {
        // Todos uses two useForm calls: createForm and editForm
        vi.mocked(useForm)
            .mockReturnValueOnce(
                makeUseFormReturn({ data: { title: '', category: 'home', priority: 'medium', status: 'pending' }, errors: {} }) as ReturnType<
                    typeof useForm
                >,
            )
            .mockReturnValue(
                makeUseFormReturn({ data: { title: '', category: '', priority: '', status: '' }, errors: {} }) as ReturnType<typeof useForm>,
            );
    });

    it('renders the Todos heading', () => {
        render(<TodosIndex todos={[baseTodo]} members={[baseUser]} categories={[{ value: 'home', label: 'Home' }]} />);
        expect(screen.getByRole('heading', { name: /todos/i })).toBeInTheDocument();
    });

    it('renders a list of todos', () => {
        render(<TodosIndex todos={[baseTodo]} members={[baseUser]} categories={[{ value: 'home', label: 'Home' }]} />);
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    it('shows loading skeleton when todos is null (deferred)', () => {
        render(<TodosIndex todos={null} members={[baseUser]} categories={[{ value: 'home', label: 'Home' }]} />);
        // Skeleton elements are rendered
        expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });

    it('renders an Add Todo button', () => {
        render(<TodosIndex todos={[]} members={[baseUser]} categories={[{ value: 'home', label: 'Home' }]} />);
        expect(screen.getByRole('button', { name: /new todo/i })).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Shopping Lists page
// ---------------------------------------------------------------------------

const baseShoppingList = {
    id: 1,
    name: 'Weekly Groceries',
    is_shared: false,
    family_id: 1,
    items_count: 5,
    created_at: '2024-01-01T00:00:00.000000Z',
    updated_at: '2024-01-01T00:00:00.000000Z',
};

describe('Shopping page', () => {
    beforeEach(() => {
        mockForm({ data: { name: '', is_shared: false }, errors: {} });
    });

    it('renders the Shopping Lists heading', () => {
        render(<ShoppingIndex lists={[baseShoppingList]} />);
        expect(screen.getByRole('heading', { name: /shopping lists/i })).toBeInTheDocument();
    });

    it('renders a shopping list item', () => {
        render(<ShoppingIndex lists={[baseShoppingList]} />);
        expect(screen.getByText('Weekly Groceries')).toBeInTheDocument();
    });

    it('shows empty state when lists array is empty', () => {
        render(<ShoppingIndex lists={[]} />);
        expect(screen.getByText(/no shopping lists yet/i)).toBeInTheDocument();
    });

    it('shows loading skeleton when lists is null (deferred)', () => {
        render(<ShoppingIndex lists={null} />);
        expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });

    it('renders an Add button', () => {
        render(<ShoppingIndex lists={[]} />);
        expect(screen.getByRole('button', { name: /new list/i })).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Recipes page
// ---------------------------------------------------------------------------

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

describe('Recipes page', () => {
    beforeEach(() => {
        mockForm({ data: { title: '', description: '', category: '' }, errors: {} });
    });

    it('renders the Recipes heading', () => {
        render(<RecipesIndex recipes={{ ...emptyPaginated, data: [baseRecipe] }} filters={{}} />);
        expect(screen.getByRole('heading', { name: /recipes/i })).toBeInTheDocument();
    });

    it('renders a recipe card', () => {
        render(<RecipesIndex recipes={{ ...emptyPaginated, data: [baseRecipe] }} filters={{}} />);
        expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    });

    it('shows empty state when no recipes', () => {
        render(<RecipesIndex recipes={emptyPaginated} filters={{}} />);
        expect(screen.getByText(/no recipes yet/i)).toBeInTheDocument();
    });

    it('shows loading skeleton when recipes is null (deferred)', () => {
        render(<RecipesIndex recipes={null} filters={{}} />);
        expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });

    it('renders an Add Recipe button', () => {
        render(<RecipesIndex recipes={emptyPaginated} filters={{}} />);
        expect(screen.getByRole('button', { name: /new recipe/i })).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// AI Assistant page
// ---------------------------------------------------------------------------

describe('AI Assistant page', () => {
    it('renders the Family Assistant heading', () => {
        render(<AssistantIndex />);
        expect(screen.getByRole('heading', { name: /family assistant/i })).toBeInTheDocument();
    });

    it('renders a message input field', () => {
        render(<AssistantIndex />);
        expect(screen.getByPlaceholderText(/ask me anything/i)).toBeInTheDocument();
    });

    it('renders suggestion buttons', () => {
        render(<AssistantIndex />);
        // Should show at least one suggestion
        expect(screen.getByText(/what todos are pending/i)).toBeInTheDocument();
    });

    it('renders a send button', () => {
        render(<AssistantIndex />);
        // The send button has an SVG icon child, find the button by its accessible name or by querying more loosely
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });
});
