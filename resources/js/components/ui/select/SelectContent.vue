<script setup lang="ts">
import { cn } from '@/lib/utils';
import {
    SelectContent,
    SelectPortal,
    SelectViewport,
} from 'reka-ui';
import { type HTMLAttributes } from 'vue';
import SelectScrollDownButton from './SelectScrollDownButton.vue';
import SelectScrollUpButton from './SelectScrollUpButton.vue';

defineOptions({ inheritAttrs: false });
const props = defineProps<{
    class?: HTMLAttributes['class'];
    position?: 'item-aligned' | 'popper';
    sideOffset?: number;
}>();
</script>

<template>
    <SelectPortal>
        <SelectContent
            v-bind="$attrs"
            :position="position ?? 'popper'"
            :side-offset="sideOffset ?? 4"
            :class="
                cn(
                    'bg-popover text-popover-foreground relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border shadow-md',
                    'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                    (position ?? 'popper') === 'popper' &&
                        'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
                    props.class,
                )
            "
        >
            <SelectScrollUpButton />
            <SelectViewport
                :class="
                    cn('p-1', (position ?? 'popper') === 'popper' && 'h-[var(--reka-select-trigger-height)] w-full min-w-[var(--reka-select-trigger-width)]')
                "
            >
                <slot />
            </SelectViewport>
            <SelectScrollDownButton />
        </SelectContent>
    </SelectPortal>
</template>

