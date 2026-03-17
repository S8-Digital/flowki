import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle, Eye, EyeOff, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { complete, destroy, store, update } from '@/actions/App/Http/Controllers/ChoreController';
import { getMemberColor, getInitials } from '@/components/Calendar/MemberColumn';
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
import type { BreadcrumbItem, Chore, PaginatedResource, User } from '@/types';

interface Props {
    chores: Chore[] | null;
    members: User[];
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

const UNASSIGNED_ID = -1;

export default function ChoresIndex({ chores, members }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editingChore, setEditingChore] = useState<Chore | null>(null);
    const [hiddenMembers, setHiddenMembers] = useState<Set<number>>(new Set());

    const createForm = useForm({
        title: '',
        description: '',
        frequency: 'weekly',
        next_due_date: '',
        assignee_ids: [] as string[],
        reminder_enabled: true,
        reminder_lead_time: 60,
    });
    const editForm = useForm({
        title: '',
        description: '',
        frequency: '',
        next_due_date: '',
        assignee_ids: [] as string[],
        reminder_enabled: true,
        reminder_lead_time: 60,
    });

    function openEdit(chore: Chore) {
        setEditingChore(chore);
        editForm.setData({
            title: chore.title,
            description: chore.description ?? '',
            frequency: chore.frequency ?? '',
            next_due_date: chore.next_due_date ?? '',
            assignee_ids: chore.assignees?.map((a) => String(a.id)) ?? [],
            reminder_enabled: chore.reminder_enabled ?? true,
            reminder_lead_time: chore.reminder_lead_time ?? 60,
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
        if (!chores) {
            return null;
        }

        const assigned = members.map((member, idx) => {
            const memberChores = chores.filter((c) => c.assignees?.some((a) => a.id === member.id));
            const pending = memberChores.length;

            return { member, idx, chores: memberChores, pending };
        });

        const unassigned = chores.filter((c) => !c.assignees?.length);

        return { assigned, unassigned };
    }, [chores, members]);

    const visibleAssigned = columns?.assigned.filter((col) => !hiddenMembers.has(col.member.id)) ?? [];
    const unassignedVisible = !hiddenMembers.has(UNASSIGNED_ID);

    return (
        <>
            <Head title="Chores" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-6">
                    {/* Header */}
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
                                    <div className="space-y-3 rounded-lg border p-3">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="create-chore-reminder-enabled" className="cursor-pointer">
                                                Reminder
                                            </Label>
                                            <Switch
                                                id="create-chore-reminder-enabled"
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
                                        {createForm.processing ? 'Creating\u2026' : 'Create Chore'}
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
                    {!chores || !columns ? (
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
                                                {chore.assignees?.length ? (
                                                    <span className="flex flex-wrap items-center gap-1">
                                                        {chore.assignees.map((a) => (
                                                            <span key={a.id} className="flex items-center gap-0.5">
                                                                <span
                                                                    className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[7px] font-bold text-white"
                                                                    style={{ backgroundColor: getProfileColor(a) ?? '#94a3b8' }}
                                                                    title={a.name}
                                                                >
                                                                    {a.name[0]?.toUpperCase()}
                                                                </span>
                                                                {a.name}
                                                            </span>
                                                        ))}
                                                    </span>
                                                ) : null}
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
                </div>

                {/* Edit dialog */}
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
                                    <div className="space-y-3 rounded-lg border p-3">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="edit-chore-reminder-enabled" className="cursor-pointer">
                                                Reminder
                                            </Label>
                                            <Switch
                                                id="edit-chore-reminder-enabled"
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
