import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, Circle, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { destroy, store, update } from '@/actions/App/Http/Controllers/TodoController';
import { getMemberColor, getInitials } from '@/components/Calendar/MemberColumn';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/AppLayout';
import type { BreadcrumbItem, Todo, User } from '@/types';

interface Category {
    value: string;
    label: string;
}

interface Props {
    todos: Todo[] | null;
    members: User[];
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Todos', href: '/todos' }];

function priorityColor(priority: string) {
    return { low: 'text-green-600', medium: 'text-yellow-600', high: 'text-red-600' }[priority] ?? '';
}

function formatDateTime(value: string | null) {
    if (!value) {
        return null;
    }

    return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

const UNASSIGNED_ID = -1;

export default function TodosIndex({ todos, members, categories }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [hiddenMembers, setHiddenMembers] = useState<Set<number>>(new Set());

    const createForm = useForm({
        title: '',
        description: '',
        category: 'home',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        assigned_to: '',
    });
    const editForm = useForm({ title: '', description: '', category: '', priority: '', status: '', due_date: '', assigned_to: '' });

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

    function toggleMember(memberId: number) {
        setHiddenMembers((prev) => {
            const next = new Set(prev);

            if (next.has(memberId)) {
                next.delete(memberId);
            } else {
                next.add(memberId);
            }

            return next;
        });
    }

    const columns = useMemo(() => {
        if (!todos) {
            return null;
        }

        const assigned = members.map((member, idx) => {
            const memberTodos = todos.filter((t) => t.assignee?.id === member.id);
            const pending = memberTodos.filter((t) => t.status !== 'completed').length;
            const done = memberTodos.filter((t) => t.status === 'completed').length;

            return { member, idx, todos: memberTodos, pending, done };
        });

        const unassigned = todos.filter((t) => !t.assignee);

        return { assigned, unassigned };
    }, [todos, members]);

    const visibleAssigned = columns?.assigned.filter((col) => !hiddenMembers.has(col.member.id)) ?? [];
    const unassignedVisible = !hiddenMembers.has(UNASSIGNED_ID);

    return (
        <>
            <Head title="Todos" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-6">
                    {/* Header */}
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
                                    <Button type="submit" className="w-full" disabled={createForm.processing}>
                                        {createForm.processing ? 'Creating…' : 'Create Todo'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Member toggles */}
                    <div className="flex flex-wrap gap-1.5">
                        {members.map((member, idx) => {
                            const color = getMemberColor(member, idx);
                            const hidden = hiddenMembers.has(member.id);

                            return (
                                <button
                                    key={member.id}
                                    type="button"
                                    onClick={() => toggleMember(member.id)}
                                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${hidden ? 'opacity-40' : ''}`}
                                    style={{
                                        borderColor: color,
                                        color: hidden ? undefined : color,
                                        backgroundColor: hidden ? undefined : `${color}15`,
                                    }}
                                    aria-pressed={!hidden}
                                    title={hidden ? `Show ${member.name}` : `Hide ${member.name}`}
                                >
                                    {hidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                                    {member.name}
                                </button>
                            );
                        })}
                        {/* Unassigned toggle */}
                        <button
                            type="button"
                            onClick={() => toggleMember(UNASSIGNED_ID)}
                            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${hiddenMembers.has(UNASSIGNED_ID) ? 'opacity-40' : ''}`}
                            style={{
                                borderColor: '#94a3b8',
                                color: hiddenMembers.has(UNASSIGNED_ID) ? undefined : '#94a3b8',
                                backgroundColor: hiddenMembers.has(UNASSIGNED_ID) ? undefined : '#94a3b815',
                            }}
                            aria-pressed={!hiddenMembers.has(UNASSIGNED_ID)}
                            title={hiddenMembers.has(UNASSIGNED_ID) ? 'Show Unassigned' : 'Hide Unassigned'}
                        >
                            {hiddenMembers.has(UNASSIGNED_ID) ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                            Unassigned
                        </button>
                    </div>

                    {/* Column view */}
                    {!todos || !columns ? (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex max-w-[320px] min-w-[240px] flex-1 flex-col gap-2">
                                    <Skeleton className="h-20 w-full rounded-xl" />
                                    {[...Array(3)].map((_, j) => (
                                        <Skeleton key={j} className="h-14 w-full rounded-xl" />
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {/* Member columns */}
                            {visibleAssigned.map(({ member, idx, todos: memberTodos, pending, done }) => {
                                const color = getMemberColor(member, idx);
                                const total = memberTodos.length;
                                const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

                                return (
                                    <div
                                        key={member.id}
                                        className="flex max-w-[320px] min-w-[240px] flex-1 flex-col overflow-hidden rounded-xl border"
                                    >
                                        {/* Column header */}
                                        <div
                                            className="flex flex-col gap-1 p-3"
                                            style={{ backgroundColor: `${color}22`, borderBottom: `3px solid ${color}` }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                                    style={{ backgroundColor: color }}
                                                    aria-label={member.name}
                                                >
                                                    {getInitials(member.name)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold">{member.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {pending} pending &middot; {done} done
                                                    </p>
                                                </div>
                                            </div>
                                            {total > 0 && (
                                                <div className="mt-1">
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>{done} done</span>
                                                        <span>{completionPct}%</span>
                                                    </div>
                                                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-300"
                                                            style={{ width: `${completionPct}%`, backgroundColor: color }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Column items */}
                                        <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
                                            {memberTodos.length === 0 ? (
                                                <p className="py-6 text-center text-xs text-muted-foreground">No todos</p>
                                            ) : (
                                                memberTodos.map((todo) => (
                                                    <div
                                                        key={todo.id}
                                                        className="flex items-start gap-2 rounded-lg p-2"
                                                        style={{
                                                            backgroundColor: todo.status === 'completed' ? '#9ca3af22' : `${color}15`,
                                                            borderLeft: `3px solid ${todo.status === 'completed' ? '#9ca3af' : color}`,
                                                        }}
                                                    >
                                                        <div className="mt-0.5 shrink-0">
                                                            {todo.status === 'completed' ? (
                                                                <CheckCircle2 className="size-3.5 text-muted-foreground" />
                                                            ) : (
                                                                <Circle className="size-3.5 text-amber-500" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p
                                                                className={`truncate text-xs font-medium ${todo.status === 'completed' ? 'text-muted-foreground line-through' : ''}`}
                                                            >
                                                                {todo.title}
                                                            </p>
                                                            <p className="mt-0.5 flex flex-wrap gap-1 text-xs text-muted-foreground">
                                                                <span className={`font-medium capitalize ${priorityColor(todo.priority)}`}>
                                                                    {todo.priority}
                                                                </span>
                                                                {todo.due_date && <span>&middot; {formatDateTime(todo.due_date)}</span>}
                                                            </p>
                                                        </div>
                                                        <div className="flex shrink-0 gap-0.5">
                                                            <Button variant="ghost" size="icon" className="size-6" onClick={() => openEdit(todo)}>
                                                                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                    />
                                                                </svg>
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="size-6" onClick={() => deleteTodo(todo)}>
                                                                <Trash2 className="size-3 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Unassigned column */}
                            {unassignedVisible && columns.unassigned.length > 0 && (
                                <div className="flex max-w-[320px] min-w-[240px] flex-1 flex-col overflow-hidden rounded-xl border">
                                    <div
                                        className="flex flex-col gap-1 p-3"
                                        style={{ backgroundColor: '#94a3b822', borderBottom: '3px solid #94a3b8' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-400 text-xs font-bold text-white">
                                                ?
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold">Unassigned</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {columns.unassigned.filter((t) => t.status !== 'completed').length} pending &middot;{' '}
                                                    {columns.unassigned.filter((t) => t.status === 'completed').length} done
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
                                        {columns.unassigned.map((todo) => (
                                            <div
                                                key={todo.id}
                                                className="flex items-start gap-2 rounded-lg p-2"
                                                style={{
                                                    backgroundColor: todo.status === 'completed' ? '#9ca3af22' : '#94a3b815',
                                                    borderLeft: `3px solid ${todo.status === 'completed' ? '#9ca3af' : '#94a3b8'}`,
                                                }}
                                            >
                                                <div className="mt-0.5 shrink-0">
                                                    {todo.status === 'completed' ? (
                                                        <CheckCircle2 className="size-3.5 text-muted-foreground" />
                                                    ) : (
                                                        <Circle className="size-3.5 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p
                                                        className={`truncate text-xs font-medium ${todo.status === 'completed' ? 'text-muted-foreground line-through' : ''}`}
                                                    >
                                                        {todo.title}
                                                    </p>
                                                    <p className="mt-0.5 flex flex-wrap gap-1 text-xs text-muted-foreground">
                                                        <span className={`font-medium capitalize ${priorityColor(todo.priority)}`}>
                                                            {todo.priority}
                                                        </span>
                                                        {todo.due_date && <span>&middot; {formatDateTime(todo.due_date)}</span>}
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 gap-0.5">
                                                    <Button variant="ghost" size="icon" className="size-6" onClick={() => openEdit(todo)}>
                                                        <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="size-6" onClick={() => deleteTodo(todo)}>
                                                        <Trash2 className="size-3 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All hidden state */}
                            {visibleAssigned.length === 0 && (!unassignedVisible || columns.unassigned.length === 0) && (
                                <div className="w-full rounded-xl border py-16 text-center text-sm text-muted-foreground">
                                    {todos.length === 0
                                        ? 'No todos yet. Create your first one!'
                                        : 'No members visible. Toggle members above to show their todos.'}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Edit dialog */}
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
                                <Button type="submit" className="w-full" disabled={editForm.processing}>
                                    {editForm.processing ? 'Saving…' : 'Save Changes'}
                                </Button>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </AppLayout>
        </>
    );
}
