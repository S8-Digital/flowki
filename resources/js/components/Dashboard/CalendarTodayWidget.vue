<script setup lang="ts">
interface CalendarEventItem {
    id: number;
    title: string;
    start_at: string;
    end_at: string | null;
    is_all_day: boolean;
    color: string | null;
    location: string | null;
}

defineProps<{
    events: CalendarEventItem[];
}>();

function formatTime(value: string) {
    return new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
</script>

<template>
    <div class="flex flex-col gap-2">
        <p class="text-xs font-medium text-muted-foreground">{{ today }}</p>
        <div v-if="events.length === 0" class="py-8 text-center text-sm text-muted-foreground">
            Nothing scheduled for today.
        </div>
        <ul v-else class="space-y-2">
            <li
                v-for="event in events"
                :key="event.id"
                class="flex items-center gap-3 rounded-lg border p-3"
            >
                <div
                    class="size-2.5 shrink-0 rounded-full"
                    :style="{ backgroundColor: event.color ?? '#6366f1' }"
                />
                <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium">{{ event.title }}</p>
                    <p class="text-xs text-muted-foreground">
                        {{ event.is_all_day ? 'All day' : `${formatTime(event.start_at)}${event.end_at ? ` – ${formatTime(event.end_at)}` : ''}` }}
                    </p>
                </div>
            </li>
        </ul>
    </div>
</template>

