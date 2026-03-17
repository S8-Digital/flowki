import type { InertiaLinkProps } from '@inertiajs/react';
import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
 * Returns a user's profile_color if it is a valid 6-digit hex (e.g. #rrggbb),
 * otherwise returns null.
 */
export function getProfileColor(user: { profile_color?: string | null } | undefined): string | null {
    if (user?.profile_color && /^#[0-9a-fA-F]{6}$/.test(user.profile_color)) {
        return user.profile_color;
    }

    return null;
}
