/**
 * Shared domain types used across the web (Inertia/MUI) and mobile
 * (Expo/React Native Paper) workspaces.
 *
 * These are the minimal/flat shapes that match the Laravel API responses on
 * both platforms. Platform-specific extensions (e.g. nested Eloquent relations
 * on web, auth token shapes on mobile) live in each workspace's own types.
 */

export interface User {
    id: number;
    name: string;
    email: string | null;
    profile_color?: string | null;
    family_id?: number | null;
    role?: string;
    avatar?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Family {
    id: number;
    name: string;
    invite_code: string;
    location_name?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    members?: User[];
    created_at: string;
    updated_at?: string;
}

export interface Todo {
    id: number;
    family_id: number;
    created_by: number;
    assigned_to?: number | null;
    title: string;
    description?: string | null;
    category?: string | null;
    priority?: string | null;
    status: string;
    due_date?: string | null;
    reminder_enabled?: boolean;
    created_at: string;
    updated_at: string;
}

export interface Chore {
    id: number;
    family_id: number;
    created_by: number;
    title: string;
    description?: string | null;
    frequency?: string | null;
    next_due_date?: string | null;
    last_completed_at?: string | null;
    reminder_enabled?: boolean;
    created_at: string;
    updated_at: string;
}

export interface CalendarEvent {
    id: number;
    family_id: number;
    created_by: number;
    title: string;
    description?: string | null;
    location?: string | null;
    start_at: string;
    end_at: string | null;
    is_all_day?: boolean;
    color?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ShoppingItem {
    id: number;
    shopping_list_id: number;
    name: string;
    quantity?: string | null;
    category?: string | null;
    is_checked: boolean;
    added_by: number;
    created_at: string;
    updated_at?: string;
}

export interface ShoppingList {
    id: number;
    family_id: number;
    name: string;
    items?: ShoppingItem[];
    created_at: string;
    updated_at: string;
}

export interface RecipeIngredient {
    id: number;
    recipe_id: number;
    name: string;
    quantity?: string | null;
    unit?: string | null;
    sort_order?: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface Recipe {
    id: number;
    family_id: number;
    created_by?: number;
    title: string;
    description?: string | null;
    category?: string | null;
    servings?: number | null;
    prep_time_minutes?: number | null;
    cook_time_minutes?: number | null;
    total_time_minutes?: number | null;
    instructions?: string | null;
    photo_path?: string | null;
    rating?: number | null;
    is_favorite: boolean;
    ingredients?: RecipeIngredient[];
    created_at: string;
    updated_at: string;
}

export interface Meal {
    id: number;
    family_id: number;
    created_by: number;
    recipe_id?: number | null;
    planned_date?: string | null;
    meal_type?: string | null;
    servings?: number | null;
    notes?: string | null;
    recipe?: Recipe | null;
    created_at: string;
    updated_at: string;
}

export interface WeatherCurrent {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    description: string;
    icon_url?: string | null;
}

export interface WeatherDay {
    date: string;
    temp_min: number;
    temp_max: number;
    description: string;
    icon_url?: string | null;
}

export interface WeatherData {
    location: string;
    current: WeatherCurrent;
    forecast: WeatherDay[];
}
