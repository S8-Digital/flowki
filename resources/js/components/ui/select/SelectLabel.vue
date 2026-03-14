<script setup lang="ts">
import { cn } from '@/lib/utils';
import { SelectLabel } from 'reka-ui';
import { type HTMLAttributes } from 'vue';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
    <SelectLabel :class="cn('py-1.5 pl-8 pr-2 text-xs font-semibold', props.class)">
        <slot />
    </SelectLabel>
</template>
