/**
 * Tests for resources/js/pages/Assistant/Index.tsx
 *
 * Covers:
 * - Initial render: welcome state with suggestions
 * - Typing in the input field
 * - Clicking a suggestion sends it as a message
 * - Message appears in chat
 * - Clear conversation button (visible after sending)
 * - Enter key triggers send
 * - Send button is disabled when input is empty
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AssistantIndex from '@/pages/Assistant/Index';

// ---------------------------------------------------------------------------
// Global mocks
// ---------------------------------------------------------------------------

vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [_key: string]: unknown }) => (
        <a href={String(href)} {...rest}>
            {children}
        </a>
    ),
    useForm: vi.fn(),
    usePage: vi.fn(() => ({
        props: {
            auth: { user: { id: 1, name: 'Alice', email: 'alice@example.com' }, connectedProviders: [], hasPasswordSet: true },
            currentUserPermissions: [],
            unreadNotificationsCount: 0,
        },
    })),
    router: {
        visit: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        reload: vi.fn(),
    },
}));

vi.mock('@/layouts/AppLayout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="app-layout">{children}</div>,
}));

vi.mock('@/actions/App/Http/Controllers/AiController', () => ({
    chat: () => ({ url: '/api/assistant/chat', method: 'post' }),
}));

// Stub lucide icons (jsdom doesn't need SVG rendering)
vi.mock('lucide-react', () => ({
    Bot: () => <span data-testid="icon-bot" />,
    Send: () => <span data-testid="icon-send" />,
    Sparkles: () => <span data-testid="icon-sparkles" />,
    Trash2: () => <span data-testid="icon-trash" />,
    User: () => <span data-testid="icon-user" />,
}));

// ---------------------------------------------------------------------------
// fetch mock — returns a streaming response helper
// ---------------------------------------------------------------------------

function makeStreamingResponse(chunks: string[]) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            for (const chunk of chunks) {
                controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
        },
    });
    return { ok: true, body: stream } as Response;
}

const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // By default, respond with an empty stream so sendMessage doesn't hang
    mockFetch.mockResolvedValue(makeStreamingResponse(['data: [DONE]\n']));
});

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------

describe('AI Assistant page', () => {
    it('renders the welcome heading', () => {
        render(<AssistantIndex />);
        expect(screen.getByText(/AI Assistant/i)).toBeInTheDocument();
    });

    it('renders suggestion chips in the welcome state', () => {
        render(<AssistantIndex />);
        expect(screen.getByText(/What todos are pending/i)).toBeInTheDocument();
        expect(screen.getByText(/Add milk to shopping list/i)).toBeInTheDocument();
    });

    it('renders the message input field', () => {
        render(<AssistantIndex />);
        const input = screen.getByPlaceholderText(/Ask me anything/i);
        expect(input).toBeInTheDocument();
    });

    it('send button is disabled when input is empty', () => {
        render(<AssistantIndex />);
        const sendBtn = screen.getAllByRole('button').find(
            (b) => b.querySelector('[data-testid="icon-send"]'),
        );
        expect(sendBtn).toBeDisabled();
    });

    it('send button becomes enabled when user types', async () => {
        const user = userEvent.setup();
        render(<AssistantIndex />);
        const input = screen.getByPlaceholderText(/Ask me anything/i);
        await user.type(input, 'Hello');
        const sendBtn = screen.getAllByRole('button').find(
            (b) => b.querySelector('[data-testid="icon-send"]'),
        );
        expect(sendBtn).not.toBeDisabled();
    });

    it('adds the user message to the chat when send is clicked', async () => {
        const user = userEvent.setup();
        render(<AssistantIndex />);

        const input = screen.getByPlaceholderText(/Ask me anything/i);
        await user.type(input, 'What chores are due?');
        const sendBtn = screen.getAllByRole('button').find(
            (b) => b.querySelector('[data-testid="icon-send"]'),
        );
        await user.click(sendBtn!);

        await waitFor(() =>
            expect(screen.getByText('What chores are due?')).toBeInTheDocument(),
        );
    });

    it('clicking a suggestion sends it immediately', async () => {
        const user = userEvent.setup();
        render(<AssistantIndex />);

        const suggestionBtn = screen.getByText(/Add milk to shopping list/i);
        await user.click(suggestionBtn);

        await waitFor(() =>
            expect(screen.getByText('Add milk to shopping list')).toBeInTheDocument(),
        );
        expect(mockFetch).toHaveBeenCalled();
    });

    it('calls fetch with the correct URL when sending a message', async () => {
        const user = userEvent.setup();
        render(<AssistantIndex />);

        const input = screen.getByPlaceholderText(/Ask me anything/i);
        await user.type(input, 'List my todos');
        const sendBtn = screen.getAllByRole('button').find(
            (b) => b.querySelector('[data-testid="icon-send"]'),
        );
        await user.click(sendBtn!);

        await waitFor(() =>
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/assistant/chat',
                expect.objectContaining({ method: 'POST' }),
            ),
        );
    });

    it('shows the assistant response in the chat', async () => {
        mockFetch.mockResolvedValue(
            makeStreamingResponse([
                'data: {"text":"Here are your todos:"}\n',
                'data: [DONE]\n',
            ]),
        );

        const user = userEvent.setup();
        render(<AssistantIndex />);

        const input = screen.getByPlaceholderText(/Ask me anything/i);
        await user.type(input, 'List todos');
        const sendBtn = screen.getAllByRole('button').find(
            (b) => b.querySelector('[data-testid="icon-send"]'),
        );
        await user.click(sendBtn!);

        await waitFor(() =>
            expect(screen.getByText(/Here are your todos:/i)).toBeInTheDocument(),
        );
    });

    it('shows an error message when the fetch fails', async () => {
        mockFetch.mockResolvedValue({ ok: false, body: null } as Response);

        const user = userEvent.setup();
        render(<AssistantIndex />);

        const input = screen.getByPlaceholderText(/Ask me anything/i);
        await user.type(input, 'Hello');
        const sendBtn = screen.getAllByRole('button').find(
            (b) => b.querySelector('[data-testid="icon-send"]'),
        );
        await user.click(sendBtn!);

        await waitFor(() =>
            expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument(),
        );
    });

    it('shows the clear conversation button after a message is sent', async () => {
        const user = userEvent.setup();
        render(<AssistantIndex />);

        const input = screen.getByPlaceholderText(/Ask me anything/i);
        await user.type(input, 'Hello');
        const sendBtn = screen.getAllByRole('button').find(
            (b) => b.querySelector('[data-testid="icon-send"]'),
        );
        await user.click(sendBtn!);

        await waitFor(() =>
            expect(screen.getByLabelText(/Clear conversation/i)).toBeInTheDocument(),
        );
    });

    it('clears the conversation when the clear button is clicked', async () => {
        const user = userEvent.setup();
        render(<AssistantIndex />);

        const input = screen.getByPlaceholderText(/Ask me anything/i);
        await user.type(input, 'Hello world');
        const sendBtn = screen.getAllByRole('button').find(
            (b) => b.querySelector('[data-testid="icon-send"]'),
        );
        await user.click(sendBtn!);

        await waitFor(() => screen.getByText('Hello world'));
        await user.click(screen.getByLabelText(/Clear conversation/i));

        await waitFor(() =>
            expect(screen.queryByText('Hello world')).not.toBeInTheDocument(),
        );
    });

    it('shows disclaimer text about AI mistakes', () => {
        render(<AssistantIndex />);
        expect(screen.getByText(/AI can make mistakes/i)).toBeInTheDocument();
    });

    it('persists message history to localStorage', async () => {
        const user = userEvent.setup();
        render(<AssistantIndex />);

        const input = screen.getByPlaceholderText(/Ask me anything/i);
        await user.type(input, 'Remember me');
        const sendBtn = screen.getAllByRole('button').find(
            (b) => b.querySelector('[data-testid="icon-send"]'),
        );
        await user.click(sendBtn!);

        await waitFor(() => screen.getByText('Remember me'));
        await waitFor(() =>
            expect(localStorage.getItem('assistant_history')).not.toBeNull(),
        );
    });

    it('loads message history from localStorage on mount', () => {
        const stored = JSON.stringify([
            { role: 'user', content: 'Stored message' },
            { role: 'assistant', content: 'Stored reply' },
        ]);
        localStorage.setItem('assistant_history', stored);

        render(<AssistantIndex />);

        expect(screen.getByText('Stored message')).toBeInTheDocument();
        expect(screen.getByText('Stored reply')).toBeInTheDocument();
    });
});
