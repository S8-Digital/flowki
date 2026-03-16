import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    connectedProviders: string[];
    hasPasswordSet: boolean;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon;
    isActive?: boolean;
}

export type AppPageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
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
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Family {
    id: number;
    name: string;
    invite_code: string;
    members?: User[];
    created_at: string;
}

export interface Todo {
    id: number;
    title: string;
    description: string | null;
    category: string;
    priority: string;
    status: string;
    due_date: string | null; // datetime-local format: Y-m-d\TH:i
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
    family_id: number;
    assignees?: User[];
    creator?: User;
    created_at: string;
    updated_at: string;
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
    items?: ShoppingItem[];
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

export interface PaginatedResource<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export type BreadcrumbItemType = BreadcrumbItem;
