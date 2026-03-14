<script setup lang="ts">
import { chat } from '@/actions/App/Http/Controllers/AiController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/vue3';
import { Bot, Send, Sparkles, User } from 'lucide-vue-next';
import { nextTick, ref } from 'vue';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'AI Assistant', href: '/assistant' }];

const page = usePage();
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

async function scrollToBottom() {
    await nextTick();
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
}

async function sendMessage(text?: string) {
    const message = text ?? input.value.trim();
    if (!message || isLoading.value) return;

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
    <Head title="AI Assistant" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-[calc(100vh-10rem)] flex-col">
            <!-- Messages -->
            <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">

                <!-- Empty state -->
                <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full gap-6 text-center">
                    <div class="flex size-16 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles class="size-8 text-primary" />
                    </div>
                    <div>
                        <h2 class="text-xl font-semibold">Family Assistant</h2>
                        <p class="mt-1 text-sm text-muted-foreground">
                            Ask me to create todos, schedule events, add chores, or manage your shopping list.
                        </p>
                    </div>
                    <div class="flex flex-wrap justify-center gap-2">
                        <button
                            v-for="suggestion in suggestions"
                            :key="suggestion"
                            @click="sendMessage(suggestion)"
                            class="rounded-full border px-3 py-1.5 text-sm transition hover:bg-accent"
                        >
                            {{ suggestion }}
                        </button>
                    </div>
                </div>

                <!-- Message list -->
                <template v-else>
                    <div
                        v-for="(msg, i) in messages"
                        :key="i"
                        class="flex gap-3"
                        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
                    >
                        <!-- Assistant icon -->
                        <div v-if="msg.role === 'assistant'" class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1">
                            <Bot class="size-4 text-primary" />
                        </div>

                        <!-- Bubble -->
                        <div
                            class="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm"
                            :class="msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-sm'
                                : 'bg-muted rounded-bl-sm'"
                        >
                            <span v-if="msg.isStreaming && !msg.content" class="flex items-center gap-1 text-muted-foreground">
                                <span class="animate-bounce">●</span>
                                <span class="animate-bounce delay-100">●</span>
                                <span class="animate-bounce delay-200">●</span>
                            </span>
                            <span v-else class="whitespace-pre-wrap">{{ msg.content }}</span>
                        </div>

                        <!-- User icon -->
                        <div v-if="msg.role === 'user'" class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary mt-1">
                            <User class="size-4" />
                        </div>
                    </div>
                </template>
            </div>

            <!-- Input -->
            <div class="border-t p-4">
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
                <p class="mt-1.5 text-xs text-muted-foreground text-center">
                    AI can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    </AppLayout>
</template>

