<script setup lang="ts">
import { cn } from '@/lib/utils';
import { SelectTrigger } from 'reka-ui';
import { ChevronDown } from 'lucide-vue-next';
import { type HTMLAttributes } from 'vue';

defineOptions({ inheritAttrs: false });
const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
    <SelectTrigger
        v-bind="$attrs"
        :class="
            cn(
                'border-input dark:bg-input/30 flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none',
                'focus:border-ring focus:ring-ring/50 focus:ring-[3px]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                '[&>span]:line-clamp-1',
                props.class,
            )
        "
    >
        <slot />
        <ChevronDown class="size-4 shrink-0 text-muted-foreground" />
    </SelectTrigger>
</template>

