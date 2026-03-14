<script setup lang="ts">
import { destroy, store, update } from '@/actions/App/Http/Controllers/TodoController';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem, type PaginatedResource, type Todo, type User } from '@/types';
import { Form, Head, router, WhenVisible } from '@inertiajs/vue3';
import { Plus, Trash2 } from 'lucide-vue-next';
import { ref } from 'vue';

interface Category {
    value: string;
    label: string;
}

interface Props {
    todos: PaginatedResource<Todo> | null;
    members: User[];
    categories: Category[];
    filters: Record<string, string>;
}

defineProps<Props>();

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Todos', href: '/todos' }];

const editingTodo = ref<Todo | null>(null);
const createOpen = ref(false);
const editOpen = ref(false);

// Controlled select values for the create form
const createCategory = ref('home');
const createPriority = ref('medium');
const createStatus = ref('pending');
const createAssignedTo = ref('');
const createDueDate = ref('');

// Controlled select values for the edit form
const editCategory = ref('');
const editPriority = ref('');
const editStatus = ref('');
const editAssignedTo = ref('');
const editDueDate = ref('');

function openEdit(todo: Todo) {
    editingTodo.value = todo;
    editCategory.value = todo.category ?? '';
    editPriority.value = todo.priority ?? '';
    editStatus.value = todo.status ?? '';
    editAssignedTo.value = String(todo.assignee?.id ?? '');
    editDueDate.value = todo.due_date ?? '';
    editOpen.value = true;
}

function deleteTodo(todo: Todo) {
    if (!confirm('Delete this todo?')) return;
    router.delete(destroy(todo.id).url);
}

