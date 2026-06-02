import { Head } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Bot, Send, Sparkles, Trash2, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { chat } from '@/actions/App/Http/Controllers/AiController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/AppLayout';
import { getXsrfToken } from '@/lib/csrf';
import type { BreadcrumbItem } from '@/types';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

const HISTORY_KEY = 'assistant_history';
const breadcrumbs: BreadcrumbItem[] = [{ title: 'AI Assistant', href: '/assistant' }];

const suggestions = [
    'What todos are pending?',
    'Add milk to shopping list',
    'Create a todo: Book dentist appointment',
    'Schedule a family dinner on Saturday at 6pm',
    'Add weekly vacuuming as a chore',
    'Import a recipe for spaghetti bolognese',
    "What's on the shopping list?",
    "List this week's chores",
];

function loadHistory(): Message[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const raw = localStorage.getItem(HISTORY_KEY);

        if (raw) {
            return JSON.parse(raw) as Message[];
        }
    } catch {
        /* ignore */
    }

    return [];
}

function saveHistory(messages: Message[]): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const persisted = messages.map(({ role, content }) => ({ role, content }));
        localStorage.setItem(HISTORY_KEY, JSON.stringify(persisted));
    } catch {
        /* ignore */
    }
}

export default function AssistantIndex() {
    const [messages, setMessages] = useState<Message[]>(() => loadHistory());
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    // Tracks the index of the message bubble currently receiving streaming content.
    const currentBubbleIdxRef = useRef<number>(-1);

    useEffect(() => {
        if (!isLoading) {
            saveHistory(messages);
        }
    }, [messages, isLoading]);

    function scrollToBottom() {
        setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
        }, 0);
    }

    function clearConversation() {
        setMessages([]);

        if (typeof window !== 'undefined') {
            localStorage.removeItem(HISTORY_KEY);
        }
    }

    async function sendMessage(text?: string) {
        const message = text ?? input.trim();

        if (!message || isLoading) {
            return;
        }

        setInput('');
        setIsLoading(true);

        const history = messages.map(({ role, content }) => ({ role, content }));
        const userMessages: Message[] = [...messages, { role: 'user', content: message }];
        setMessages(userMessages);

        const assistantIdx = userMessages.length;
        currentBubbleIdxRef.current = assistantIdx;
        setMessages((prev) => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
        scrollToBottom();

        try {
            const response = await fetch(chat().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getXsrfToken(),
                    Accept: 'text/event-stream',
                },
                body: JSON.stringify({ message, history }),
            });

            if (!response.ok || !response.body) {
                setMessages((prev) =>
                    prev.map((m, i) => (i === currentBubbleIdxRef.current ? { ...m, content: 'Something went wrong.', isStreaming: false } : m)),
                );

                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) {
                        continue;
                    }

                    const data = line.slice(6).trim();

                    if (data === '[DONE]') {
                        break;
                    }

                    try {
                        const parsed = JSON.parse(data);

                        if (parsed.type === 'text_delta' && parsed.delta) {
                            const idx = currentBubbleIdxRef.current;
                            setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, content: m.content + parsed.delta } : m)));
                            scrollToBottom();
                        } else if (parsed.type === 'tool_call') {
                            setMessages((prev) => {
                                const idx = currentBubbleIdxRef.current;
                                const current = prev[idx];

                                if (current?.content && !current.content.startsWith('⏳')) {
                                    // Finalise the current bubble and open a fresh one for the next AI turn.
                                    const newIdx = prev.length;
                                    currentBubbleIdxRef.current = newIdx;

                                    return [
                                        ...prev.map((m, i) => (i === idx ? { ...m, isStreaming: false } : m)),
                                        { role: 'assistant' as const, content: '', isStreaming: true },
                                    ];
                                }

                                if (!current?.content) {
                                    // Empty bubble — show which tool is running.
                                    return prev.map((m, i) => (i === idx ? { ...m, content: `⏳ ${parsed.tool_name ?? 'tool'}…` } : m));
                                }

                                return prev;
                            });
                            scrollToBottom();
                        } else if (parsed.type === 'tool_result') {
                            setMessages((prev) => {
                                const idx = currentBubbleIdxRef.current;
                                const current = prev[idx];

                                if (current?.content?.startsWith('⏳')) {
                                    return prev.map((m, i) => (i === idx ? { ...m, content: '' } : m));
                                }

                                return prev;
                            });
                        }
                    } catch {
                        /* non-JSON */
                    }
                }
            }
        } catch {
            setMessages((prev) =>
                prev.map((m, i) => (i === currentBubbleIdxRef.current ? { ...m, content: 'Something went wrong.', isStreaming: false } : m)),
            );
        } finally {
            // Finalise every bubble that is still in streaming state.
            setMessages((prev) => prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)));
            setIsLoading(false);
            scrollToBottom();
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    return (
        <>
            <Head title="AI Assistant" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Box sx={{ display: 'flex', height: 'calc(100vh - 10rem)', flexDirection: 'column' }}>
                    <Box ref={containerRef} sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', p: 2 }}>
                        {messages.length === 0 ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    height: '100%',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 3,
                                    textAlign: 'center',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        width: 64,
                                        height: 64,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        bgcolor: 'primary.light',
                                    }}
                                >
                                    <Sparkles className="size-8 text-primary" />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Family Assistant
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                                        Ask me to create todos, schedule events, manage chores, import recipes, or manage your shopping list.
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                                    {suggestions.map((s) => (
                                        <Box
                                            key={s}
                                            component="button"
                                            onClick={() => sendMessage(s)}
                                            sx={{
                                                borderRadius: '50px',
                                                border: 1,
                                                borderColor: 'divider',
                                                px: 1.5,
                                                py: 0.75,
                                                fontSize: '0.875rem',
                                                cursor: 'pointer',
                                                bgcolor: 'background.default',
                                                '&:hover': { bgcolor: 'action.hover' },
                                                transition: 'background-color 0.2s',
                                            }}
                                        >
                                            {s}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        ) : (
                            messages.map((msg, i) => (
                                <Box key={i} sx={{ display: 'flex', gap: 1.5, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                    {msg.role === 'assistant' && (
                                        <Box
                                            sx={{
                                                mt: 0.5,
                                                display: 'flex',
                                                width: 32,
                                                height: 32,
                                                flexShrink: 0,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '50%',
                                                bgcolor: 'primary.light',
                                            }}
                                        >
                                            <Bot className="size-4 text-primary" />
                                        </Box>
                                    )}
                                    <Box
                                        sx={{
                                            maxWidth: '80%',
                                            borderRadius: 3,
                                            ...(msg.role === 'user'
                                                ? { borderBottomRightRadius: 4, bgcolor: 'primary.main', color: 'primary.contrastText' }
                                                : { borderBottomLeftRadius: 4, bgcolor: 'action.hover' }),
                                            px: 2,
                                            py: 1.25,
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        {msg.isStreaming && !msg.content ? (
                                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                <span className="animate-bounce">●</span>
                                                <span className="animate-bounce [animation-delay:100ms]">●</span>
                                                <span className="animate-bounce [animation-delay:200ms]">●</span>
                                            </Box>
                                        ) : (
                                            <Box component="span" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {msg.content}
                                                {msg.isStreaming && (
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 0.25,
                                                            ml: 0.5,
                                                            verticalAlign: 'middle',
                                                            color: 'text.secondary',
                                                        }}
                                                    >
                                                        <Box component="span" className="animate-bounce" sx={{ fontSize: '0.5em' }}>
                                                            ●
                                                        </Box>
                                                        <Box
                                                            component="span"
                                                            className="animate-bounce [animation-delay:100ms]"
                                                            sx={{ fontSize: '0.5em' }}
                                                        >
                                                            ●
                                                        </Box>
                                                        <Box
                                                            component="span"
                                                            className="animate-bounce [animation-delay:200ms]"
                                                            sx={{ fontSize: '0.5em' }}
                                                        >
                                                            ●
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                    {msg.role === 'user' && (
                                        <Box
                                            sx={{
                                                mt: 0.5,
                                                display: 'flex',
                                                width: 32,
                                                height: 32,
                                                flexShrink: 0,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '50%',
                                                bgcolor: 'secondary.main',
                                            }}
                                        >
                                            <User className="size-4" />
                                        </Box>
                                    )}
                                </Box>
                            ))
                        )}
                    </Box>
                    <Box sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything about your family's tasks…"
                                className="flex-1"
                                disabled={isLoading}
                                onKeyDown={handleKeyDown}
                            />
                            <Button size="icon" disabled={isLoading || !input.trim()} onClick={() => sendMessage()}>
                                <Send className="size-4" />
                            </Button>
                            {messages.length > 0 && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    disabled={isLoading}
                                    onClick={clearConversation}
                                    title="Clear conversation"
                                    aria-label="Clear conversation"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            )}
                        </Box>
                        <Typography variant="caption" sx={{ mt: 0.75, textAlign: 'center', color: 'text.secondary', display: 'block' }}>
                            AI can make mistakes. Verify important information.
                        </Typography>
                    </Box>
                </Box>
            </AppLayout>
        </>
    );
}
