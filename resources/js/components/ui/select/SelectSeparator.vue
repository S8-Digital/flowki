<script setup lang="ts">
import { cn } from '@/lib/utils';
import { SelectSeparator } from 'reka-ui';
import { type HTMLAttributes } from 'vue';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
    <SelectSeparator :class="cn('bg-muted -mx-1 my-1 h-px', props.class)" />
</template>
