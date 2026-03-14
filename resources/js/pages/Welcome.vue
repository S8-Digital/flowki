<script setup lang="ts">
import AppearanceToggle from '@/components/AppearanceToggle.vue';
import { login, register } from '@/routes';
import { Head, Link } from '@inertiajs/vue3';
import { CalendarDays, CheckSquare, ChefHat, RotateCcw, ShoppingCart, Users } from 'lucide-vue-next';

const features = [
    { name: 'Todos', icon: CheckSquare },
    { name: 'Chores', icon: RotateCcw },
    { name: 'Calendar', icon: CalendarDays },
    { name: 'Shopping', icon: ShoppingCart },
    { name: 'Recipes', icon: ChefHat },
    { name: 'Family', icon: Users },
];
</script>

<template>
    <Head title="Family Organizer" />

    <div class="flex min-h-screen flex-col bg-background text-foreground">
        <!-- Nav -->
        <header class="flex items-center justify-between border-b px-6 py-4">
            <div class="flex items-center gap-2 text-lg font-bold">
                <Users class="size-5 text-primary" />
                Family Organizer
            </div>
            <nav class="flex items-center gap-4">
                <AppearanceToggle />
                <div class="flex items-center gap-3">
                    <Link :href="login()" class="text-sm text-muted-foreground transition hover:text-foreground">Log in</Link>
                    <Link
                        :href="register()"
                        class="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>
        </header>

        <!-- Hero -->
        <main class="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
            <div class="space-y-4">
                <h1 class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                    Organise your family,<br class="hidden sm:block" />
                    together.
                </h1>
                <p class="mx-auto max-w-xl text-lg text-muted-foreground">
                    Shared todos, chores, calendar, shopping lists, and recipes — all in one place for the whole family.
                </p>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-3">
                <Link
                    :href="register()"
                    class="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                    Create your family
                </Link>
                <Link :href="login()" class="rounded-md border px-6 py-2.5 text-sm font-semibold transition hover:bg-accent"> Sign in </Link>
            </div>

            <!-- Feature grid -->
            <div class="mt-8 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
                <div v-for="feature in features" :key="feature.name" class="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-sm">
                    <component :is="feature.icon" class="size-6 text-primary" />
                    <span class="font-medium">{{ feature.name }}</span>
                </div>
            </div>
        </main>
    </div>
</template>
