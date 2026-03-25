import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import type { RouteDefinition } from '@/wayfinder';
import type {
    CalendarEvent as BaseCalendarEvent,
    Chore as BaseChore,
    Family as BaseFamily,
    ShoppingItem as BaseShoppingItem,
    ShoppingList as BaseShoppingList,
    Todo as BaseTodo,
    User as BaseUser,
    WeatherCurrent,
    WeatherData,
    WeatherDay,
} from '@flowki/shared';

export type { WeatherCurrent, WeatherData, WeatherDay };

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

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
    vapidKey: string;
    recaptchaSiteKey: string | null;
}

export type AppPageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    currentUserPermissions: string[];
    unreadNotificationsCount: number;
    firebaseConfig: FirebaseConfig;
};

/** Web-extended User — adds Inertia/Eloquent relation fields on top of the shared base. */
export interface User extends BaseUser {
    family?: Family | null;
    is_pending?: boolean;
    is_child?: boolean;
    email_verified_at: string | null;
}

/** Web-extended Family — adds member_order used by the web dashboard. */
export interface Family extends BaseFamily {
    members?: User[];
    member_order?: number[];
}

export interface Permission {
    name: string;
    granted: boolean;
}

export interface PermissionGroup {
    group: string;
    permissions: Permission[];
}

/** Web-extended Todo — adds reminder_lead_time and nested relation objects. */
export interface Todo extends BaseTodo {
    reminder_lead_time: number;
    assignee?: User;
    creator?: User;
}

/** Web-extended Chore — adds reminder_lead_time and nested relation objects. */
export interface Chore extends BaseChore {
    reminder_lead_time: number;
    assignees?: User[];
    creator?: User;
}

export interface AppNotification {
    id: string;
    type: string;
    data: Record<string, unknown>;
    read_at: string | null;
    created_at: string;
}

/** Web-extended CalendarEvent — adds recurrence, reminder_at and nested attendees. */
export interface CalendarEvent extends BaseCalendarEvent {
    recurrence?: string | null;
    reminder_at?: string | null;
    attendees?: User[];
    creator?: User;
}

/** Web-extended ShoppingItem — adds_by as a full User object. */
export interface ShoppingItem extends BaseShoppingItem {
    added_by_user?: User;
}

/** Web-extended ShoppingList — adds is_shared, items_count, and creator. */
export interface ShoppingList extends BaseShoppingList {
    is_shared: boolean;
    items?: ResourceCollection<ShoppingItem>;
    items_count?: number;
    creator?: User;
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
