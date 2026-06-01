import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { chat } from '@/actions/App/Http/Controllers/AiController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

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

const AiAvatar = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    flexShrink: 0,
}));

const UserAvatar = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: theme.palette.secondary.main,
    flexShrink: 0,
}));

const EmptyChatState = styled(Box)({
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
});

const ChatHeading = styled(Typography)({
    fontSize: '1.125rem',
    fontWeight: 600,
});

const ChatSubheading = styled(Typography)(({ theme }) => ({
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
}));

const SuggestionChip = styled('button')(({ theme }) => ({
    borderRadius: '9999px',
    border: `1px solid ${theme.palette.divider}`,
    fontSize: '0.875rem',
    cursor: 'pointer',
    background: 'none',
    transition: 'background-color 0.15s',
    '&:hover': { backgroundColor: theme.palette.action.hover },
}));

const UserBubble = styled(Box)(({ theme }) => ({
    maxWidth: '80%',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    fontSize: '0.875rem',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
}));

const AssistantBubble = styled(Box)(({ theme }) => ({
    maxWidth: '80%',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    fontSize: '0.875rem',
    backgroundColor: alpha(theme.palette.text.primary, 0.06),
}));

const MessageContent = styled('span')({
    whiteSpace: 'pre-wrap',
});

const ChatInputArea = styled(Box)(({ theme }) => ({
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const ChatDisclaimer = styled(Typography)(({ theme }) => ({
    textAlign: 'center',
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
}));

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

        if (!message || isLoading) {
            return;
        }

        setInput('');
        setIsLoading(true);

        const history = messages.map(({ role, content }) => ({ role, content }));

        setMessages((prev) => [...prev, { role: 'user', content: message }, { role: 'assistant', content: '', isStreaming: true }]);
        scrollToBottom();

        try {
            const xsrfToken = decodeURIComponent(document.cookie.match(/(?:^|;)\s*XSRF-TOKEN=([^;]+)/)?.[1] ?? '');
            const response = await fetch(chat().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': xsrfToken,
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
            <DialogContent sx={{ display: 'flex', height: '100vh', flexDirection: 'column', gap: 0, padding: 0 }}>
                <DialogHeader
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid var(--border)',
                        padding: '12px 16px',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AiAvatar sx={{ width: 32, height: 32 }}>
                            <Sparkles style={{ width: 16, height: 16, color: 'var(--primary)' }} />
                        </AiAvatar>
                        <DialogTitle style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Family Assistant</DialogTitle>
                    </Box>
                </DialogHeader>

                {/* Messages */}
                <Box ref={messagesContainerRef} sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {messages.length === 0 ? (
                        <EmptyChatState sx={{ gap: 3 }}>
                            <AiAvatar sx={{ width: 56, height: 56 }}>
                                <Sparkles style={{ width: 28, height: 28, color: 'var(--primary)' }} />
                            </AiAvatar>
                            <Box>
                                <ChatHeading>How can I help?</ChatHeading>
                                <ChatSubheading sx={{ mt: 0.5 }}>
                                    Ask me to create todos, schedule events, add chores, or manage your shopping list.
                                </ChatSubheading>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                                {suggestions.map((suggestion) => (
                                    <SuggestionChip key={suggestion} onClick={() => sendMessage(suggestion)} sx={{ px: 1.5, py: 0.75 }}>
                                        {suggestion}
                                    </SuggestionChip>
                                ))}
                            </Box>
                        </EmptyChatState>
                    ) : (
                        messages.map((msg, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 1.5, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                {msg.role === 'assistant' && (
                                    <AiAvatar sx={{ mt: 0.5, width: 28, height: 28 }}>
                                        <Bot style={{ width: 14, height: 14, color: 'var(--primary)' }} />
                                    </AiAvatar>
                                )}
                                {msg.role === 'user' ? (
                                    <UserBubble sx={{ px: 2, py: 1.25 }}>
                                        {msg.isStreaming && !msg.content ? (
                                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                <Box component="span" sx={{ animation: 'bounce 1s infinite' }}>
                                                    ●
                                                </Box>
                                                <Box component="span" sx={{ animation: 'bounce 1s infinite', animationDelay: '0.1s' }}>
                                                    ●
                                                </Box>
                                                <Box component="span" sx={{ animation: 'bounce 1s infinite', animationDelay: '0.2s' }}>
                                                    ●
                                                </Box>
                                            </Box>
                                        ) : (
                                            <MessageContent>{msg.content}</MessageContent>
                                        )}
                                    </UserBubble>
                                ) : (
                                    <AssistantBubble sx={{ px: 2, py: 1.25 }}>
                                        {msg.isStreaming && !msg.content ? (
                                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                <Box component="span" sx={{ animation: 'bounce 1s infinite' }}>
                                                    ●
                                                </Box>
                                                <Box component="span" sx={{ animation: 'bounce 1s infinite', animationDelay: '0.1s' }}>
                                                    ●
                                                </Box>
                                                <Box component="span" sx={{ animation: 'bounce 1s infinite', animationDelay: '0.2s' }}>
                                                    ●
                                                </Box>
                                            </Box>
                                        ) : (
                                            <MessageContent>{msg.content}</MessageContent>
                                        )}
                                    </AssistantBubble>
                                )}
                                {msg.role === 'user' && (
                                    <UserAvatar sx={{ mt: 0.5, width: 28, height: 28 }}>
                                        <User style={{ width: 14, height: 14 }} />
                                    </UserAvatar>
                                )}
                            </Box>
                        ))
                    )}
                </Box>

                <ChatInputArea sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything about your family's tasks…"
                                style={{ width: '100%' }}
                                disabled={isLoading}
                                onKeyDown={handleKeyDown}
                            />
                        </Box>
                        <Button size="icon" disabled={isLoading || !input.trim()} onClick={() => sendMessage()}>
                            <Send style={{ width: 16, height: 16 }} />
                        </Button>
                    </Box>
                    <ChatDisclaimer sx={{ mt: 0.75 }}>AI can make mistakes. Verify important information.</ChatDisclaimer>
                </ChatInputArea>
            </DialogContent>
        </Dialog>
    );
});

AiChatModal.displayName = 'AiChatModal';

export default AiChatModal;
