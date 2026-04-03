import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CalendarScheduleWidget from '@/components/Dashboard/CalendarScheduleWidget';
import CalendarTodayWidget from '@/components/Dashboard/CalendarTodayWidget';
import MealPlannerWidget from '@/components/Dashboard/MealPlannerWidget';
import ShoppingListWidget from '@/components/Dashboard/ShoppingListWidget';
import TodoListWidget from '@/components/Dashboard/TodoListWidget';

// ---------------------------------------------------------------------------
// CalendarTodayWidget
// ---------------------------------------------------------------------------

const baseCalendarEvent = {
    id: 1,
    title: 'Team Meeting',
    start_at: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    end_at: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    is_all_day: false,
    color: '#6366f1',
    location: 'Conference Room',
};

describe('CalendarTodayWidget', () => {
    it('shows empty state when there are no events', () => {
        render(<CalendarTodayWidget events={[]} />);
        expect(screen.getByText(/nothing scheduled for today/i)).toBeInTheDocument();
    });

    it('renders an event title', () => {
        render(<CalendarTodayWidget events={[baseCalendarEvent]} />);
        expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    });

    it('renders "All day" for all-day events', () => {
        render(<CalendarTodayWidget events={[{ ...baseCalendarEvent, is_all_day: true }]} />);
        expect(screen.getByText(/all day/i)).toBeInTheDocument();
    });

    it('renders formatted time for timed events', () => {
        render(<CalendarTodayWidget events={[baseCalendarEvent]} />);
        // Check that a time-like string is in the document (e.g. "10:00 AM – 11:00 AM")
        const allText = screen.getByText(/–/).textContent;
        expect(allText).not.toBeNull();
    });

    it('renders multiple events', () => {
        const events = [baseCalendarEvent, { ...baseCalendarEvent, id: 2, title: 'Lunch Break' }];
        render(<CalendarTodayWidget events={events} />);
        expect(screen.getByText('Team Meeting')).toBeInTheDocument();
        expect(screen.getByText('Lunch Break')).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// CalendarScheduleWidget
// ---------------------------------------------------------------------------

const futureEvent = {
    id: 1,
    title: 'Dentist Appointment',
    start_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_at: null,
    is_all_day: false,
    color: '#10b981',
    location: null,
};

describe('CalendarScheduleWidget', () => {
    it('shows empty state when there are no events', () => {
        render(<CalendarScheduleWidget events={[]} />);
        expect(screen.getByText(/no upcoming events/i)).toBeInTheDocument();
    });

    it('renders an event title', () => {
        render(<CalendarScheduleWidget events={[futureEvent]} />);
        expect(screen.getByText('Dentist Appointment')).toBeInTheDocument();
    });

    it('renders multiple events', () => {
        const events = [futureEvent, { ...futureEvent, id: 2, title: 'Family Dinner' }];
        render(<CalendarScheduleWidget events={events} />);
        expect(screen.getByText('Dentist Appointment')).toBeInTheDocument();
        expect(screen.getByText('Family Dinner')).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// TodoListWidget
// ---------------------------------------------------------------------------

const baseTodoItem = {
    id: 1,
    title: 'Buy milk',
    status: 'pending',
    priority: 'medium',
    category: 'groceries',
    due_date: null,
};

describe('TodoListWidget', () => {
    it('shows empty state when there are no todos', () => {
        render(<TodoListWidget todos={[]} />);
        expect(screen.getByText(/no todos due today/i)).toBeInTheDocument();
    });

    it('renders a todo item', () => {
        render(<TodoListWidget todos={[baseTodoItem]} />);
        expect(screen.getByText('Buy milk')).toBeInTheDocument();
    });

    it('renders the status of a todo', () => {
        render(<TodoListWidget todos={[baseTodoItem]} />);
        expect(screen.getByText('pending')).toBeInTheDocument();
    });

    it('renders completed todo with line-through', () => {
        render(<TodoListWidget todos={[{ ...baseTodoItem, status: 'completed' }]} />);
        const titleEl = screen.getByText('Buy milk');
        expect(titleEl).toHaveStyle({ textDecoration: 'line-through' });
    });

    it('renders multiple todos', () => {
        const todos = [baseTodoItem, { ...baseTodoItem, id: 2, title: 'Walk the dog' }];
        render(<TodoListWidget todos={todos} />);
        expect(screen.getByText('Buy milk')).toBeInTheDocument();
        expect(screen.getByText('Walk the dog')).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// ShoppingListWidget
// ---------------------------------------------------------------------------

const shoppingList = {
    id: 1,
    name: 'Weekly Shop',
    items: [
        { id: 1, name: 'Apples', quantity: '6', category: 'fruit', is_checked: false },
        { id: 2, name: 'Milk', quantity: '2L', category: 'dairy', is_checked: true },
    ],
};

describe('ShoppingListWidget', () => {
    it('shows empty shopping list message when items array is empty', () => {
        render(<ShoppingListWidget shoppingItems={{ 1: { ...shoppingList, items: [] } }} shoppingLists={[{ id: 1, name: 'Weekly Shop' }]} />);
        expect(screen.getByText(/nothing left to buy/i)).toBeInTheDocument();
    });

    it('renders shopping item names', () => {
        render(<ShoppingListWidget shoppingItems={{ 1: shoppingList }} shoppingLists={[{ id: 1, name: 'Weekly Shop' }]} />);
        expect(screen.getByText('Apples')).toBeInTheDocument();
        expect(screen.getByText('Milk')).toBeInTheDocument();
    });

    it('shows the list name', () => {
        render(<ShoppingListWidget shoppingItems={{ 1: shoppingList }} shoppingLists={[{ id: 1, name: 'Weekly Shop' }]} />);
        expect(screen.getByText('Weekly Shop')).toBeInTheDocument();
    });

    it('shows "no data" when shoppingItems is empty', () => {
        render(<ShoppingListWidget shoppingItems={{}} shoppingLists={[]} />);
        expect(screen.queryByText('Apples')).toBeNull();
    });

    it('picks the list by listId when provided', () => {
        const items = {
            1: shoppingList,
            2: { id: 2, name: 'Weekend List', items: [{ id: 3, name: 'Pasta', quantity: '500g', category: 'dry-goods', is_checked: false }] },
        };
        render(
            <ShoppingListWidget
                shoppingItems={items}
                listId={2}
                shoppingLists={[
                    { id: 1, name: 'Weekly Shop' },
                    { id: 2, name: 'Weekend List' },
                ]}
            />,
        );
        expect(screen.getByText('Pasta')).toBeInTheDocument();
        expect(screen.queryByText('Apples')).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// MealPlannerWidget
// ---------------------------------------------------------------------------

const baseDinner = {
    id: 1,
    planned_date: '2026-03-31',
    meal_type: 'dinner',
    notes: null,
    recipe: {
        id: 1,
        title: 'Spaghetti Bolognese',
        photo_path: null,
        rating: 4,
    },
};

describe('MealPlannerWidget', () => {
    it('shows empty state when no dinners', () => {
        render(<MealPlannerWidget weekDinners={[]} />);
        expect(screen.getByText(/no dinners planned this week/i)).toBeInTheDocument();
    });

    it('renders dinner recipe title', () => {
        render(<MealPlannerWidget weekDinners={[baseDinner]} />);
        expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
    });

    it('renders day abbreviation for the dinner', () => {
        render(<MealPlannerWidget weekDinners={[baseDinner]} />);
        // 2026-03-31 is a Tuesday
        expect(screen.getByText('Tue')).toBeInTheDocument();
    });

    it('renders multiple dinners', () => {
        const dinners = [
            baseDinner,
            {
                id: 2,
                planned_date: '2026-04-01',
                meal_type: 'dinner',
                notes: null,
                recipe: { id: 2, title: 'Chicken Soup', photo_path: null, rating: null },
            },
        ];
        render(<MealPlannerWidget weekDinners={dinners} />);
        expect(screen.getByText('Spaghetti Bolognese')).toBeInTheDocument();
        expect(screen.getByText('Chicken Soup')).toBeInTheDocument();
    });
});
