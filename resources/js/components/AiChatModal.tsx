import { chat } from '@/actions/App/Http/Controllers/AiController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

export interface AiChatModalHandle {
    open: () => void;
    close: () => void;
}

const suggestions = [
    'What todos are pending?',
    'Add milk to shopping list',
    'Create a todo: Book dentist appointment',
    'Schedule a family dinner on Saturday at 6pm',
    'Add weekly vacuuming as a chore',
];

const AiChatModal = forwardRef<AiChatModalHandle>((_, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
    }));

    function scrollToBottom() {
        requestAnimationFrame(() => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        });
    }

    async function sendMessage(text?: string) {
        const message = text ?? input.trim();
        if (!message || isLoading) return;

        setInput('');
        setIsLoading(true);

        const history = messages.map(({ role, content }) => ({ role, content }));

        setMessages((prev) => [...prev, { role: 'user', content: message }, { role: 'assistant', content: '', isStreaming: true }]);
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
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'assistant', content: 'Something went wrong. Please try again.', isStreaming: false };
                    return updated;
                });
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') break;

                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.text) {
                            setMessages((prev) => {
                                const updated = [...prev];
                                const last = updated[updated.length - 1];
                                updated[updated.length - 1] = { ...last, content: last.content + parsed.text };
                                return updated;
                            });
                            scrollToBottom();
                        }
                    } catch {
                        // non-JSON chunk — skip
                    }
                }
            }
        } catch {
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: 'Something went wrong. Please try again.', isStreaming: false };
                return updated;
            });
        } finally {
            setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = { ...last, isStreaming: false };
                return updated;
            });
            setIsLoading(false);
            scrollToBottom();
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="flex h-[80vh] max-h-[700px] flex-col gap-0 p-0 sm:max-w-2xl">
                <DialogHeader className="flex-row items-center justify-between border-b px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                            <Sparkles className="size-4 text-primary" />
                        </div>
                        <DialogTitle className="text-base font-semibold">Family Assistant</DialogTitle>
                    </div>
                </DialogHeader>

                {/* Messages */}
                <div ref={messagesContainerRef} className="flex-1 space-y-4 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                                <Sparkles className="size-7 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">How can I help?</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Ask me to create todos, schedule events, add chores, or manage your shopping list.
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        className="rounded-full border px-3 py-1.5 text-sm transition hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => sendMessage(suggestion)}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <Bot className="size-3.5 text-primary" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                                        msg.role === 'user' ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-muted'
                                    }`}
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
                                    <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                                        <User className="size-3.5" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Input */}
                <div className="border-t p-3">
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
                    </div>
                    <p className="mt-1.5 text-center text-xs text-muted-foreground">AI can make mistakes. Verify important information.</p>
                </div>
            </DialogContent>
        </Dialog>
    );
});

AiChatModal.displayName = 'AiChatModal';

export default AiChatModal;
