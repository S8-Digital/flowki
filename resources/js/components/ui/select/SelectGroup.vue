<script setup lang="ts">
import { SelectGroup } from 'reka-ui';
</script>

<template>
    <SelectGroup v-bind="$attrs">
        <slot />
    </SelectGroup>
</template>
