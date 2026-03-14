<script setup lang="ts">
import { destroy as destroyItem, store as storeItem, toggle } from '@/actions/App/Http/Controllers/ShoppingItemController';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem, type ShoppingItem, type ShoppingList } from '@/types';
import { Form, Head, router } from '@inertiajs/vue3';
import { Plus, Trash2 } from 'lucide-vue-next';
import { computed } from 'vue';

interface Props {
    list: ShoppingList;
}

const props = defineProps<Props>();

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Shopping', href: '/shopping' },
    { title: props.list.name, href: `/shopping/${props.list.id}` },
];

const unchecked = computed(() => props.list.items?.filter((i) => !i.is_checked) ?? []);
const checked = computed(() => props.list.items?.filter((i) => i.is_checked) ?? []);

function toggleItem(item: ShoppingItem) {
    router.patch(toggle({ shoppingList: props.list.id, shoppingItem: item.id }).url);
}

function deleteItem(item: ShoppingItem) {
    router.delete(destroyItem({ shoppingList: props.list.id, shoppingItem: item.id }).url);
}
</script>

<template>
    <Head :title="list.name" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col gap-6 p-6">
            <div class="flex items-center justify-between">
                <h1 class="text-xl font-semibold">{{ list.name }}</h1>
                <span v-if="list.is_shared" class="rounded-full bg-secondary px-2 py-0.5 text-xs">Shared</span>
            </div>

            <!-- Add Item -->
            <Form :action="storeItem(list.id)" method="post" class="flex gap-2" v-slot="{ errors, processing }" reset-on-success>
                <div class="flex-1">
                    <Input name="name" placeholder="Add item…" required />
                    <InputError :message="errors.name" />
                </div>
                <Input name="quantity" placeholder="Qty" class="w-20" />
                <select name="category" class="h-9 rounded-md border bg-background px-3 text-sm">
                    <option value="groceries">Groceries</option>
                    <option value="household">Household</option>
                    <option value="personal_care">Personal Care</option>
                    <option value="other">Other</option>
                </select>
                <Button type="submit" size="sm" :disabled="processing">
                    <Plus class="size-4" />
                </Button>
            </Form>

            <!-- Unchecked items -->
            <ul v-if="unchecked.length" class="divide-y rounded-xl border">
                <li v-for="item in unchecked" :key="item.id" class="flex items-center gap-3 px-4 py-2">
                    <input type="checkbox" :checked="item.is_checked" @change="toggleItem(item)" class="size-4 cursor-pointer rounded" />
                    <div class="flex-1">
                        <span class="font-medium">{{ item.name }}</span>
                        <span v-if="item.quantity" class="ml-2 text-sm text-muted-foreground">{{ item.quantity }}</span>
                    </div>
                    <span class="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">{{ item.category }}</span>
                    <Button variant="ghost" size="icon" @click="deleteItem(item)">
                        <Trash2 class="size-3.5 text-destructive" />
                    </Button>
                </li>
            </ul>

            <!-- Checked items -->
            <div v-if="checked.length">
                <p class="mb-2 text-sm font-medium text-muted-foreground">Checked off ({{ checked.length }})</p>
                <ul class="divide-y rounded-xl border opacity-60">
                    <li v-for="item in checked" :key="item.id" class="flex items-center gap-3 px-4 py-2">
                        <input type="checkbox" :checked="item.is_checked" @change="toggleItem(item)" class="size-4 cursor-pointer rounded" />
                        <span class="flex-1 line-through text-muted-foreground">{{ item.name }}</span>
                        <Button variant="ghost" size="icon" @click="deleteItem(item)">
                            <Trash2 class="size-3.5 text-destructive" />
                        </Button>
                    </li>
                </ul>
            </div>

            <div v-if="!unchecked.length && !checked.length" class="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
                List is empty. Add your first item above!
            </div>
        </div>
    </AppLayout>
</template>

