import { Head, router, useForm } from '@inertiajs/react';
import { Fab } from '@mui/material';
import Box from '@mui/material/Box';
import MuiCheckbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import { styled } from '@mui/material/styles';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/AppLayout';
import type { BreadcrumbItem, Chore, User } from '@/types';

interface Props {
    chores: Chore[] | null;
    members: User[];
}

const PageTitle = styled(Typography)({ fontWeight: 600 });
const SectionLabel = styled(Typography)({ fontWeight: 500 });

const MemberToggleButton = styled('button')({
    display: 'flex',
    alignItems: 'center',
    border: '1px solid',
    borderRadius: '50px',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'transparent',
});

const MemberAvatar = styled(Box)({
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
});

const TruncatedBold = styled(Typography)({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 600,
});

const EmptyColumnCaption = styled(Typography)({
    textAlign: 'center' as const,
});

const ChoreCard = styled(Box)({
    borderRadius: '8px',
});

const ChoreTitleText = styled(Typography)({
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 500,
});

const ChoreMeta = styled(Box)(({ theme }) => ({
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
}));

const FrequencySpan = styled('span')({
    textTransform: 'capitalize' as const,
});

const EmptyStateBox = styled(Box)(({ theme }) => ({
    borderRadius: Number(theme.shape.borderRadius) * 3,
    textAlign: 'center' as const,
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
}));

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
                        <PageTitle variant="h6">Chores</PageTitle>
                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Fab color="primary" size="small" aria-label="New Chore">
                                    <Plus className="size-4" />
                                </Fab>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Chore</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Input
                                            label="Title"
                                            value={createForm.data.title}
                                            onChange={(e) => createForm.setData('title', e.target.value)}
                                            placeholder="Chore name"
                                            required
                                        />
                                        <InputError message={createForm.errors.title} />
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Input
                                            label="Description"
                                            value={createForm.data.description}
                                            onChange={(e) => createForm.setData('description', e.target.value)}
                                            placeholder="Optional"
                                        />
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                        <Box sx={{ display: 'grid', gap: 1 }}>
                                            <Select
                                                label="Frequency"
                                                value={createForm.data.frequency}
                                                onValueChange={(v) => createForm.setData('frequency', v)}
                                            >
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
                                            <DateTimeInput
                                                label="Next Due"
                                                value={createForm.data.next_due_date}
                                                onChange={(value) => createForm.setData('next_due_date', value?.format('YYYY-MM-DDTHH:mm') ?? '')}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <SectionLabel variant="body2">Assign To</SectionLabel>
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
                                            <SectionLabel variant="body2">Reminder</SectionLabel>
                                            <Switch
                                                id="create-chore-reminder-enabled"
                                                checked={createForm.data.reminder_enabled}
                                                onCheckedChange={(v) => createForm.setData('reminder_enabled', v)}
                                            />
                                        </Box>
                                        {createForm.data.reminder_enabled && (
                                            <Box sx={{ display: 'grid', gap: 1 }}>
                                                <Select
                                                    label="Send reminder"
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
                                    <Button type="submit" sx={{ width: '100%' }} disabled={createForm.processing}>
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
                                <MemberToggleButton
                                    key={member.id}
                                    type="button"
                                    onClick={() => toggleMember(member.id)}
                                    sx={{ gap: 0.75, px: 1.25, py: 0.5 }}
                                    style={{
                                        borderColor: color,
                                        color: hidden ? undefined : color,
                                        backgroundColor: hidden ? undefined : `${color}15`,
                                        opacity: hidden ? 0.4 : 1,
                                    }}
                                    aria-pressed={!hidden}
                                    title={hidden ? `Show ${member.name}` : `Hide ${member.name}`}
                                >
                                    {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                                    {member.name}
                                </MemberToggleButton>
                            );
                        })}
                        {/* Unassigned toggle */}
                        <MemberToggleButton
                            type="button"
                            onClick={() => toggleMember(UNASSIGNED_ID)}
                            sx={{ gap: 0.75, px: 1.25, py: 0.5 }}
                            style={{
                                borderColor: '#94a3b8',
                                color: hiddenMembers.has(UNASSIGNED_ID) ? undefined : '#94a3b8',
                                backgroundColor: hiddenMembers.has(UNASSIGNED_ID) ? undefined : '#94a3b815',
                                opacity: hiddenMembers.has(UNASSIGNED_ID) ? 0.4 : 1,
                            }}
                            aria-pressed={!hiddenMembers.has(UNASSIGNED_ID)}
                            title={hiddenMembers.has(UNASSIGNED_ID) ? 'Show Unassigned' : 'Hide Unassigned'}
                        >
                            {hiddenMembers.has(UNASSIGNED_ID) ? <EyeOff size={12} /> : <Eye size={12} />}
                            Unassigned
                        </MemberToggleButton>
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
                                                <MemberAvatar style={{ backgroundColor: color }} aria-label={member.name}>
                                                    {getInitials(member.name)}
                                                </MemberAvatar>
                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                    <TruncatedBold variant="body2">{member.name}</TruncatedBold>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {pending} chore{pending !== 1 ? 's' : ''}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Column items */}
                                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75, overflowY: 'auto', p: 1 }}>
                                            {memberChores.length === 0 ? (
                                                <EmptyColumnCaption variant="caption" color="text.secondary" sx={{ py: 3, display: 'block' }}>
                                                    No chores
                                                </EmptyColumnCaption>
                                            ) : (
                                                memberChores.map((chore) => (
                                                    <ChoreCard
                                                        key={chore.id}
                                                        sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1 }}
                                                        style={{
                                                            backgroundColor: `${color}15`,
                                                            border: `1px solid ${color}`,
                                                        }}
                                                    >
                                                        <Box sx={{ mt: 0.25, flexShrink: 0 }}>
                                                            <RefreshCw size={14} style={{ color: 'var(--mui-palette-success-main)' }} />
                                                        </Box>
                                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                                            <ChoreTitleText variant="caption">{chore.title}</ChoreTitleText>
                                                            <ChoreMeta sx={{ mt: 0.25, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                <FrequencySpan>{chore.frequency}</FrequencySpan>
                                                                {chore.next_due_date && <span>&middot; {formatDateTime(chore.next_due_date)}</span>}
                                                            </ChoreMeta>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', flexShrink: 0, gap: 0.25 }}>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                sx={{ width: 24, height: 24, minWidth: 24 }}
                                                                onClick={() => markComplete(chore)}
                                                                title="Mark complete"
                                                            >
                                                                <CheckCircle size={20} style={{ color: 'var(--mui-palette-success-main)' }} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                sx={{ width: 24, height: 24, minWidth: 24 }}
                                                                onClick={() => openEdit(chore)}
                                                            >
                                                                <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                    />
                                                                </svg>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                sx={{ width: 24, height: 24, minWidth: 24 }}
                                                                onClick={() => deleteChore(chore)}
                                                            >
                                                                <Trash2 size={20} style={{ color: 'var(--mui-palette-error-main)' }} />
                                                            </Button>
                                                        </Box>
                                                    </ChoreCard>
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
                                            <MemberAvatar style={{ backgroundColor: '#94a3b8' }}>?</MemberAvatar>
                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <TruncatedBold variant="body2">Unassigned</TruncatedBold>
                                                <Typography variant="caption" color="text.secondary">
                                                    {columns.unassigned.length} chore{columns.unassigned.length !== 1 ? 's' : ''}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75, overflowY: 'auto', p: 1 }}>
                                        {columns.unassigned.map((chore) => (
                                            <ChoreCard
                                                key={chore.id}
                                                sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1 }}
                                                style={{ backgroundColor: '#94a3b815', border: '1px solid #94a3b8' }}
                                            >
                                                <Box sx={{ mt: 0.25, flexShrink: 0 }}>
                                                    <RefreshCw size={14} style={{ color: 'var(--mui-palette-text-secondary)' }} />
                                                </Box>
                                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                                    <ChoreTitleText variant="caption">{chore.title}</ChoreTitleText>
                                                    <ChoreMeta sx={{ mt: 0.25, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        <FrequencySpan>{chore.frequency}</FrequencySpan>
                                                        {chore.next_due_date && <span>&middot; {formatDateTime(chore.next_due_date)}</span>}
                                                    </ChoreMeta>
                                                </Box>
                                                <Box sx={{ display: 'flex', flexShrink: 0, gap: 0.25 }}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        sx={{ width: 24, height: 24, minWidth: 24 }}
                                                        onClick={() => markComplete(chore)}
                                                        title="Mark complete"
                                                    >
                                                        <CheckCircle size={12} style={{ color: 'var(--mui-palette-success-main)' }} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        sx={{ width: 24, height: 24, minWidth: 24 }}
                                                        onClick={() => openEdit(chore)}
                                                    >
                                                        <svg width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        sx={{ width: 24, height: 24, minWidth: 24 }}
                                                        onClick={() => deleteChore(chore)}
                                                    >
                                                        <Trash2 size={12} style={{ color: 'var(--mui-palette-error-main)' }} />
                                                    </Button>
                                                </Box>
                                            </ChoreCard>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* All hidden state */}
                            {visibleAssigned.length === 0 && (!unassignedVisible || columns.unassigned.length === 0) && (
                                <EmptyStateBox
                                    sx={{
                                        width: '100%',
                                        border: 1,
                                        borderColor: 'divider',
                                        borderStyle: 'dashed',
                                        py: 8,
                                    }}
                                >
                                    {chores.length === 0
                                        ? 'No chores yet. Add your first one!'
                                        : 'No members visible. Toggle members above to show their chores.'}
                                </EmptyStateBox>
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
                            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Input
                                        label="Title"
                                        value={editForm.data.title}
                                        onChange={(e) => editForm.setData('title', e.target.value)}
                                        required
                                    />
                                    <InputError message={editForm.errors.title} />
                                </Box>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Input
                                        label="Description"
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                    />
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Select
                                            label="Frequency"
                                            value={editForm.data.frequency}
                                            onValueChange={(v) => editForm.setData('frequency', v)}
                                        >
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
                                        <DateTimeInput
                                            label="Next Due"
                                            value={editForm.data.next_due_date}
                                            onChange={(value) => editForm.setData('next_due_date', value?.format('YYYY-MM-DDTHH:mm') ?? '')}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <SectionLabel variant="body2">Assign To</SectionLabel>
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
                                <Button type="submit" sx={{ width: '100%' }} disabled={editForm.processing}>
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
