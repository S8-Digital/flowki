<script setup lang="ts">
import { useAppearance } from '@/composables/useAppearance';
import { Monitor, Moon, Sun } from 'lucide-vue-next';
import { computed } from 'vue';

const { appearance, updateAppearance } = useAppearance();

const cycle = ['light', 'dark', 'system'] as const;

const icon = computed(() => {
    if (appearance.value === 'dark') return Moon;
    if (appearance.value === 'light') return Sun;
    return Monitor;
});

const label = computed(() => {
    if (appearance.value === 'dark') return 'Dark mode';
    if (appearance.value === 'light') return 'Light mode';
    return 'System theme';
});

function toggle() {
    const currentIndex = cycle.indexOf(appearance.value as (typeof cycle)[number]);
    const next = cycle[(currentIndex + 1) % cycle.length];
    updateAppearance(next);
}
</script>

<template>
    <button
        type="button"
        :title="label"
        :aria-label="`Switch theme (current: ${label})`"
        class="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        @click="toggle"
    >
        <component :is="icon" class="size-4" />
    </button>
</template>

