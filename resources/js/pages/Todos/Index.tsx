import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { destroy, store, update } from '@/actions/App/Http/Controllers/TodoController';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/AppLayout';
import { getProfileColor } from '@/lib/utils';
import type { BreadcrumbItem, PaginatedResource, Todo, User } from '@/types';

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

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Todos', href: '/todos' }];

function statusLabel(status: string) {
    return { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' }[status] ?? status;
}

function priorityColor(priority: string) {
    return { low: 'text-green-600', medium: 'text-yellow-600', high: 'text-red-600' }[priority] ?? '';
}

function formatDateTime(value: string | null) {
    if (!value) {
        return null;
    }

    return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function TodosIndex({ todos, members, categories }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

    const createForm = useForm({
        title: '',
        description: '',
        category: 'home',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        assigned_to: '',
        reminder_enabled: true,
        reminder_lead_time: 60,
    });
    const editForm = useForm({
        title: '',
        description: '',
        category: '',
        priority: '',
        status: '',
        due_date: '',
        assigned_to: '',
        reminder_enabled: true,
        reminder_lead_time: 60,
    });

    function openEdit(todo: Todo) {
        setEditingTodo(todo);
        editForm.setData({
            title: todo.title,
            description: todo.description ?? '',
            category: todo.category ?? '',
            priority: todo.priority ?? '',
            status: todo.status ?? '',
            due_date: todo.due_date ?? '',
            assigned_to: String(todo.assignee?.id ?? ''),
            reminder_enabled: todo.reminder_enabled ?? true,
            reminder_lead_time: todo.reminder_lead_time ?? 60,
        });
        setEditOpen(true);
    }

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post(store().url, {
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
            },
        });
    }

    function handleEdit(e: React.FormEvent) {
        e.preventDefault();

        if (!editingTodo) {
            return;
        }

        editForm.patch(update(editingTodo.id).url, { onSuccess: () => setEditOpen(false) });
    }

    function deleteTodo(todo: Todo) {
        if (!confirm('Delete this todo?')) {
            return;
        }

        router.delete(destroy(todo.id).url);
    }

    return (
        <>
            <Head title="Todos" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Todos</h1>
                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="mr-1 size-4" /> New Todo
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Todo</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={createForm.data.title}
                                            onChange={(e) => createForm.setData('title', e.target.value)}
                                            placeholder="What needs doing?"
                                            required
                                        />
                                        <InputError message={createForm.errors.title} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={createForm.data.description}
                                            onChange={(e) => createForm.setData('description', e.target.value)}
                                            placeholder="Optional details"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label>Category</Label>
                                            <Select value={createForm.data.category} onValueChange={(v) => createForm.setData('category', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((c) => (
                                                        <SelectItem key={c.value} value={c.value}>
                                                            {c.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Priority</Label>
                                            <Select value={createForm.data.priority} onValueChange={(v) => createForm.setData('priority', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label>Status</Label>
                                            <Select value={createForm.data.status} onValueChange={(v) => createForm.setData('status', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Due Date &amp; Time</Label>
                                            <DateTimeInput
                                                value={createForm.data.due_date}
                                                onChange={(e) => createForm.setData('due_date', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Assign To</Label>
                                        <Select value={createForm.data.assigned_to} onValueChange={(v) => createForm.setData('assigned_to', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Unassigned" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Unassigned</SelectItem>
                                                {members.map((m) => (
                                                    <SelectItem key={m.id} value={String(m.id)}>
                                                        {m.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3 rounded-lg border p-3">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="create-reminder-enabled" className="cursor-pointer">
                                                Reminder
                                            </Label>
                                            <Switch
                                                id="create-reminder-enabled"
                                                checked={createForm.data.reminder_enabled}
                                                onCheckedChange={(v) => createForm.setData('reminder_enabled', v)}
                                            />
                                        </div>
                                        {createForm.data.reminder_enabled && (
                                            <div className="grid gap-2">
                                                <Label className="text-xs text-muted-foreground">Send reminder</Label>
                                                <Select
                                                    value={String(createForm.data.reminder_lead_time)}
                                                    onValueChange={(v) => createForm.setData('reminder_lead_time', Number(v))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="10">10 minutes before</SelectItem>
                                                        <SelectItem value="30">30 minutes before</SelectItem>
                                                        <SelectItem value="60">1 hour before</SelectItem>
                                                        <SelectItem value="120">2 hours before</SelectItem>
                                                        <SelectItem value="1440">1 day before</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                    <Button type="submit" className="w-full" disabled={createForm.processing}>
                                        {createForm.processing ? 'Creating…' : 'Create Todo'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {!todos ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : todos.data.length === 0 ? (
                        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
                            No todos yet. Create your first one!
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {todos.data.map((todo) => {
                                const assigneeColor = getProfileColor(todo.assignee);

                                return (
                                    <li
                                        key={todo.id}
                                        className="category-todos-item flex items-center justify-between gap-3 overflow-hidden rounded-xl px-4 py-3"
                                        style={assigneeColor ? { borderLeft: `4px solid ${assigneeColor}` } : undefined}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className={`truncate font-medium${todo.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                                                {todo.title}
                                            </p>
                                            <p className="mt-0.5 flex gap-2 text-xs opacity-70">
                                                <span className="capitalize">{todo.category}</span>
                                                <span className={`font-medium capitalize ${priorityColor(todo.priority)}`}>{todo.priority}</span>
                                                {todo.due_date && <span>Due {formatDateTime(todo.due_date)}</span>}
                                                {todo.assignee && (
                                                    <span className="flex items-center gap-1">
                                                        <span
                                                            className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[7px] font-bold text-white"
                                                            style={{
                                                                backgroundColor: assigneeColor ?? '#94a3b8',
                                                            }}
                                                            title={todo.assignee.name}
                                                        >
                                                            {todo.assignee.name[0]?.toUpperCase()}
                                                        </span>
                                                        {todo.assignee.name}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs">{statusLabel(todo.status)}</span>
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(todo)}>
                                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo)}>
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Todo</DialogTitle>
                            </DialogHeader>
                            {editingTodo && (
                                <form onSubmit={handleEdit} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Title</Label>
                                        <Input value={editForm.data.title} onChange={(e) => editForm.setData('title', e.target.value)} required />
                                        <InputError message={editForm.errors.title} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Description</Label>
                                        <Input value={editForm.data.description} onChange={(e) => editForm.setData('description', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label>Category</Label>
                                            <Select value={editForm.data.category} onValueChange={(v) => editForm.setData('category', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((c) => (
                                                        <SelectItem key={c.value} value={c.value}>
                                                            {c.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Priority</Label>
                                            <Select value={editForm.data.priority} onValueChange={(v) => editForm.setData('priority', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label>Status</Label>
                                            <Select value={editForm.data.status} onValueChange={(v) => editForm.setData('status', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Due Date &amp; Time</Label>
                                            <DateTimeInput
                                                value={editForm.data.due_date}
                                                onChange={(e) => editForm.setData('due_date', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Assign To</Label>
                                        <Select value={editForm.data.assigned_to} onValueChange={(v) => editForm.setData('assigned_to', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Unassigned" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Unassigned</SelectItem>
                                                {members.map((m) => (
                                                    <SelectItem key={m.id} value={String(m.id)}>
                                                        {m.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3 rounded-lg border p-3">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="edit-reminder-enabled" className="cursor-pointer">
                                                Reminder
                                            </Label>
                                            <Switch
                                                id="edit-reminder-enabled"
                                                checked={editForm.data.reminder_enabled}
                                                onCheckedChange={(v) => editForm.setData('reminder_enabled', v)}
                                            />
                                        </div>
                                        {editForm.data.reminder_enabled && (
                                            <div className="grid gap-2">
                                                <Label className="text-xs text-muted-foreground">Send reminder</Label>
                                                <Select
                                                    value={String(editForm.data.reminder_lead_time)}
                                                    onValueChange={(v) => editForm.setData('reminder_lead_time', Number(v))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="10">10 minutes before</SelectItem>
                                                        <SelectItem value="30">30 minutes before</SelectItem>
                                                        <SelectItem value="60">1 hour before</SelectItem>
                                                        <SelectItem value="120">2 hours before</SelectItem>
                                                        <SelectItem value="1440">1 day before</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                    <Button type="submit" className="w-full" disabled={editForm.processing}>
                                        {editForm.processing ? 'Saving…' : 'Save Changes'}
                                    </Button>
                                </form>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </AppLayout>
        </>
    );
}
