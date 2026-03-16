import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { complete, destroy, store, update } from '@/actions/App/Http/Controllers/ChoreController';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/AppLayout';
import { getProfileColor } from '@/lib/utils';
import type { BreadcrumbItem, Chore, PaginatedResource, User } from '@/types';

interface Props {
    chores: PaginatedResource<Chore> | null;
    members: User[];
    filters: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Chores', href: '/chores' }];

function formatDateTime(value: string | null) {
    if (!value) {
        return null;
    }

    return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

const FREQUENCIES = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'as_needed', label: 'As Needed' },
];

export default function ChoresIndex({ chores, members }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editingChore, setEditingChore] = useState<Chore | null>(null);

    const createForm = useForm({ title: '', description: '', frequency: 'weekly', next_due_date: '', assignee_ids: [] as string[] });
    const editForm = useForm({ title: '', description: '', frequency: '', next_due_date: '', assignee_ids: [] as string[] });

    function openEdit(chore: Chore) {
        setEditingChore(chore);
        editForm.setData({
            title: chore.title,
            description: chore.description ?? '',
            frequency: chore.frequency ?? '',
            next_due_date: chore.next_due_date ?? '',
            assignee_ids: chore.assignees?.map((a) => String(a.id)) ?? [],
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

        if (!editingChore) {
            return;
        }

        editForm.patch(update(editingChore.id).url, { onSuccess: () => setEditOpen(false) });
    }

    function deleteChore(chore: Chore) {
        if (!confirm('Delete this chore?')) {
            return;
        }

        router.delete(destroy(chore.id).url);
    }

    function markComplete(chore: Chore) {
        router.post(complete(chore.id).url);
    }

    function toggleAssignee(formSetData: (key: 'assignee_ids', val: string[]) => void, current: string[], id: string) {
        formSetData('assignee_ids', current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
    }

    return (
        <>
            <Head title="Chores" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Chores</h1>
                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="mr-1 size-4" /> New Chore
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Chore</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Title</Label>
                                        <Input
                                            value={createForm.data.title}
                                            onChange={(e) => createForm.setData('title', e.target.value)}
                                            placeholder="Chore name"
                                            required
                                        />
                                        <InputError message={createForm.errors.title} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={createForm.data.description}
                                            onChange={(e) => createForm.setData('description', e.target.value)}
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label>Frequency</Label>
                                            <Select value={createForm.data.frequency} onValueChange={(v) => createForm.setData('frequency', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {FREQUENCIES.map((f) => (
                                                        <SelectItem key={f.value} value={f.value}>
                                                            {f.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Next Due</Label>
                                            <DateTimeInput
                                                value={createForm.data.next_due_date}
                                                onChange={(e) => createForm.setData('next_due_date', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Assign To</Label>
                                        <div className="flex flex-col gap-1.5">
                                            {members.map((m) => (
                                                <label
                                                    key={m.id}
                                                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={createForm.data.assignee_ids.includes(String(m.id))}
                                                        onChange={() =>
                                                            toggleAssignee(createForm.setData, createForm.data.assignee_ids, String(m.id))
                                                        }
                                                        className="rounded border-input"
                                                    />
                                                    {m.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={createForm.processing}>
                                        {createForm.processing ? 'Creating…' : 'Create Chore'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {!chores ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : chores.data.length === 0 ? (
                        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
                            No chores yet. Add your first one!
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {chores.data.map((chore) => {
                                const primaryAssignee = chore.assignees?.[0];
                                const assigneeColor = getProfileColor(primaryAssignee);

                                return (
                                    <li
                                        key={chore.id}
                                        className="category-chores-item flex items-center justify-between gap-3 overflow-hidden rounded-xl px-4 py-3"
                                        style={assigneeColor ? { borderLeft: `4px solid ${assigneeColor}` } : undefined}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">{chore.title}</p>
                                            <p className="mt-0.5 flex gap-2 text-xs opacity-70">
                                                <span className="capitalize">{chore.frequency}</span>
                                                {chore.next_due_date && <span>Due {formatDateTime(chore.next_due_date)}</span>}
                                                {chore.assignees?.length ? <span>→ {chore.assignees.map((a) => a.name).join(', ')}</span> : null}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => markComplete(chore)} title="Mark complete">
                                                <CheckCircle className="size-4 text-green-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(chore)}>
                                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteChore(chore)}>
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
                                <DialogTitle>Edit Chore</DialogTitle>
                            </DialogHeader>
                            {editingChore && (
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
                                            <Label>Frequency</Label>
                                            <Select value={editForm.data.frequency} onValueChange={(v) => editForm.setData('frequency', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {FREQUENCIES.map((f) => (
                                                        <SelectItem key={f.value} value={f.value}>
                                                            {f.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Next Due</Label>
                                            <DateTimeInput
                                                value={editForm.data.next_due_date}
                                                onChange={(e) => editForm.setData('next_due_date', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Assign To</Label>
                                        <div className="flex flex-col gap-1.5">
                                            {members.map((m) => (
                                                <label
                                                    key={m.id}
                                                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm.data.assignee_ids.includes(String(m.id))}
                                                        onChange={() => toggleAssignee(editForm.setData, editForm.data.assignee_ids, String(m.id))}
                                                        className="rounded border-input"
                                                    />
                                                    {m.name}
                                                </label>
                                            ))}
                                        </div>
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
