<script setup lang="ts">
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-vue-next';
import type { HTMLAttributes } from 'vue';

const props = defineProps<{
    class?: HTMLAttributes['class'];
}>();

defineOptions({ inheritAttrs: false });
</script>

<template>
    <div class="relative w-full">
        <select
            data-slot="select"
            v-bind="$attrs"
            :class="
                cn(
                    'border-input dark:bg-input/30 flex h-9 w-full min-w-0 cursor-pointer appearance-none rounded-md border bg-transparent px-3 py-1 pr-8 text-base shadow-xs transition-[color,box-shadow] outline-none',
                    'focus:border-ring focus:ring-ring/50 focus:ring-[3px]',
                    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                    props.class,
                )
            "
        >
            <slot />
        </select>
        <ChevronDown
            v-if="!$attrs.multiple"
            class="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2"
        />
    </div>
</template>

