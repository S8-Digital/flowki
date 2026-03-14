<script setup lang="ts">
import { index as calendarIndex } from '@/actions/App/Http/Controllers/CalendarEventController';
import { index as choreIndex } from '@/actions/App/Http/Controllers/ChoreController';
import { show as recipeShow } from '@/actions/App/Http/Controllers/RecipeController';
import { index as todoIndex } from '@/actions/App/Http/Controllers/TodoController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@inertiajs/vue3';
import { Search, X } from 'lucide-vue-next';
import { ref, watch } from 'vue';

interface SearchResults {
    todos: Array<{ id: number; title: string }>;
    chores: Array<{ id: number; title: string }>;
    events: Array<{ id: number; title: string }>;
    recipes: Array<{ id: number; title: string }>;
    shopping_items: Array<{ id: number; name: string }>;
}

const isOpen = ref(false);
const query = ref('');
const results = ref<SearchResults | null>(null);
const isLoading = ref(false);
let debounceTimer: ReturnType<typeof setTimeout>;

function open() {
    isOpen.value = true;
}

function close() {
    isOpen.value = false;
    query.value = '';
    results.value = null;
}

watch(query, (val) => {
    clearTimeout(debounceTimer);
    if (val.length < 2) {
        results.value = null;
        return;
    }
    isLoading.value = true;
    debounceTimer = setTimeout(async () => {
        try {
            const response = await fetch(`/search?q=${encodeURIComponent(val)}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
            });
            results.value = await response.json();
        } finally {
            isLoading.value = false;
        }
    }, 300);
});

const hasResults = () =>
    results.value &&
    results.value.todos.length +
        results.value.chores.length +
        results.value.events.length +
        results.value.recipes.length +
        results.value.shopping_items.length >
        0;
</script>

<template>
    <div class="relative">
        <Button variant="ghost" size="icon" class="group h-9 w-9 cursor-pointer" @click="open">
            <Search class="size-5 opacity-80 group-hover:opacity-100" />
        </Button>

        <!-- Overlay -->
        <Teleport to="body">
            <div v-if="isOpen" class="fixed inset-0 z-50 flex items-start justify-center pt-20">
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close" />

                <div class="relative z-10 w-full max-w-lg rounded-xl border bg-background shadow-2xl">
                    <div class="flex items-center gap-2 border-b px-4 py-3">
                        <Search class="size-4 shrink-0 text-muted-foreground" />
                        <Input
                            v-model="query"
                            placeholder="Search todos, chores, events, recipes…"
                            class="border-0 p-0 shadow-none focus-visible:ring-0"
                            autofocus
                        />
                        <Button variant="ghost" size="icon" class="h-6 w-6 shrink-0" @click="close">
                            <X class="size-4" />
                        </Button>
                    </div>

                    <div class="max-h-96 overflow-y-auto p-2">
                        <p v-if="isLoading" class="py-4 text-center text-sm text-muted-foreground">Searching…</p>

                        <p v-else-if="query.length >= 2 && !hasResults()" class="py-4 text-center text-sm text-muted-foreground">
                            No results for "{{ query }}"
                        </p>

                        <template v-if="results">
                            <!-- Todos -->
                            <div v-if="results.todos.length">
                                <p class="px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Todos</p>
                                <Link
                                    v-for="t in results.todos"
                                    :key="t.id"
                                    :href="todoIndex().url"
                                    class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                    @click="close"
                                >
                                    {{ t.title }}
                                </Link>
                            </div>

                            <!-- Chores -->
                            <div v-if="results.chores.length">
                                <p class="px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Chores</p>
                                <Link
                                    v-for="c in results.chores"
                                    :key="c.id"
                                    :href="choreIndex().url"
                                    class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                    @click="close"
                                >
                                    {{ c.title }}
                                </Link>
                            </div>

                            <!-- Events -->
                            <div v-if="results.events.length">
                                <p class="px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Events</p>
                                <Link
                                    v-for="e in results.events"
                                    :key="e.id"
                                    :href="calendarIndex().url"
                                    class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                    @click="close"
                                >
                                    {{ e.title }}
                                </Link>
                            </div>

                            <!-- Recipes -->
                            <div v-if="results.recipes.length">
                                <p class="px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Recipes</p>
                                <Link
                                    v-for="r in results.recipes"
                                    :key="r.id"
                                    :href="recipeShow(r.id).url"
                                    class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                    @click="close"
                                >
                                    {{ r.title }}
                                </Link>
                            </div>

                            <!-- Shopping Items -->
                            <div v-if="results.shopping_items.length">
                                <p class="px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Shopping Items</p>
                                <p
                                    v-for="item in results.shopping_items"
                                    :key="item.id"
                                    class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground"
                                >
                                    {{ item.name }}
                                </p>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>
