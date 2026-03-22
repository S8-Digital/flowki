import type { RemoteConfig } from 'firebase/remote-config';
import { fetchAndActivate, getBoolean, getRemoteConfig, getString, getValue } from 'firebase/remote-config';
import { getFirebaseApp } from './firebase';

/**
 * All Remote Config keys used in the application.
 * Values set here are the hardcoded defaults — they are used when:
 *  - Firebase Remote Config is unavailable (no internet / not configured)
 *  - The Remote Config has not overridden a given key
 *
 * Override any of these keys in the Firebase console to update content
 * without shipping a new build. A/B test any key via Firebase Experiments.
 */
export const REMOTE_CONFIG_DEFAULTS: Record<string, string | boolean | number> = {
    // ── Welcome page ──────────────────────────────────────────────────────────
    welcome_badge_text: '✨ Free for families · No credit card needed',
    welcome_hero_headline: 'Family life, organised.',
    welcome_hero_headline_highlight: 'organised.',
    welcome_hero_subheadline:
        'Shared todos, chores, calendars, shopping lists, and recipes — all in one place for the whole family.\nLess chaos. More together time.',
    welcome_hero_cta_primary: 'Start for free',
    welcome_hero_cta_secondary: 'Sign in',
    welcome_hero_social_proof: 'Join thousands of families already using Flowki · No credit card required',

    welcome_features_eyebrow: 'Everything your family needs',
    welcome_features_headline: 'One app. Zero juggling.',
    welcome_features_subheadline: 'Flowki brings the whole family together in a single, beautifully simple app.',

    welcome_steps_eyebrow: 'Get started in minutes',
    welcome_steps_headline: 'Up and running in 3 steps',

    welcome_benefits_eyebrow: 'Built for real families',
    welcome_benefits_headline: 'Why families love Flowki',

    welcome_cta_headline: 'Ready to bring your family together?',
    welcome_cta_subheadline: 'Set up Flowki for your family in under two minutes — completely free. No credit card, no commitment.',
    welcome_cta_button: "Create your family — it's free",
    welcome_cta_signin_link: 'Already have an account? Sign in →',

    // ── Features grid (stored as JSON strings) ────────────────────────────────
    welcome_features_json: JSON.stringify([
        {
            name: 'Shared Todos',
            icon: 'CheckSquare',
            description: 'Assign tasks to family members with due dates. Everyone stays accountable.',
        },
        {
            name: 'Chores Roster',
            icon: 'RotateCcw',
            description: 'Recurring chores with automatic rotation. No more arguments about whose turn it is.',
        },
        {
            name: 'Family Calendar',
            icon: 'CalendarDays',
            description: 'One shared calendar for everyone. Syncs with Google Calendar too.',
        },
        {
            name: 'Shopping Lists',
            icon: 'ShoppingCart',
            description: 'Real-time shared lists. Tick items off as you shop — everyone sees instantly.',
        },
        {
            name: 'Recipes',
            icon: 'ChefHat',
            description: 'Save family favourites and plan meals together. Ingredients go straight to shopping.',
        },
        {
            name: 'AI Assistant',
            icon: 'MessageSquare',
            description: "Ask your family assistant anything — schedules, reminders, or what's for dinner.",
        },
    ]),

    // ── How it works steps (stored as JSON string) ────────────────────────────
    welcome_steps_json: JSON.stringify([
        {
            step: '1',
            title: 'Create your family',
            body: 'Sign up in 30 seconds. Name your family group and set a colour scheme.',
        },
        {
            step: '2',
            title: 'Invite everyone',
            body: 'Send a magic-link invite. Family members join with one tap — no setup required.',
        },
        {
            step: '3',
            title: 'Organise together',
            body: 'Assign tasks, plan the week, shop smarter. Life gets calmer immediately.',
        },
    ]),

    // ── Benefits (stored as JSON string) ─────────────────────────────────────
    welcome_benefits_json: JSON.stringify([
        { icon: 'Zap', title: 'Instant sync', description: 'Changes appear for every family member in real time.' },
        {
            icon: 'Smartphone',
            title: 'Works everywhere',
            description: 'Install on your home screen. Works offline when signal drops.',
        },
        {
            icon: 'Bell',
            title: 'Smart notifications',
            description: 'Get reminded at the right time. No app required — push works on mobile browsers.',
        },
        {
            icon: 'Shield',
            title: 'Private & secure',
            description: 'Your family data is yours. No ads, no tracking, no selling your data.',
        },
    ]),

    // ── App-wide ─────────────────────────────────────────────────────────────
    app_name: 'Flowki',
    app_tagline: 'Organise your family, together.',

    // ── Feature flags ─────────────────────────────────────────────────────────
    feature_show_install_prompt: true,
    feature_show_offline_indicator: true,
};

// Minimum interval between Remote Config fetches (12 hours in ms)
const FETCH_INTERVAL_MS = 12 * 60 * 60 * 1000;

let remoteConfig: RemoteConfig | null = null;

/**
 * Returns the initialised RemoteConfig singleton.
 * Safe to call multiple times — only initialises once.
 * Returns null in SSR / non-browser environments.
 */
export function getRemoteConfigInstance(): RemoteConfig | null {
    if (typeof window === 'undefined') {
        return null;
    }

    if (!remoteConfig) {
        try {
            remoteConfig = getRemoteConfig(getFirebaseApp());
            remoteConfig.settings.minimumFetchIntervalMillis = FETCH_INTERVAL_MS;
            remoteConfig.defaultConfig = REMOTE_CONFIG_DEFAULTS;
        } catch {
            return null;
        }
    }

    return remoteConfig;
}

/**
 * Fetch and activate the latest Remote Config values.
 * Should be called once on app boot. Failures are silent — defaults are used.
 */
export async function initializeRemoteConfig(): Promise<void> {
    const rc = getRemoteConfigInstance();

    if (!rc) {
        return;
    }

    try {
        await fetchAndActivate(rc);
    } catch {
        // Network unavailable or Firebase not configured — defaults remain active
    }
}

/**
 * Returns the string value for a Remote Config key.
 * Falls back to the hardcoded default if the key isn't overridden.
 */
export function rcString(key: string): string {
    const rc = getRemoteConfigInstance();

    if (!rc) {
        const fallback = REMOTE_CONFIG_DEFAULTS[key];

        return typeof fallback === 'string' ? fallback : String(fallback ?? '');
    }

    return getString(rc, key);
}

/**
 * Returns the boolean value for a Remote Config key.
 */
export function rcBoolean(key: string): boolean {
    const rc = getRemoteConfigInstance();

    if (!rc) {
        return Boolean(REMOTE_CONFIG_DEFAULTS[key] ?? false);
    }

    return getBoolean(rc, key);
}

/**
 * Returns the parsed JSON value for a Remote Config key that stores a JSON string.
 * Falls back to the hardcoded default on parse failure.
 */
export function rcJson<T>(key: string, fallback: T): T {
    const raw = rcString(key);

    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

/**
 * Returns all current Remote Config values as a plain record.
 * Useful for debugging in the browser console.
 */
export function getAllRemoteConfigValues(): Record<string, string | boolean | number> {
    const rc = getRemoteConfigInstance();

    if (!rc) {
        return { ...REMOTE_CONFIG_DEFAULTS };
    }

    return Object.fromEntries(
        Object.keys(REMOTE_CONFIG_DEFAULTS).map((key) => {
            const val = getValue(rc, key);

            return [key, val.asString()];
        }),
    );
}
