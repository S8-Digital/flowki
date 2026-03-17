/**
 * Shared Inertia mock helpers used across test files.
 */
import { vi } from 'vitest';

export const mockRouter = {
    visit: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    reload: vi.fn(),
};

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
        setError: vi.fn(),
        transform: vi.fn(),
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

export const defaultPageProps = {
    props: {
        auth: {
            user: {
                id: 1,
                name: 'Alice Smith',
                email: 'alice@example.com',
                family_id: 1,
                profile_color: null,
                email_verified_at: '2024-01-01T00:00:00.000000Z',
                created_at: '2024-01-01T00:00:00.000000Z',
                updated_at: '2024-01-01T00:00:00.000000Z',
            },
            connectedProviders: [],
            hasPasswordSet: true,
        },
        name: 'Flowki',
        quote: { message: 'Test quote', author: 'Tester' },
        sidebarOpen: false,
        currentUserPermissions: ['manage-members', 'view-todos', 'create-todos', 'edit-todos', 'delete-todos'],
        unreadNotificationsCount: 0,
    },
};
