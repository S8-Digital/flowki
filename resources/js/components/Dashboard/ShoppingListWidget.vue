<script setup lang="ts">
interface ShoppingItemData {
    id: number;
    name: string;
    quantity: string | null;
    category: string;
    is_checked: boolean;
}

interface ShoppingListData {
    id: number;
    name: string;
    items: ShoppingItemData[];
}

const props = defineProps<{
    shoppingItems: Record<number, ShoppingListData>;
    listId?: number | string;
    shoppingLists: { id: number; name: string }[];
}>();

function resolvedList(): ShoppingListData | null {
    if (props.listId) {
        return props.shoppingItems[Number(props.listId)] ?? null;
    }
    const first = Object.values(props.shoppingItems)[0];
    return first ?? null;
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <template v-if="resolvedList()">
            <p class="text-xs font-medium text-muted-foreground">{{ resolvedList()!.name }}</p>
            <div v-if="resolvedList()!.items.length === 0" class="py-8 text-center text-sm text-muted-foreground">Nothing left to buy!</div>
            <ul v-else class="space-y-1.5">
                <li v-for="item in resolvedList()!.items" :key="item.id" class="flex items-center gap-2 rounded-md px-2 py-1 text-sm">
                    <div class="size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                    <span class="flex-1 truncate">{{ item.name }}</span>
                    <span v-if="item.quantity" class="shrink-0 text-xs text-muted-foreground">{{ item.quantity }}</span>
                </li>
            </ul>
        </template>
        <div v-else class="py-8 text-center text-sm text-muted-foreground">No shopping lists yet.</div>
    </div>
</template>
