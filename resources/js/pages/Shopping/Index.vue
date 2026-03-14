<script setup lang="ts">
import { destroy, show, store } from '@/actions/App/Http/Controllers/ShoppingListController';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem, type ShoppingList } from '@/types';
import { Form, Head, Link, router, WhenVisible } from '@inertiajs/vue3';
import { ExternalLink, Plus, ShoppingCart, Trash2 } from 'lucide-vue-next';
import { ref } from 'vue';

interface Props {
    lists: ShoppingList[] | null;
}

defineProps<Props>();

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Shopping', href: '/shopping' }];

const createOpen = ref(false);

function deleteList(list: ShoppingList) {
    if (!confirm('Delete this shopping list?')) return;
    router.delete(destroy(list.id).url);
}
</script>

<template>
    <Head title="Shopping Lists" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col gap-4 p-6">
            <div class="flex items-center justify-between">
                <h1 class="text-xl font-semibold">Shopping Lists</h1>

                <Dialog v-model:open="createOpen">
                    <DialogTrigger as-child>
                        <Button size="sm"><Plus class="mr-1 size-4" /> New List</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create Shopping List</DialogTitle></DialogHeader>
                        <Form :action="store()" method="post" class="space-y-4" v-slot="{ errors, processing }" reset-on-success>
                            <div class="grid gap-2">
                                <Label for="name">List Name</Label>
                                <Input id="name" name="name" placeholder="e.g. Weekly Groceries" required />
                                <InputError :message="errors.name" />
                            </div>
                            <div class="flex items-center gap-2">
                                <input id="is_shared" name="is_shared" type="checkbox" value="1" class="rounded" />
                                <Label for="is_shared">Shared with family</Label>
                            </div>
                            <Button type="submit" class="w-full" :disabled="processing">
                                {{ processing ? 'Creating…' : 'Create List' }}
                            </Button>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <WhenVisible :data="['lists']" key="lists-container">
                <template #fallback>
                    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Skeleton v-for="i in 6" :key="i" class="h-24 rounded-xl" />
                    </div>
                </template>

                <div v-if="lists && lists.length === 0" class="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
                    No shopping lists yet. Create one!
                </div>

                <div v-else-if="lists" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div v-for="list in lists" :key="list.id" class="flex flex-col justify-between rounded-xl border p-4">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="font-medium">{{ list.name }}</p>
                                <p class="text-xs text-muted-foreground">
                                    {{ list.items_count ?? 0 }} items
                                    <span v-if="list.is_shared"> · Shared</span>
                                </p>
                            </div>
                            <ShoppingCart class="size-5 text-muted-foreground" />
                        </div>
                        <div class="mt-4 flex items-center justify-between">
                            <Link :href="show(list.id).url" class="text-sm font-medium hover:underline">
                                Open <ExternalLink class="ml-1 inline size-3" />
                            </Link>
                            <Button variant="ghost" size="icon" @click="deleteList(list)">
                                <Trash2 class="size-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                </div>
            </WhenVisible>
        </div>
    </AppLayout>
</template>
