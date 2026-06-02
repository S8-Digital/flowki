import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppearance, updateTheme } from '@/hooks/useAppearance';
import { getInitials } from '@/hooks/useInitials';
import { useIsMobile } from '@/hooks/useIsMobile';

// ---------------------------------------------------------------------------
// useInitials / getInitials
// ---------------------------------------------------------------------------

describe('getInitials', () => {
    it('returns empty string for no argument', () => {
        expect(getInitials()).toBe('');
        expect(getInitials('')).toBe('');
    });

    it('returns the first letter uppercased for a single-word name', () => {
        expect(getInitials('alice')).toBe('A');
        expect(getInitials('BOB')).toBe('B');
    });

    it('returns first + last initial for two-word names', () => {
        expect(getInitials('Alice Smith')).toBe('AS');
        expect(getInitials('john doe')).toBe('JD');
    });

    it('uses first and last word for names with more than two parts', () => {
        expect(getInitials('Alice Bob Charlie')).toBe('AC');
    });

    it('handles leading/trailing whitespace', () => {
        expect(getInitials('  Alice Smith  ')).toBe('AS');
    });
});

// ---------------------------------------------------------------------------
// useIsMobile
// ---------------------------------------------------------------------------

describe('useIsMobile', () => {
    const listeners: Map<string, () => void> = new Map();

    beforeEach(() => {
        listeners.clear();
        Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true, writable: true });
        Object.defineProperty(window, 'matchMedia', {
            value: vi.fn().mockImplementation(
                (query: string) =>
                    ({
                        matches: false,
                        media: query,
                        onchange: null,
                        addEventListener: (_: string, handler: () => void) => {
                            listeners.set(query, handler);
                        },
                        removeEventListener: vi.fn(),
                        dispatchEvent: vi.fn(),
                    }) as unknown as MediaQueryList,
            ),
            configurable: true,
            writable: true,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('returns false when window width is >= 768px', () => {
        Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
    });

    it('returns true when window width is < 768px', () => {
        Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);
    });

    it('updates when the media query change event fires', () => {
        Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true, writable: true });
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);

        act(() => {
            Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true });
            const listener = listeners.values().next().value;
            listener?.();
        });

        expect(result.current).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// useAppearance / updateTheme
// ---------------------------------------------------------------------------

describe('updateTheme', () => {
    beforeEach(() => {
        document.documentElement.classList.remove('dark');
        Object.defineProperty(window, 'matchMedia', {
            value: vi.fn().mockReturnValue({
                matches: false,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            }),
            configurable: true,
        });
    });

    it('adds "dark" class for dark appearance', () => {
        updateTheme('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes "dark" class for light appearance', () => {
        document.documentElement.classList.add('dark');
        updateTheme('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('uses system preference for system appearance (light system)', () => {
        Object.defineProperty(window, 'matchMedia', {
            value: vi.fn().mockReturnValue({ matches: false }),
            configurable: true,
        });
        updateTheme('system');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('uses system preference for system appearance (dark system)', () => {
        Object.defineProperty(window, 'matchMedia', {
            value: vi.fn().mockReturnValue({ matches: true }),
            configurable: true,
        });
        updateTheme('system');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
});

describe('useAppearance', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('dark');
        Object.defineProperty(window, 'matchMedia', {
            value: vi.fn().mockReturnValue({
                matches: false,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            }),
            configurable: true,
        });
    });

    it('defaults to "system" when no stored appearance', () => {
        const { result } = renderHook(() => useAppearance());
        expect(result.current.appearance).toBe('system');
    });

    it('reads stored appearance from localStorage', () => {
        localStorage.setItem('appearance', 'dark');
        const { result } = renderHook(() => useAppearance());
        // After mount, the effect sets the stored value
        expect(result.current.appearance).toBe('dark');
    });

    it('updates appearance and persists to localStorage', () => {
        const { result } = renderHook(() => useAppearance());
        act(() => {
            result.current.updateAppearance('dark');
        });
        expect(result.current.appearance).toBe('dark');
        expect(localStorage.getItem('appearance')).toBe('dark');
    });

    it('sets cookie with correct appearance value when updating appearance', () => {
        // Track the cookie string that was set
        let lastCookieSet = '';
        const originalDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
        Object.defineProperty(document, 'cookie', {
            get: originalDescriptor?.get,
            set: (value: string) => {
                lastCookieSet = value;

                if (originalDescriptor?.set) {
                    originalDescriptor.set.call(document, value);
                }
            },
            configurable: true,
        });

        const { result } = renderHook(() => useAppearance());
        act(() => {
            result.current.updateAppearance('dark');
        });

        expect(lastCookieSet).toContain('appearance=dark');
        expect(lastCookieSet).toContain('path=/');

        // Restore original cookie descriptor
        if (originalDescriptor) {
            Object.defineProperty(document, 'cookie', originalDescriptor);
        }
    });

    it('applies the theme when updating appearance to dark', () => {
        const { result } = renderHook(() => useAppearance());
        act(() => {
            result.current.updateAppearance('dark');
        });
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes dark class when switching to light', () => {
        document.documentElement.classList.add('dark');
        const { result } = renderHook(() => useAppearance());
        act(() => {
            result.current.updateAppearance('light');
        });
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
});
