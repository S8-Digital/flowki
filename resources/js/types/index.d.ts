import type { RouteDefinition } from '@/wayfinder';
import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    connectedProviders: string[];
    hasPasswordSet: boolean;
}

export interface Resource<T> {
    data: T;
}

export interface ResourceCollection<T> {
    data: T[];
}

export interface PaginatedResource<T> extends ResourceCollection<T> {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface PaginatedResource<T> extends ResourceCollection<T> {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface BreadcrumbItem {
    title: string;
    href: string | RouteDefinition<string>;
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon;
    isActive?: boolean;
    iconColor?: string;
}

export type AppPageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    currentUserPermissions: string[];
    unreadNotificationsCount: number;
};

export interface User {
    id: number;
    name: string;
    email: string | null;
    family_id: number | null;
    family?: { id: number; name: string; invite_code: string } | null;
    role?: string;
    is_pending?: boolean;
    is_child?: boolean;
    avatar?: string;
    profile_color?: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Family {
    id: number;
    name: string;
    invite_code: string;
    location_name: string | null;
    latitude: number | null;
    longitude: number | null;
    members?: User[];
    member_order?: number[];
    created_at: string;
}

export interface Permission {
    name: string;
    granted: boolean;
}

export interface PermissionGroup {
    group: string;
    permissions: Permission[];
}

export interface Todo {
    id: number;
    title: string;
    description: string | null;
    category: string;
    priority: string;
    status: string;
    due_date: string | null; // datetime-local format: Y-m-d\TH:i
    reminder_enabled: boolean;
    reminder_lead_time: number;
    family_id: number;
    assignee?: User;
    creator?: User;
    created_at: string;
    updated_at: string;
}

export interface Chore {
    id: number;
    title: string;
    description: string | null;
    frequency: string;
    next_due_date: string | null; // datetime-local format: Y-m-d\TH:i
    reminder_enabled: boolean;
    reminder_lead_time: number;
    family_id: number;
    assignees?: User[];
    creator?: User;
    created_at: string;
    updated_at: string;
}

export interface AppNotification {
    id: string;
    type: string;
    data: Record<string, unknown>;
    read_at: string | null;
    created_at: string;
}

export interface CalendarEvent {
    id: number;
    title: string;
    description: string | null;
    location: string | null;
    start_at: string;
    end_at: string | null;
    is_all_day: boolean;
    recurrence: string | null;
    reminder_at: string | null;
    color: string | null;
    family_id: number;
    attendees?: User[];
    creator?: User;
    created_at: string;
    updated_at: string;
}

export interface ShoppingItem {
    id: number;
    name: string;
    quantity: string | null;
    category: string;
    is_checked: boolean;
    shopping_list_id: number;
    added_by?: User;
    created_at: string;
}

export interface ShoppingList {
    id: number;
    name: string;
    is_shared: boolean;
    family_id: number;
    items?: ResourceCollection<ShoppingItem>;
    items_count?: number;
    creator?: User;
    created_at: string;
    updated_at: string;
}

export interface RecipeIngredient {
    id: number;
    name: string;
    quantity: string | null;
    unit: string | null;
    sort_order: number;
}

export interface Recipe {
    id: number;
    title: string;
    description: string | null;
    category: string | null;
    servings: number | null;
    prep_time_minutes: number | null;
    cook_time_minutes: number | null;
    total_time_minutes: number;
    instructions: string;
    photo_path: string | null;
    rating: number | null;
    is_favorite: boolean;
    family_id: number;
    ingredients?: RecipeIngredient[];
    creator?: User;
    created_at: string;
    updated_at: string;
}

export type BreadcrumbItemType = BreadcrumbItem;

export interface DashboardWidget {
    id: number;
    type: string;
    position: number;
    settings: Record<string, string | number | boolean | null>;
}

export interface DashboardWidgetType {
    value: string;
    label: string;
}

export interface DashboardShoppingListData {
    id: number;
    name: string;
    items: Pick<ShoppingItem, 'id' | 'name' | 'quantity' | 'category' | 'is_checked'>[];
}

export interface WeatherCondition {
    temp: number;
    feels_like: number;
    description: string;
    icon: string;
    humidity: number;
    wind_speed: number;
}

export interface ForecastDay {
    date: string;
    temp_min: number;
    temp_max: number;
    description: string;
    icon: string;
}

export interface WeatherData {
    location: string;
    current: WeatherCondition;
    forecast: ForecastDay[];
}

export interface MemberSummary {
    user: User;
    totalItems: number;
    completedItems: number;
    completionPct: number;
}

export interface FamilyScheduleColumn extends MemberSummary {
    colorIndex: number;
    events: CalendarEvent[];
    allDayEvents: CalendarEvent[];
    todos: Todo[];
    chores: Chore[];
}

/** A single shift item returned from the schedule upload parse endpoint. */
export interface ParsedShift {
    title: string;
    start_at: string;
    end_at: string | null;
    is_all_day: boolean;
}

/** A roster item that includes a client-side unique key for list rendering. */
export interface RosterItem extends ParsedShift {
    _key: string;
}
