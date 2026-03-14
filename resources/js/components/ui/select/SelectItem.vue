<script setup lang="ts">
import { cn } from '@/lib/utils';
import { SelectItem, SelectItemIndicator, SelectItemText } from 'reka-ui';
import { Check } from 'lucide-vue-next';
import { type HTMLAttributes } from 'vue';

defineOptions({ inheritAttrs: false });
const props = defineProps<{
    value: string;
    disabled?: boolean;
    class?: HTMLAttributes['class'];
}>();
</script>

<template>
    <SelectItem
        v-bind="$attrs"
        :value="value"
        :disabled="disabled"
        :class="
            cn(
                'focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
                'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                props.class,
            )
        "
    >
        <span class="absolute left-2 flex size-3.5 items-center justify-center">
            <SelectItemIndicator>
                <Check class="size-4" />
            </SelectItemIndicator>
        </span>
        <SelectItemText>
            <slot />
        </SelectItemText>
    </SelectItem>
</template>

