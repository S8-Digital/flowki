import { Head } from '@inertiajs/react';
import { Bot, Send, Sparkles, Trash2, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { chat } from '@/actions/App/Http/Controllers/AiController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/AppLayout';
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
        setMessages((prev) => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
        scrollToBottom();

        try {
            const response = await fetch(chat().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                    Accept: 'text/event-stream',
                },
                body: JSON.stringify({ message, history }),
            });

            if (!response.ok || !response.body) {
                setMessages((prev) => prev.map((m, i) => (i === assistantIdx ? { ...m, content: 'Something went wrong.', isStreaming: false } : m)));

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

                        if (parsed.text) {
                            setMessages((prev) => prev.map((m, i) => (i === assistantIdx ? { ...m, content: m.content + parsed.text } : m)));
                            scrollToBottom();
                        }
                    } catch {
                        /* non-JSON */
                    }
                }
            }
        } catch {
            setMessages((prev) => prev.map((m, i) => (i === assistantIdx ? { ...m, content: 'Something went wrong.', isStreaming: false } : m)));
        } finally {
            setMessages((prev) => prev.map((m, i) => (i === assistantIdx ? { ...m, isStreaming: false } : m)));
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
                <div className="flex h-[calc(100vh-10rem)] flex-col">
                    <div ref={containerRef} className="flex-1 space-y-4 overflow-y-auto p-4">
                        {messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                                    <Sparkles className="size-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">Family Assistant</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Ask me to create todos, schedule events, manage chores, import recipes, or manage your shopping list.
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {suggestions.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => sendMessage(s)}
                                            className="rounded-full border px-3 py-1.5 text-sm transition hover:bg-accent"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                            <Bot className="size-4 text-primary" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-muted'}`}
                                    >
                                        {msg.isStreaming && !msg.content ? (
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <span className="animate-bounce">●</span>
                                                <span className="animate-bounce [animation-delay:100ms]">●</span>
                                                <span className="animate-bounce [animation-delay:200ms]">●</span>
                                            </span>
                                        ) : (
                                            <span className="whitespace-pre-wrap">{msg.content}</span>
                                        )}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                                            <User className="size-4" />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="border-t p-4">
                        <div className="flex items-end gap-2">
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
                        </div>
                        <p className="mt-1.5 text-center text-xs text-muted-foreground">AI can make mistakes. Verify important information.</p>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
