/**
 * Shared Inertia mock helpers used across test files.
 */
import { vi } from 'vitest';

export function makeUseFormReturn(overrides: Record<string, unknown> = {}) {
    return {
        data: {},
        setData: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        get: vi.fn(),
        submit: vi.fn(),
        reset: vi.fn(),
        clearErrors: vi.fn(),
        resetAndClearErrors: vi.fn(),
        setError: vi.fn(),
        setDefaults: vi.fn(),
        transform: vi.fn(),
        cancel: vi.fn(),
        dontRemember: vi.fn(),
        withPrecognition: vi.fn(),
        processing: false,
        progress: null,
        errors: {},
        hasErrors: false,
        recentlySuccessful: false,
        isDirty: false,
        wasSuccessful: false,
        ...overrides,
    };
}
