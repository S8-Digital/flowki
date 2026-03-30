import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { Alert } from 'react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MealsScreen from '@/app/(tabs)/meals';
import type { Meal, Recipe, ShoppingList } from '@/lib/api';

let mockUser: { id: number; family_id: number | null } | null = {
  id: 1,
  family_id: 42,
};

vi.mock('@/store', () => ({
  useAppSelector: vi.fn((selector: (state: { auth: { user: typeof mockUser } }) => unknown) =>
    selector({ auth: { user: mockUser } })),
}));

vi.mock('react-native-paper', async () => {
  const React = await import('react');

  const Button = ({
    children,
    onPress,
    disabled,
    loading,
    testID,
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    loading?: boolean;
    mode?: string;
    compact?: boolean;
    textColor?: string;
    testID?: string;
  }) =>
    React.createElement('button', { onClick: onPress, disabled: disabled || loading, 'data-testid': testID }, children);

  const TextInput = ({
    value,
    onChangeText,
    label,
  }: {
    value?: string;
    onChangeText?: (value: string) => void;
    label?: string;
    mode?: string;
    style?: unknown;
    keyboardType?: string;
  }) =>
    React.createElement('input', {
      value: value ?? '',
      placeholder: label,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChangeText?.(event.target.value),
    });

  const ActivityIndicator = () => React.createElement('div', { 'data-testid': 'activity-indicator' });
  const FAB = ({ onPress }: { onPress?: () => void; icon?: string; style?: unknown; color?: string }) =>
    React.createElement('button', { 'data-testid': 'fab', onClick: onPress }, '+');
  const Portal = ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children);

  const Dialog = Object.assign(
    ({ visible, children }: { visible?: boolean; children?: React.ReactNode; onDismiss?: () => void }) =>
      visible ? React.createElement('div', { 'data-testid': 'dialog' }, children) : null,
    {
      Title: ({ children }: { children?: React.ReactNode }) => React.createElement('h2', {}, children),
      Content: ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children),
      Actions: ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children),
    },
  );

  const Card = Object.assign(
    ({ children }: { children?: React.ReactNode; style?: unknown }) => React.createElement('div', { 'data-testid': 'card' }, children),
    {
      Content: ({ children }: { children?: React.ReactNode; style?: unknown }) => React.createElement('div', {}, children),
    },
  );

  return { ActivityIndicator, Button, Card, Dialog, FAB, Portal, TextInput };
});

vi.mock('@/components/ThemedText', () => ({
  ThemedText: ({ children }: { children?: React.ReactNode; style?: unknown; variant?: string }) =>
    React.createElement('span', {}, children ?? null),
}));

vi.mock('@/components/ThemedView', () => ({
  ThemedView: ({ children }: { children?: React.ReactNode; style?: unknown }) =>
    React.createElement('div', {}, children ?? null),
}));

vi.mock('@/constants/Colors', () => ({
  Colors: {
    light: {
      tint: '#3B82F6',
      card: '#F3F4F6',
      muted: '#6B7280',
      destructive: '#EF4444',
      background: '#FFFFFF',
      text: '#111827',
      border: '#E5E7EB',
    },
    dark: {
      tint: '#3B82F6',
      card: '#151718',
      muted: '#9CA3AF',
      destructive: '#EF4444',
      background: '#000000',
      text: '#FFFFFF',
      border: '#374151',
    },
  },
}));

vi.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

const { mockMealsApi, mockRecipesApi, mockShoppingApi } = vi.hoisted(() => ({
  mockMealsApi: {
    create: vi.fn(() => Promise.resolve()),
    remove: vi.fn(() => Promise.resolve()),
    addGroceries: vi.fn(() => Promise.resolve({ message: 'ok' })),
  },
  mockRecipesApi: {
    list: vi.fn(),
  },
  mockShoppingApi: {
    lists: vi.fn(),
  },
}));

vi.mock('@/lib/api', () => ({
  mealsApi: mockMealsApi,
  recipesApi: mockRecipesApi,
  shoppingApi: mockShoppingApi,
}));

let mockRtdbData: Record<string, Meal> = {};
let mockRtdbLoading = false;

vi.mock('@/hooks/useRtdb', () => ({
  useRtdb: vi.fn(() => ({ data: mockRtdbData, isLoading: mockRtdbLoading })),
}));

const makeRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
  id: 1,
  family_id: 42,
  created_by: 1,
  title: 'Pasta Bake',
  description: null,
  category: 'dinner',
  servings: 4,
  is_favorite: false,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

