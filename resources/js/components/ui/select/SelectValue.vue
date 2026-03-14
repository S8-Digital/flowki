<script setup lang="ts">
import { SelectValue } from 'reka-ui';

defineProps<{ placeholder?: string }>();
</script>

<template>
    <SelectValue v-bind="$attrs" :placeholder="$props.placeholder">
        <slot />
    </SelectValue>
</template>
