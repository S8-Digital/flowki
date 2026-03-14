<script setup lang="ts">
import { cn } from '@/lib/utils';
import { SelectScrollUpButton } from 'reka-ui';
import { ChevronUp } from 'lucide-vue-next';
import { type HTMLAttributes } from 'vue';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
    <SelectScrollUpButton :class="cn('flex cursor-default items-center justify-center py-1', props.class)">
        <ChevronUp class="size-4" />
    </SelectScrollUpButton>
</template>
