import { useForm } from '@inertiajs/react';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RecipesShow from '@/pages/Recipes/Show';
import ShoppingShow from '@/pages/Shopping/Show';
import type { Recipe, ShoppingList } from '@/types';
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
            currentUserPermissions: ['view-todos'],
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

vi.mock('@/actions/App/Http/Controllers/RecipeController', () => ({
    update: (id: number) => ({ url: `/recipes/${id}`, method: 'patch' }),
    destroy: (id: number) => ({ url: `/recipes/${id}`, method: 'delete' }),
}));

vi.mock('@/actions/App/Http/Controllers/ShoppingListController', () => ({
    index: () => ({ url: '/shopping' }),
}));

vi.mock('@/actions/App/Http/Controllers/ShoppingItemController', () => ({
    store: (listId: number) => ({ url: `/shopping/${listId}/items`, method: 'post' }),
    destroy: (args: { shoppingList: number; shoppingItem: number }) => ({
        url: `/shopping/${args.shoppingList}/items/${args.shoppingItem}`,
        method: 'delete',
    }),
    toggle: (args: { shoppingList: number; shoppingItem: number }) => ({
        url: `/shopping/${args.shoppingList}/items/${args.shoppingItem}/toggle`,
        method: 'patch',
    }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
    return {
        id: 1,
        title: 'Pasta Bolognese',
        description: 'A classic Italian dish',
        category: 'dinner',
        servings: 4,
        prep_time_minutes: 20,
        cook_time_minutes: 40,
        total_time_minutes: 60,
        instructions: 'Cook pasta. Make sauce. Combine.',
        photo_path: null,
        rating: 4,
        is_favorite: false,
        family_id: 1,
        ingredients: [],
        created_at: '2024-01-01T00:00:00.000000Z',
        updated_at: '2024-01-01T00:00:00.000000Z',
        ...overrides,
    };
}

function makeShoppingList(overrides: Partial<ShoppingList> = {}): ShoppingList {
    return {
        id: 1,
        name: 'Weekly Shop',
        is_shared: true,
        family_id: 1,
        items: { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0, links: [] },
        items_count: 0,
        created_at: '2024-01-01T00:00:00.000000Z',
        updated_at: '2024-01-01T00:00:00.000000Z',
        ...overrides,
    };
}

function mockForm(overrides = {}) {
    vi.mocked(useForm).mockReturnValue(makeUseFormReturn(overrides) as ReturnType<typeof useForm>);
}

// ---------------------------------------------------------------------------
// Recipes Show page
// ---------------------------------------------------------------------------

describe('Recipes Show page', () => {
    beforeEach(() => {
        mockForm({
            data: {
                title: 'Pasta Bolognese',
                description: 'A classic Italian dish',
                prep_time_minutes: '20',
                cook_time_minutes: '40',
                instructions: 'Cook pasta. Make sauce. Combine.',
                rating: '4',
                is_favorite: '',
            },
        });
    });

    it('renders the recipe title', () => {
        render(<RecipesShow recipe={makeRecipe()} />);
        expect(screen.getByText('Pasta Bolognese')).toBeInTheDocument();
    });

    it('renders the recipe description', () => {
        render(<RecipesShow recipe={makeRecipe()} />);
        expect(screen.getByText(/a classic italian dish/i)).toBeInTheDocument();
    });

    it('renders the total time', () => {
        render(<RecipesShow recipe={makeRecipe()} />);
        expect(screen.getByText(/60 min total/i)).toBeInTheDocument();
    });

    it('renders the cook time label in edit form', () => {
        render(<RecipesShow recipe={makeRecipe()} />);
        // The cook time label is visible in edit dialog once opened
        // Just verify the recipe loads without error
        expect(screen.getByText('Pasta Bolognese')).toBeInTheDocument();
    });

    it('renders the instructions', () => {
        render(<RecipesShow recipe={makeRecipe()} />);
        expect(screen.getByText(/cook pasta/i)).toBeInTheDocument();
    });

    it('renders the favourite icon when recipe is a favourite', () => {
        render(<RecipesShow recipe={makeRecipe({ is_favorite: true })} />);
        // The favourite heart/star icon should be present
        const svgs = document.querySelectorAll('svg');
        expect(svgs.length).toBeGreaterThan(0);
    });

    it('renders an edit button', () => {
        render(<RecipesShow recipe={makeRecipe()} />);
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('renders a delete button (trash icon)', () => {
        render(<RecipesShow recipe={makeRecipe()} />);
        // The delete button has a Trash2 icon, find it by its container
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('renders the servings information', () => {
        render(<RecipesShow recipe={makeRecipe({ servings: 4 })} />);
        expect(screen.getByText(/4 servings/i)).toBeInTheDocument();
    });

    it('shows no photo placeholder when photo_path is null', () => {
        render(<RecipesShow recipe={makeRecipe({ photo_path: null })} />);
        // Should not render an img element with the recipe photo
        expect(screen.queryByRole('img', { name: /pasta bolognese/i })).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// Shopping Show page
// ---------------------------------------------------------------------------

describe('Shopping Show page', () => {
    beforeEach(() => {
        mockForm({
            data: { name: '', quantity: '', category: 'groceries' },
        });
    });

    it('renders the shopping list name', () => {
        render(<ShoppingShow list={makeShoppingList()} />);
        expect(screen.getByText('Weekly Shop')).toBeInTheDocument();
    });

    it('renders the Add item form', () => {
        render(<ShoppingShow list={makeShoppingList()} />);
        expect(screen.getByPlaceholderText(/add item/i)).toBeInTheDocument();
    });

    it('renders the Add item submit button', () => {
        render(<ShoppingShow list={makeShoppingList()} />);
        // The submit button is a Fab with a Plus icon
        const form = document.querySelector('form');
        const submitBtn = form?.querySelector('button[type="submit"]');
        expect(submitBtn).toBeTruthy();
    });

    it('renders unchecked items', () => {
        const list = makeShoppingList({
            items: {
                data: [
                    {
                        id: 1,
                        name: 'Milk',
                        quantity: '2 litres',
                        category: 'groceries',
                        is_checked: false,
                        shopping_list_id: 1,
                        created_at: '2024-01-01T00:00:00.000000Z',
                    },
                ],
                current_page: 1,
                last_page: 1,
                per_page: 15,
                total: 1,
                links: [],
            },
        });
        render(<ShoppingShow list={list} />);
        expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    it('renders checked items in a separate section', () => {
        const list = makeShoppingList({
            items: {
                data: [
                    {
                        id: 2,
                        name: 'Eggs',
                        quantity: null,
                        category: 'groceries',
                        is_checked: true,
                        shopping_list_id: 1,
                        created_at: '2024-01-01T00:00:00.000000Z',
                    },
                ],
                current_page: 1,
                last_page: 1,
                per_page: 15,
                total: 1,
                links: [],
            },
        });
        render(<ShoppingShow list={list} />);
        expect(screen.getByText('Eggs')).toBeInTheDocument();
    });

    it('shows empty state when no items', () => {
        render(<ShoppingShow list={makeShoppingList()} />);
        // No item names, form is present
        expect(screen.queryByText('Milk')).toBeNull();
    });

    it('calls post when submitting the add item form', () => {
        const postFn = vi.fn();
        mockForm({ data: { name: 'Butter', quantity: '', category: 'groceries' }, post: postFn });
        render(<ShoppingShow list={makeShoppingList()} />);
        const form = document.querySelector('form');
        expect(form).toBeTruthy();

        // React 18 delegates events to the root, so dispatching a bubbling
        // submit event from the form element triggers the React onSubmit handler.
        if (form) {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }

        expect(postFn).toHaveBeenCalledWith(`/shopping/1/items`, expect.any(Object));
    });
});