function statusLabel(status: string) {
    return { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' }[status] ?? status;
}

function priorityColor(priority: string) {
    return { low: 'text-green-600', medium: 'text-yellow-600', high: 'text-red-600' }[priority] ?? '';
}

function formatDateTime(value: string | null) {
    if (!value) return null;
    return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
</script>

<template>
    <Head title="Todos" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col gap-4 p-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <h1 class="text-xl font-semibold">Todos</h1>

                <Dialog v-model:open="createOpen">
                    <DialogTrigger as-child>
                        <Button size="sm">
                            <Plus class="mr-1 size-4" /> New Todo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Todo</DialogTitle>
                        </DialogHeader>
                        <Form :action="store()" method="post" class="space-y-4" v-slot="{ errors, processing }" reset-on-success>
                            <div class="grid gap-2">
                                <Label for="title">Title</Label>
                                <Input id="title" name="title" placeholder="What needs doing?" required />
                                <InputError :message="errors.title" />
                            </div>
                            <div class="grid gap-2">
                                <Label for="description">Description</Label>
                                <Input id="description" name="description" placeholder="Optional details" />
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="grid gap-2">
                                    <Label>Category</Label>
                                    <input type="hidden" name="category" :value="createCategory" />
                                    <Select v-model="createCategory">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem v-for="cat in categories" :key="cat.value" :value="cat.value">
                                                {{ cat.label }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError :message="errors.category" />
                                </div>
                                <div class="grid gap-2">
                                    <Label>Priority</Label>
                                    <input type="hidden" name="priority" :value="createPriority" />
                                    <Select v-model="createPriority">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError :message="errors.priority" />
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="grid gap-2">
                                    <Label>Status</Label>
                                    <input type="hidden" name="status" :value="createStatus" />
                                    <Select v-model="createStatus">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError :message="errors.status" />
                                </div>
                                <div class="grid gap-2">
                                    <Label>Due Date & Time</Label>
                                    <DateTimeInput name="due_date" v-model="createDueDate" />
                                    <InputError :message="errors.due_date" />
                                </div>
                            </div>
                            <div class="grid gap-2">
                                <Label>Assign To</Label>
                                <input type="hidden" name="assigned_to" :value="createAssignedTo" />
                                <Select v-model="createAssignedTo">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Unassigned" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Unassigned</SelectItem>
                                        <SelectItem v-for="m in members" :key="m.id" :value="String(m.id)">
                                            {{ m.name }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" class="w-full" :disabled="processing">
                                {{ processing ? 'Creating…' : 'Create Todo' }}
                            </Button>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <!-- List / Skeleton -->
            <WhenVisible :data="['todos']" key="todos-list">
                <template #fallback>
                    <div class="space-y-2">
                        <Skeleton v-for="i in 5" :key="i" class="h-16 w-full rounded-xl" />
                    </div>
                </template>

                <div v-if="todos && todos.data.length === 0" class="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
                    No todos yet. Create your first one!
                </div>

                <ul v-else-if="todos" class="divide-y rounded-xl border">
                    <li v-for="todo in todos.data" :key="todo.id" class="flex items-center justify-between gap-3 px-4 py-3">
                        <div class="min-w-0 flex-1">
                            <p class="truncate font-medium" :class="{ 'line-through opacity-50': todo.status === 'completed' }">
                                {{ todo.title }}
                            </p>
                            <p class="mt-0.5 flex gap-2 text-xs text-muted-foreground">
                                <span class="capitalize">{{ todo.category }}</span>
                                <span :class="priorityColor(todo.priority)" class="font-medium capitalize">{{ todo.priority }}</span>
                                <span v-if="todo.due_date">Due {{ formatDateTime(todo.due_date) }}</span>
                                <span v-if="todo.assignee">→ {{ todo.assignee.name }}</span>
                            </p>
                        </div>
                        <div class="flex shrink-0 items-center gap-2">
                            <span class="rounded-full bg-secondary px-2 py-0.5 text-xs">{{ statusLabel(todo.status) }}</span>
                            <Button variant="ghost" size="icon" @click="openEdit(todo)">
                                <span class="sr-only">Edit</span>
                                <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            </Button>
                            <Button variant="ghost" size="icon" @click="deleteTodo(todo)">
                                <Trash2 class="size-4 text-destructive" />
                            </Button>
                        </div>
                    </li>
                </ul>
            </WhenVisible>

            <!-- Edit Modal -->
            <Dialog v-model:open="editOpen">
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Todo</DialogTitle>
                    </DialogHeader>
                    <Form v-if="editingTodo" :action="update(editingTodo.id)" method="patch" class="space-y-4" v-slot="{ errors, processing }">
                        <div class="grid gap-2">
                            <Label for="edit-title">Title</Label>
                            <Input id="edit-title" name="title" :default-value="editingTodo.title" required />
                            <InputError :message="errors.title" />
                        </div>
                        <div class="grid gap-2">
                            <Label for="edit-description">Description</Label>
                            <Input id="edit-description" name="description" :default-value="editingTodo.description ?? ''" />
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="grid gap-2">
                                <Label>Category</Label>
                                <input type="hidden" name="category" :value="editCategory" />
                                <Select v-model="editCategory">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="cat in categories" :key="cat.value" :value="cat.value">
                                            {{ cat.label }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div class="grid gap-2">
                                <Label>Priority</Label>
                                <input type="hidden" name="priority" :value="editPriority" />
                                <Select v-model="editPriority">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="grid gap-2">
                                <Label>Status</Label>
                                <input type="hidden" name="status" :value="editStatus" />
                                <Select v-model="editStatus">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div class="grid gap-2">
                                <Label>Due Date & Time</Label>
                                <DateTimeInput name="due_date" v-model="editDueDate" />
                            </div>
                        </div>
                        <div class="grid gap-2">
                            <Label>Assign To</Label>
                            <input type="hidden" name="assigned_to" :value="editAssignedTo" />
                            <Select v-model="editAssignedTo">
                                <SelectTrigger>
                                    <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Unassigned</SelectItem>
                                    <SelectItem v-for="m in members" :key="m.id" :value="String(m.id)">
                                        {{ m.name }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
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