const makeList = (overrides: Partial<ShoppingList> = {}): ShoppingList => ({
  id: 10,
  family_id: 42,
  name: 'Weekly Groceries',
  items: [],
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

const makeMeal = (overrides: Partial<Meal> = {}): Meal => ({
  id: 1,
  family_id: 42,
  created_by: 1,
  recipe_id: 1,
  planned_date: '2026-03-30',
  meal_type: 'dinner',
  servings: 4,
  notes: null,
  recipe: makeRecipe(),
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

describe('Meals screen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { id: 1, family_id: 42 };
    mockRtdbLoading = false;
    mockRtdbData = {};
    mockRecipesApi.list.mockResolvedValue([makeRecipe()]);
    mockShoppingApi.lists.mockResolvedValue([makeList()]);
  });

  it('shows an activity indicator while loading', () => {
    mockRtdbLoading = true;
    mockRecipesApi.list.mockImplementation(() => new Promise(() => {}));
    mockShoppingApi.lists.mockImplementation(() => new Promise(() => {}));
    render(React.createElement(MealsScreen));
    expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();
  });

  it('shows an empty state when a week has no meals', async () => {
    render(React.createElement(MealsScreen));
    await waitFor(() => expect(screen.getAllByText(/no meals planned/i).length).toBeGreaterThan(0));
  });

  it('renders meals for the current week', async () => {
    mockRtdbData = {
      '1': makeMeal(),
    };

    render(React.createElement(MealsScreen));

    await waitFor(() => expect(screen.getByText('Pasta Bake')).toBeInTheDocument());
    expect(screen.getByText(/Dinner/i)).toBeInTheDocument();
  });

  it('opens the add meal dialog from the FAB', async () => {
    render(React.createElement(MealsScreen));
    await waitFor(() => screen.getByTestId('fab'));
    fireEvent.click(screen.getByTestId('fab'));
    expect(screen.getByRole('heading', { name: /add meal/i })).toBeInTheDocument();
  });

  it('calls mealsApi.create with the selected recipe and shopping list', async () => {
    render(React.createElement(MealsScreen));
    await waitFor(() => screen.getByTestId('fab'));
    fireEvent.click(screen.getByTestId('fab'));

    fireEvent.change(screen.getByPlaceholderText('Date (YYYY-MM-DD)'), {
      target: { value: '2026-03-31' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Dinner' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pasta Bake' }));
    fireEvent.click(screen.getByRole('button', { name: /Weekly Groceries/i }));
    fireEvent.change(screen.getByPlaceholderText('Servings'), {
      target: { value: '6' },
    });
    fireEvent.change(screen.getByPlaceholderText('Notes'), {
      target: { value: 'Family dinner' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save Meal/i }));

    await waitFor(() =>
      expect(mockMealsApi.create).toHaveBeenCalledWith({
        planned_date: '2026-03-31',
        meal_type: 'dinner',
        recipe_id: 1,
        servings: 6,
        notes: 'Family dinner',
        shopping_list_id: 10,
      }),
    );
  });

  it('can add a meal without a recipe', async () => {
    render(React.createElement(MealsScreen));
    await waitFor(() => screen.getByTestId('fab'));
    fireEvent.click(screen.getByTestId('fab'));
    fireEvent.change(screen.getByPlaceholderText('Date (YYYY-MM-DD)'), {
      target: { value: '2026-04-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save Meal/i }));

    await waitFor(() =>
      expect(mockMealsApi.create).toHaveBeenCalledWith({
        planned_date: '2026-04-01',
        meal_type: 'dinner',
        recipe_id: null,
        servings: null,
        notes: null,
        shopping_list_id: null,
      }),
    );
  });

  it('deletes a meal after confirmation', async () => {
    mockRtdbData = {
      '1': makeMeal(),
    };

    render(React.createElement(MealsScreen));
    await waitFor(() => screen.getByText('Pasta Bake'));
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

    const [, , buttons] = vi.mocked(Alert.alert).mock.calls[0];
    await buttons[1].onPress();

    await waitFor(() => expect(mockMealsApi.remove).toHaveBeenCalledWith(1));
  });

  it('opens the groceries dialog and submits to mealsApi.addGroceries', async () => {
    mockRtdbData = {
      '1': makeMeal(),
    };

    render(React.createElement(MealsScreen));
    await waitFor(() => screen.getByText('Pasta Bake'));
    fireEvent.click(screen.getByRole('button', { name: /Groceries/i }));
    expect(screen.getByText('Add to Shopping List')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Add Ingredients/i }));

    await waitFor(() => expect(mockMealsApi.addGroceries).toHaveBeenCalledWith(1, 10));
  });

  it('navigates between weeks', async () => {
    render(React.createElement(MealsScreen));
    await waitFor(() => screen.getByText(/–/));
    const initialLabel = screen.getByText(/–/).textContent;

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(screen.getByText(/–/).textContent).not.toEqual(initialLabel));
  });

  it('shows a family requirement message when the user has no family', async () => {
    mockUser = { id: 1, family_id: null };
    render(React.createElement(MealsScreen));
    await waitFor(() =>
      expect(screen.getByText(/join or create a family to plan meals/i)).toBeInTheDocument(),
    );
  });
});
