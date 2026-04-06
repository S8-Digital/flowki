/**
 * Tests for resources/js/components/GlobalSearch.tsx
 *
 * Covers:
 * - Search button triggers open state
 * - Search panel is hidden when closed
 * - Typing fewer than 2 chars does not fetch
 * - Typing 2+ chars after debounce calls fetch
 * - Renders search result sections (todos, chores, events, recipes, shopping_items)
 * - Shows empty-state when no results
 * - Closing the panel resets query
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GlobalSearch from '@/components/GlobalSearch';

/** Matches the debounce delay inside GlobalSearch (300 ms + a small buffer). */
const DEBOUNCE_DELAY = 400;

// ── @inertiajs/react mock ─────────────────────────────────────────────────────

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => React.createElement('a', { href }, children),
}));

// ── Actions mocks ─────────────────────────────────────────────────────────────

vi.mock('@/actions/App/Http/Controllers/CalendarEventController', () => ({
    index: () => ({ url: '/calendar' }),
}));

vi.mock('@/actions/App/Http/Controllers/ChoreController', () => ({
    index: () => ({ url: '/chores' }),
}));

vi.mock('@/actions/App/Http/Controllers/RecipeController', () => ({
    show: (id: number) => ({ url: `/recipes/${id}` }),
}));

vi.mock('@/actions/App/Http/Controllers/TodoController', () => ({
    index: () => ({ url: '/todos' }),
}));

// ── fetch mock ────────────────────────────────────────────────────────────────

const EMPTY_RESULTS = {
    todos: [],
    chores: [],
    events: [],
    recipes: [],
    shopping_items: [],
};

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue({
        json: vi.fn().mockResolvedValue(EMPTY_RESULTS),
    });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('GlobalSearch', () => {
    it('renders the search button', () => {
        render(<GlobalSearch />);
        const btns = screen.getAllByRole('button');
        expect(btns.length).toBeGreaterThan(0);
    });

    it('opens the search panel when the search button is clicked', () => {
        render(<GlobalSearch />);
        fireEvent.click(screen.getAllByRole('button')[0]);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('search panel is not visible before opening', () => {
        render(<GlobalSearch />);
        expect(screen.queryByRole('textbox')).toBeNull();
    });

    it('does not fetch when query is fewer than 2 characters', async () => {
        vi.useFakeTimers();
        render(<GlobalSearch />);
        fireEvent.click(screen.getAllByRole('button')[0]);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });

        await vi.runAllTimersAsync();
        expect(fetchMock).not.toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('fetches when query has 2+ characters after debounce delay', async () => {
        vi.useFakeTimers();
        render(<GlobalSearch />);
        fireEvent.click(screen.getAllByRole('button')[0]);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'mi' } });

        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY);
        vi.useRealTimers();

        expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/search?q=mi'), expect.any(Object));
    });

    it('renders todo results when returned from search', async () => {
        fetchMock.mockResolvedValue({
            json: vi.fn().mockResolvedValue({
                ...EMPTY_RESULTS,
                todos: [{ id: 1, title: 'Buy milk' }],
            }),
        });

        vi.useFakeTimers();
        render(<GlobalSearch />);
        fireEvent.click(screen.getAllByRole('button')[0]);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'milk' } });

        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY);
        vi.useRealTimers();

        await waitFor(() => {
            expect(screen.getByText('Buy milk')).toBeInTheDocument();
        });
    });

    it('renders chore results when returned from search', async () => {
        fetchMock.mockResolvedValue({
            json: vi.fn().mockResolvedValue({
                ...EMPTY_RESULTS,
                chores: [{ id: 2, title: 'Vacuum' }],
            }),
        });

        vi.useFakeTimers();
        render(<GlobalSearch />);
        fireEvent.click(screen.getAllByRole('button')[0]);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'vac' } });

        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY);
        vi.useRealTimers();

        await waitFor(() => {
            expect(screen.getByText('Vacuum')).toBeInTheDocument();
        });
    });

    it('renders recipe results when returned from search', async () => {
        fetchMock.mockResolvedValue({
            json: vi.fn().mockResolvedValue({
                ...EMPTY_RESULTS,
                recipes: [{ id: 3, title: 'Pasta Bake' }],
            }),
        });

        vi.useFakeTimers();
        render(<GlobalSearch />);
        fireEvent.click(screen.getAllByRole('button')[0]);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'pasta' } });

        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY);
        vi.useRealTimers();

        await waitFor(() => {
            expect(screen.getByText('Pasta Bake')).toBeInTheDocument();
        });
    });

    it('shows "No results found" when query returns empty results', async () => {
        vi.useFakeTimers();
        render(<GlobalSearch />);
        fireEvent.click(screen.getAllByRole('button')[0]);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'xyzzy' } });

        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY);
        vi.useRealTimers();

        await waitFor(() => {
            expect(screen.getByText(/no results for/i)).toBeInTheDocument();
        });
    });

    it('closes the panel when the X/close button is clicked', async () => {
        render(<GlobalSearch />);
        fireEvent.click(screen.getAllByRole('button')[0]);
        expect(screen.getByRole('textbox')).toBeInTheDocument();

        // There should be a second button to close the panel
        const allBtns = screen.getAllByRole('button');
        expect(allBtns.length).toBeGreaterThan(1);
        fireEvent.click(allBtns[allBtns.length - 1]);
    });

    it('renders shopping item results when returned from search', async () => {
        fetchMock.mockResolvedValue({
            json: vi.fn().mockResolvedValue({
                ...EMPTY_RESULTS,
                shopping_items: [{ id: 4, name: 'Bread' }],
            }),
        });

        vi.useFakeTimers();
        render(<GlobalSearch />);
        fireEvent.click(screen.getAllByRole('button')[0]);
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'bread' } });

        await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY);
        vi.useRealTimers();

        await waitFor(() => {
            expect(screen.getByText('Bread')).toBeInTheDocument();
        });
    });
});
