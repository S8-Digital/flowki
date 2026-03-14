<script setup lang="ts">
interface TodoItem {
    id: number;
    title: string;
    status: string;
    priority: string;
    category: string;
    due_date: string | null;
}

defineProps<{
    todos: TodoItem[];
    categoryFilter?: string;
}>();

function priorityColor(priority: string) {
    return { low: 'bg-green-500', medium: 'bg-yellow-500', high: 'bg-red-500' }[priority] ?? 'bg-muted';
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <div v-if="todos.length === 0" class="py-8 text-center text-sm text-muted-foreground">
            No todos due today.
        </div>
        <ul v-else class="space-y-2">
            <li
                v-for="todo in todos"
                :key="todo.id"
                class="flex items-center gap-3 rounded-lg border p-3"
            >
                <div :class="['size-2 shrink-0 rounded-full', priorityColor(todo.priority)]" />
                <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium" :class="{ 'line-through opacity-50': todo.status === 'completed' }">
                        {{ todo.title }}
                    </p>
                    <p class="text-xs capitalize text-muted-foreground">{{ todo.category }}</p>
                </div>
                <span class="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">{{ todo.status.replace('_', ' ') }}</span>
            </li>
        </ul>
    </div>
</template>

