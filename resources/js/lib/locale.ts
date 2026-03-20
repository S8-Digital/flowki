import 'dayjs/locale/ar';
import 'dayjs/locale/de';
import 'dayjs/locale/en-au';
import 'dayjs/locale/en-gb';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/hi';
import 'dayjs/locale/it';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/nl';
import 'dayjs/locale/pl';
import 'dayjs/locale/pt-br';
import 'dayjs/locale/pt';
import 'dayjs/locale/ru';
import 'dayjs/locale/sv';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';
import 'dayjs/locale/zh';

/**
 * All Day.js locales we support, in priority order.
 * Hyphenated regional variants must come before their base language
 * so that e.g. "en-AU" resolves to "en-au" rather than "en".
 */
const SUPPORTED_LOCALES = [
    'en-au',
    'en-gb',
    'zh-cn',
    'zh-tw',
    'pt-br',
    'en',
    'zh',
    'ja',
    'ko',
    'fr',
    'de',
    'es',
    'it',
    'pt',
    'ar',
    'hi',
    'ru',
    'nl',
    'sv',
    'pl',
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Resolves the best matching Day.js locale from the browser's language
 * preference list (`navigator.languages`), falling back to `"en"`.
 *
 * Strategy:
 *  1. Iterate the browser's priority-ordered language list.
 *  2. For each language, try an exact match first (e.g. "en-au").
 *  3. If no exact match, try matching on the base language (e.g. "en").
 *  4. Return the first match found, or "en" if nothing matches.
 */
export function resolveLocale(): SupportedLocale {
    const languages: readonly string[] =
        typeof navigator !== 'undefined' ? (navigator.languages?.length ? navigator.languages : [navigator.language]) : ['en'];

    for (const lang of languages) {
        const lower = lang.toLowerCase();

        // 1. Exact match (e.g. "en-au")
        const exact = SUPPORTED_LOCALES.find((l) => l === lower);

        if (exact) {
            return exact;
        }

        // 2. Base language match (e.g. "en-au" → "en")
        const base = lower.split('-')[0];
        const partial = SUPPORTED_LOCALES.find((l) => l === base);

        if (partial) {
            return partial;
        }
    }

    return 'en';
}

/**
 * Resolved once at module load time to avoid recalculating on every render.
 * Import this directly when you need a stable locale string.
 *
 * @example
 * import { locale } from '@/lib/resolve-locale';
 * <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
 */
export const locale: SupportedLocale = resolveLocale();
