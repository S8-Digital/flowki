import type { InertiaLinkProps } from '@inertiajs/react';
import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { User } from '@/types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function urlIsActive(urlToCheck: NonNullable<InertiaLinkProps['href']>, currentUrl: string) {
    return toUrl(urlToCheck) === currentUrl;
}

export function toUrl(href: NonNullable<InertiaLinkProps['href']>) {
    return typeof href === 'string' ? href : href?.url;
}

/**
 * Returns a validated 6-digit hex color for the given user's profile_color,
 * or null if the user has no valid color set.
 */
export function getProfileColor(user: Pick<User, 'profile_color'> | null | undefined): string | null {
    if (!user?.profile_color) {
        return null;
    }

    return /^#[0-9a-fA-F]{6}$/.test(user.profile_color) ? user.profile_color : null;
}
