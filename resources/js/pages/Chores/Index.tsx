import { Head, router, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import MuiCheckbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import Typography from '@mui/material/Typography';
import { CheckCircle, Eye, EyeOff, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { complete, destroy, store, update } from '@/actions/App/Http/Controllers/ChoreController';
import { getInitials, getMemberColor } from '@/components/Calendar/MemberColumn';
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
import type { BreadcrumbItem, Chore, User } from '@/types';

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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Chores
                        </Typography>
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
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Label>Title</Label>
                                        <Input
                                            value={createForm.data.title}
                                            onChange={(e) => createForm.setData('title', e.target.value)}
                                            placeholder="Chore name"
                                            required
                                        />
                                        <InputError message={createForm.errors.title} />
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Label>Description</Label>
                                        <Input
                                            value={createForm.data.description}
                                            onChange={(e) => createForm.setData('description', e.target.value)}
                                            placeholder="Optional"
                                        />
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                        <Box sx={{ display: 'grid', gap: 1 }}>
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
                                        </Box>
                                        <Box sx={{ display: 'grid', gap: 1 }}>
                                            <Label>Next Due</Label>
                                            <DateTimeInput
                                                value={createForm.data.next_due_date}
                                                onChange={(e) => createForm.setData('next_due_date', e.target.value)}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Label>Assign To</Label>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            {members.map((m) => (
                                                <FormControlLabel
                                                    key={m.id}
                                                    control={
                                                        <MuiCheckbox
                                                            checked={createForm.data.assignee_ids.includes(String(m.id))}
                                                            onChange={() =>
                                                                toggleAssignee(createForm.setData, createForm.data.assignee_ids, String(m.id))
                                                            }
                                                            size="small"
                                                        />
                                                    }
                                                    label={m.name}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1.5,
                                            borderRadius: '12px',
                                            border: 1,
                                            borderColor: 'divider',
                                            p: 1.5,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Label htmlFor="create-chore-reminder-enabled" className="cursor-pointer">
                                                Reminder
                                            </Label>
                                            <Switch
                                                id="create-chore-reminder-enabled"
                                                checked={createForm.data.reminder_enabled}
                                                onCheckedChange={(v) => createForm.setData('reminder_enabled', v)}
                                            />
                                        </Box>
                                        {createForm.data.reminder_enabled && (
                                            <Box sx={{ display: 'grid', gap: 1 }}>
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
                                            </Box>
                                        )}
                                    </Box>
                                    <Button type="submit" className="w-full" disabled={createForm.processing}>
                                        {createForm.processing ? 'Creating…' : 'Create Chore'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </Box>

                    {/* Member toggles */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {members.map((member, idx) => {
                            const color = getMemberColor(member, idx);
                            const hidden = hiddenMembers.has(member.id);

                            return (
                                <Box
                                    component="button"
                                    key={member.id}
                                    type="button"
                                    onClick={() => toggleMember(member.id)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.75,
                                        borderRadius: '50px',
                                        border: 1,
                                        px: 1.25,
                                        py: 0.5,
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        opacity: hidden ? 0.4 : 1,
                                        bgcolor: 'transparent',
                                    }}
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
                                </Box>
                            );
                        })}
                        {/* Unassigned toggle */}
                        <Box
                            component="button"
                            type="button"
                            onClick={() => toggleMember(UNASSIGNED_ID)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                borderRadius: '50px',
                                border: 1,
                                px: 1.25,
                                py: 0.5,
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                opacity: hiddenMembers.has(UNASSIGNED_ID) ? 0.4 : 1,
                                bgcolor: 'transparent',
                            }}
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
                        </Box>
                    </Box>

                    {/* Column view */}
                    {!chores || !columns ? (
                        <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                            {[...Array(3)].map((_, i) => (
                                <Box key={i} sx={{ display: 'flex', maxWidth: 320, minWidth: 240, flex: 1, flexDirection: 'column', gap: 1 }}>
                                    <Skeleton className="h-20 w-full rounded-xl" />
                                    {[...Array(3)].map((_, j) => (
                                        <Skeleton key={j} className="h-14 w-full rounded-xl" />
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                            {/* Member columns */}
                            {visibleAssigned.map(({ member, idx, chores: memberChores, pending }) => {
                                const color = getMemberColor(member, idx);

                                return (
                                    <Box
                                        key={member.id}
                                        sx={{
                                            display: 'flex',
                                            maxWidth: 320,
                                            minWidth: 240,
                                            flex: 1,
                                            flexDirection: 'column',
                                            overflow: 'hidden',
                                            borderRadius: 3,
                                            border: 1,
                                            borderColor: 'divider',
                                        }}
                                    >
                                        {/* Column header */}
                                        <Box
                                            sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 1.5 }}
                                            style={{ backgroundColor: `${color}22`, borderBottom: `3px solid ${color}` }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        width: 32,
                                                        height: 32,
                                                        flexShrink: 0,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '50%',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        color: 'white',
                                                    }}
                                                    style={{ backgroundColor: color }}
                                                    aria-label={member.name}
                                                >
                                                    {getInitials(member.name)}
                                                </Box>
                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}
                                                    >
                                                        {member.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {pending} chore{pending !== 1 ? 's' : ''}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Column items */}
                                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75, overflowY: 'auto', p: 1 }}>
                                            {memberChores.length === 0 ? (
                                                <Typography
                                                    variant="caption"
                                                    sx={{ py: 3, textAlign: 'center', color: 'text.secondary', display: 'block' }}
                                                >
                                                    No chores
                                                </Typography>
                                            ) : (
                                                memberChores.map((chore) => (
                                                    <Box
                                                        key={chore.id}
                                                        sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, borderRadius: '8px', p: 1 }}
                                                        style={{
                                                            backgroundColor: `${color}15`,
                                                            border: `1px solid ${color}`,
                                                        }}
                                                    >
                                                        <Box sx={{ mt: 0.25, flexShrink: 0 }}>
                                                            <RefreshCw className="size-3.5 text-emerald-500" />
                                                        </Box>
                                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    display: 'block',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                {chore.title}
                                                            </Typography>
                                                            <Box
                                                                sx={{
                                                                    mt: 0.25,
                                                                    display: 'flex',
                                                                    flexWrap: 'wrap',
                                                                    gap: 0.5,
                                                                    fontSize: '0.75rem',
                                                                    color: 'text.secondary',
                                                                }}
                                                            >
                                                                <Box component="span" sx={{ textTransform: 'capitalize' }}>
                                                                    {chore.frequency}
                                                                </Box>
                                                                {chore.next_due_date && <span>&middot; {formatDateTime(chore.next_due_date)}</span>}
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', flexShrink: 0, gap: 0.25 }}>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-6"
                                                                onClick={() => markComplete(chore)}
                                                                title="Mark complete"
                                                            >
                                                                <CheckCircle className="size-5 text-green-500" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="size-6" onClick={() => openEdit(chore)}>
                                                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                    />
                                                                </svg>
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="size-6" onClick={() => deleteChore(chore)}>
                                                                <Trash2 className="size-5 text-destructive" />
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                ))
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })}
                            {/* Unassigned column */}
                            {unassignedVisible && columns.unassigned.length > 0 && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        maxWidth: 320,
                                        minWidth: 240,
                                        flex: 1,
                                        flexDirection: 'column',
                                        overflow: 'hidden',
                                        borderRadius: 3,
                                        border: 1,
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Box
                                        sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 1.5 }}
                                        style={{ backgroundColor: '#94a3b822', borderBottom: '3px solid #94a3b8' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    width: 32,
                                                    height: 32,
                                                    flexShrink: 0,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '50%',
                                                    bgcolor: '#94a3b8',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    color: 'white',
                                                }}
                                            >
                                                ?
                                            </Box>
                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}
                                                >
                                                    Unassigned
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    {columns.unassigned.length} chore{columns.unassigned.length !== 1 ? 's' : ''}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75, overflowY: 'auto', p: 1 }}>
                                        {columns.unassigned.map((chore) => (
                                            <Box
                                                key={chore.id}
                                                sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, borderRadius: '8px', p: 1 }}
                                                style={{ backgroundColor: '#94a3b815', border: '1px solid #94a3b8' }}
                                            >
                                                <Box sx={{ mt: 0.25, flexShrink: 0 }}>
                                                    <RefreshCw className="size-3.5 text-slate-400" />
                                                </Box>
                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            display: 'block',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {chore.title}
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            mt: 0.25,
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            gap: 0.5,
                                                            fontSize: '0.75rem',
                                                            color: 'text.secondary',
                                                        }}
                                                    >
                                                        <Box component="span" sx={{ textTransform: 'capitalize' }}>
                                                            {chore.frequency}
                                                        </Box>
                                                        {chore.next_due_date && <span>&middot; {formatDateTime(chore.next_due_date)}</span>}
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', flexShrink: 0, gap: 0.25 }}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-6"
                                                        onClick={() => markComplete(chore)}
                                                        title="Mark complete"
                                                    >
                                                        <CheckCircle className="size-3 text-green-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="size-6" onClick={() => openEdit(chore)}>
                                                        <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="size-6" onClick={() => deleteChore(chore)}>
                                                        <Trash2 className="size-3 text-destructive" />
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* All hidden state */}
                            {visibleAssigned.length === 0 && (!unassignedVisible || columns.unassigned.length === 0) && (
                                <Box
                                    sx={{
                                        width: '100%',
                                        borderRadius: 3,
                                        border: 1,
                                        borderColor: 'divider',
                                        borderStyle: 'dashed',
                                        py: 8,
                                        textAlign: 'center',
                                        fontSize: '0.875rem',
                                        color: 'text.secondary',
                                    }}
                                >
                                    {chores.length === 0
                                        ? 'No chores yet. Add your first one!'
                                        : 'No members visible. Toggle members above to show their chores.'}
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Edit dialog */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Chore</DialogTitle>
                        </DialogHeader>
                        {editingChore && (
                            <form onSubmit={handleEdit} className="space-y-4">
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Label>Title</Label>
                                    <Input value={editForm.data.title} onChange={(e) => editForm.setData('title', e.target.value)} required />
                                    <InputError message={editForm.errors.title} />
                                </Box>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Label>Description</Label>
                                    <Input value={editForm.data.description} onChange={(e) => editForm.setData('description', e.target.value)} />
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
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
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Label>Next Due</Label>
                                        <DateTimeInput
                                            value={editForm.data.next_due_date}
                                            onChange={(e) => editForm.setData('next_due_date', e.target.value)}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Label>Assign To</Label>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        {members.map((m) => (
                                            <FormControlLabel
                                                key={m.id}
                                                control={
                                                    <MuiCheckbox
                                                        checked={editForm.data.assignee_ids.includes(String(m.id))}
                                                        onChange={() => toggleAssignee(editForm.setData, editForm.data.assignee_ids, String(m.id))}
                                                        size="small"
                                                    />
                                                }
                                                label={m.name}
                                            />
                                        ))}
                                    </Box>
                                </Box>
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
