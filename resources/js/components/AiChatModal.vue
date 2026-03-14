<script setup lang="ts">
import { chat } from '@/actions/App/Http/Controllers/AiController';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Bot, Send, Sparkles, User } from 'lucide-vue-next';
import { nextTick, ref } from 'vue';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

const isOpen = ref(false);
const messages = ref<Message[]>([]);
const input = ref('');
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const suggestions = [
    'What todos are pending?',
    'Add milk to shopping list',
    'Create a todo: Book dentist appointment',
    'Schedule a family dinner on Saturday at 6pm',
    'Add weekly vacuuming as a chore',
];

function open() {
    isOpen.value = true;
}

function close() {
    isOpen.value = false;
}

defineExpose({ open, close });

async function scrollToBottom() {
    await nextTick();
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
}

async function sendMessage(text?: string) {
    const message = text ?? input.value.trim();
    if (!message || isLoading.value) {
        return;
    }

    input.value = '';
    isLoading.value = true;

    const history = messages.value.map(({ role, content }) => ({ role, content }));
    messages.value.push({ role: 'user', content: message });

    const assistantMessage: Message = { role: 'assistant', content: '', isStreaming: true };
    messages.value.push(assistantMessage);
    await scrollToBottom();

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
            assistantMessage.content = 'Something went wrong. Please try again.';
            assistantMessage.isStreaming = false;
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
                        assistantMessage.content += parsed.text;
                        await scrollToBottom();
                    }
                } catch {
                    // non-JSON chunk — skip
                }
            }
        }
    } catch {
        assistantMessage.content = 'Something went wrong. Please try again.';
    } finally {
        assistantMessage.isStreaming = false;
        isLoading.value = false;
        await scrollToBottom();
    }
}

function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogContent class="flex h-[80vh] max-h-[700px] flex-col gap-0 p-0 sm:max-w-2xl">
            <DialogHeader class="flex-row items-center justify-between border-b px-4 py-3">
                <div class="flex items-center gap-2">
                    <div class="flex size-8 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles class="size-4 text-primary" />
                    </div>
                    <DialogTitle class="text-base font-semibold">Family Assistant</DialogTitle>
                </div>
            </DialogHeader>

            <!-- Messages -->
            <div ref="messagesContainer" class="flex-1 space-y-4 overflow-y-auto p-4">
                <!-- Empty state -->
                <div v-if="messages.length === 0" class="flex h-full flex-col items-center justify-center gap-6 text-center">
                    <div class="flex size-14 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles class="size-7 text-primary" />
                    </div>
                    <div>
                        <h2 class="text-lg font-semibold">How can I help?</h2>
                        <p class="mt-1 text-sm text-muted-foreground">
                            Ask me to create todos, schedule events, add chores, or manage your shopping list.
                        </p>
                    </div>
                    <div class="flex flex-wrap justify-center gap-2">
                        <button
                            v-for="suggestion in suggestions"
                            :key="suggestion"
                            class="rounded-full border px-3 py-1.5 text-sm transition hover:bg-accent hover:text-accent-foreground"
                            @click="sendMessage(suggestion)"
                        >
                            {{ suggestion }}
                        </button>
                    </div>
                </div>

                <!-- Message list -->
                <template v-else>
                    <div v-for="(msg, i) in messages" :key="i" class="flex gap-3" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                        <!-- Assistant icon -->
                        <div v-if="msg.role === 'assistant'" class="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Bot class="size-3.5 text-primary" />
                        </div>

                        <!-- Bubble -->
                        <div
                            class="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm"
                            :class="msg.role === 'user' ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-muted'"
                        >
                            <span v-if="msg.isStreaming && !msg.content" class="flex items-center gap-1 text-muted-foreground">
                                <span class="animate-bounce">●</span>
                                <span class="animate-bounce delay-100">●</span>
                                <span class="animate-bounce delay-200">●</span>
                            </span>
                            <span v-else class="whitespace-pre-wrap">{{ msg.content }}</span>
                        </div>

                        <!-- User icon -->
                        <div v-if="msg.role === 'user'" class="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                            <User class="size-3.5" />
                        </div>
                    </div>
                </template>
            </div>

            <!-- Input -->
            <div class="border-t p-3">
                <div class="flex items-end gap-2">
                    <Input
                        v-model="input"
                        placeholder="Ask me anything about your family's tasks…"
                        class="flex-1"
                        :disabled="isLoading"
                        @keydown="handleKeydown"
                    />
                    <Button size="icon" :disabled="isLoading || !input.trim()" @click="sendMessage()">
                        <Send class="size-4" />
                    </Button>
                </div>
                <p class="mt-1.5 text-center text-xs text-muted-foreground">AI can make mistakes. Verify important information.</p>
            </div>
        </DialogContent>
    </Dialog>
</template>
