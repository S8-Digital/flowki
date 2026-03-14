<script setup lang="ts">
import { cn } from '@/lib/utils';
import { SelectScrollDownButton } from 'reka-ui';
import { ChevronDown } from 'lucide-vue-next';
import { type HTMLAttributes } from 'vue';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
    <SelectScrollDownButton :class="cn('flex cursor-default items-center justify-center py-1', props.class)">
        <ChevronDown class="size-4" />
    </SelectScrollDownButton>
</template>
