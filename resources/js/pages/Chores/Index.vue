<script setup lang="ts">
import { complete, destroy, store, update } from '@/actions/App/Http/Controllers/ChoreController';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem, type Chore, type PaginatedResource, type User } from '@/types';
import { Form, Head, router, WhenVisible } from '@inertiajs/vue3';
import { CheckCircle, Plus, Trash2 } from 'lucide-vue-next';
import { ref } from 'vue';

interface Props {
    chores: PaginatedResource<Chore> | null;
    members: User[];
    filters: Record<string, string>;
}

defineProps<Props>();

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Chores', href: '/chores' }];

const editingChore = ref<Chore | null>(null);
const createOpen = ref(false);
const editOpen = ref(false);

// Create form controlled values
const createFrequency = ref('weekly');
const createNextDue = ref('');
const createAssignees = ref<string[]>([]);

// Edit form controlled values
const editFrequency = ref('');
const editNextDue = ref('');
const editAssignees = ref<string[]>([]);

function openEdit(chore: Chore) {
    editingChore.value = chore;
    editFrequency.value = chore.frequency ?? '';
    editNextDue.value = chore.next_due_date ?? '';
    editAssignees.value = chore.assignees?.map((a) => String(a.id)) ?? [];
    editOpen.value = true;
}

function deleteChore(chore: Chore) {
    if (!confirm('Delete this chore?')) return;
    router.delete(destroy(chore.id).url);
}

function markComplete(chore: Chore) {
    router.post(complete(chore.id).url);
}

function formatDateTime(value: string | null) {
    if (!value) return null;
    return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
</script>

<template>
    <Head title="Chores" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col gap-4 p-6">
            <div class="flex items-center justify-between">
                <h1 class="text-xl font-semibold">Chores</h1>

                <Dialog v-model:open="createOpen">
                    <DialogTrigger as-child>
                        <Button size="sm"><Plus class="mr-1 size-4" /> New Chore</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create Chore</DialogTitle></DialogHeader>
                        <Form :action="store()" method="post" class="space-y-4" v-slot="{ errors, processing }" reset-on-success>
                            <div class="grid gap-2">
                                <Label for="title">Title</Label>
                                <Input id="title" name="title" placeholder="Chore name" required />
                                <InputError :message="errors.title" />
                            </div>
                            <div class="grid gap-2">
                                <Label for="description">Description</Label>
                                <Input id="description" name="description" placeholder="Optional" />
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="grid gap-2">
                                    <Label>Frequency</Label>
                                    <input type="hidden" name="frequency" :value="createFrequency" />
                                    <Select v-model="createFrequency">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="as_needed">As Needed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError :message="errors.frequency" />
                                </div>
                                <div class="grid gap-2">
                                    <Label>Next Due</Label>
                                    <DateTimeInput name="next_due_date" v-model="createNextDue" />
                                </div>
                            </div>
                            <div class="grid gap-2">
                                <Label>Assign To</Label>
                                <div class="flex flex-col gap-1.5">
                                    <label
                                        v-for="m in members"
                                        :key="m.id"
                                        class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent"
                                    >
                                        <input
                                            type="checkbox"
                                            name="assignee_ids[]"
                                            :value="m.id"
                                            v-model="createAssignees"
                                            class="rounded border-input"
                                        />
                                        {{ m.name }}
                                    </label>
                                </div>
                            </div>
                            <Button type="submit" class="w-full" :disabled="processing">
                                {{ processing ? 'Creating…' : 'Create Chore' }}
                            </Button>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <WhenVisible :data="['chores']" key="chores-list">
                <template #fallback>
                    <div class="space-y-2">
                        <Skeleton v-for="i in 5" :key="i" class="h-16 w-full rounded-xl" />
                    </div>
                </template>

                <div v-if="chores && chores.data.length === 0" class="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
                    No chores yet. Add your first one!
                </div>

                <ul v-else-if="chores" class="divide-y rounded-xl border">
                    <li v-for="chore in chores.data" :key="chore.id" class="flex items-center justify-between gap-3 px-4 py-3">
                        <div class="min-w-0 flex-1">
                            <p class="truncate font-medium">{{ chore.title }}</p>
                            <p class="mt-0.5 flex gap-2 text-xs text-muted-foreground">
                                <span class="capitalize">{{ chore.frequency }}</span>
                                <span v-if="chore.next_due_date">Due {{ formatDateTime(chore.next_due_date) }}</span>
                                <span v-if="chore.assignees?.length">→ {{ chore.assignees.map((a) => a.name).join(', ') }}</span>
                            </p>
                        </div>
                        <div class="flex shrink-0 items-center gap-2">
                            <Button variant="ghost" size="icon" @click="markComplete(chore)" title="Mark complete">
                                <CheckCircle class="size-4 text-green-500" />
                            </Button>
                            <Button variant="ghost" size="icon" @click="openEdit(chore)">
                                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            </Button>
                            <Button variant="ghost" size="icon" @click="deleteChore(chore)">
                                <Trash2 class="size-4 text-destructive" />
                            </Button>
                        </div>
                    </li>
                </ul>
            </WhenVisible>

            <!-- Edit Modal -->
            <Dialog v-model:open="editOpen">
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Chore</DialogTitle></DialogHeader>
                    <Form v-if="editingChore" :action="update(editingChore.id)" method="patch" class="space-y-4" v-slot="{ errors, processing }">
                        <div class="grid gap-2">
                            <Label>Title</Label>
                            <Input name="title" :default-value="editingChore.title" required />
                            <InputError :message="errors.title" />
                        </div>
                        <div class="grid gap-2">
                            <Label>Description</Label>
                            <Input name="description" :default-value="editingChore.description ?? ''" />
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="grid gap-2">
                                <Label>Frequency</Label>
                                <input type="hidden" name="frequency" :value="editFrequency" />
                                <Select v-model="editFrequency">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="as_needed">As Needed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div class="grid gap-2">
                                <Label>Next Due</Label>
                                <DateTimeInput name="next_due_date" v-model="editNextDue" />
                            </div>
                        </div>
                        <div class="grid gap-2">
                            <Label>Assign To</Label>
                            <div class="flex flex-col gap-1.5">
                                <label
                                    v-for="m in members"
                                    :key="m.id"
                                    class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent"
                                >
                                    <input
                                        type="checkbox"
                                        name="assignee_ids[]"
                                        :value="m.id"
                                        v-model="editAssignees"
                                        class="rounded border-input"
                                    />
                                    {{ m.name }}
                                </label>
                            </div>
                        </div>
                        <Button type="submit" class="w-full" :disabled="processing">
                            {{ processing ? 'Saving…' : 'Save Changes' }}
                        </Button>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    </AppLayout>
</template>

