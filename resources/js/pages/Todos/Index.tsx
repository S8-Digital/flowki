import { Head, router, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';

import Typography from '@mui/material/Typography';
import { CheckCircle2, Circle, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { destroy, store, update } from '@/actions/App/Http/Controllers/TodoController';
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Todos
                        </Typography>
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
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={createForm.data.title}
                                            onChange={(e) => createForm.setData('title', e.target.value)}
                                            placeholder="What needs doing?"
                                            required
                                        />
                                        <InputError message={createForm.errors.title} />
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Label>Description</Label>
                                        <Input
                                            value={createForm.data.description}
                                            onChange={(e) => createForm.setData('description', e.target.value)}
                                            placeholder="Optional details"
                                        />
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                        <Box sx={{ display: 'grid', gap: 1 }}>
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
                                        </Box>
                                        <Box sx={{ display: 'grid', gap: 1 }}>
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
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                        <Box sx={{ display: 'grid', gap: 1 }}>
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
                                        </Box>
                                        <Box sx={{ display: 'grid', gap: 1 }}>
                                            <Label>Due Date &amp; Time</Label>
                                            <DateTimeInput
                                                value={createForm.data.due_date}
                                                onChange={(e) => createForm.setData('due_date', e.target.value)}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
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
                                            <Label htmlFor="create-reminder-enabled" className="cursor-pointer">
                                                Reminder
                                            </Label>
                                            <Switch
                                                id="create-reminder-enabled"
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
                                        {createForm.processing ? 'Creating…' : 'Create Todo'}
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
                    {!todos || !columns ? (
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
                            {visibleAssigned.map(({ member, idx, todos: memberTodos, pending, done }) => {
                                const color = getMemberColor(member, idx);
                                const total = memberTodos.length;
                                const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

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
                                                        {pending} pending &middot; {done} done
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {total > 0 && (
                                                <Box sx={{ mt: 0.5 }}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            fontSize: '0.75rem',
                                                            color: 'text.secondary',
                                                        }}
                                                    >
                                                        <span>{done} done</span>
                                                        <span>{completionPct}%</span>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            mt: 0.5,
                                                            height: 6,
                                                            width: '100%',
                                                            overflow: 'hidden',
                                                            borderRadius: '50px',
                                                            bgcolor: 'action.hover',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{ height: '100%', borderRadius: '50px', transition: 'all 0.3s' }}
                                                            style={{ width: `${completionPct}%`, backgroundColor: color }}
                                                        />
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Column items */}
                                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75, overflowY: 'auto', p: 1 }}>
                                            {memberTodos.length === 0 ? (
                                                <Typography
                                                    variant="caption"
                                                    sx={{ py: 3, textAlign: 'center', color: 'text.secondary', display: 'block' }}
                                                >
                                                    No todos
                                                </Typography>
                                            ) : (
                                                memberTodos.map((todo) => (
                                                    <Box
                                                        key={todo.id}
                                                        sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, borderRadius: '8px', p: 1 }}
                                                        style={{
                                                            backgroundColor: todo.status === 'completed' ? '#9ca3af22' : `${color}15`,
                                                            borderLeft: `3px solid ${todo.status === 'completed' ? '#9ca3af' : color}`,
                                                        }}
                                                    >
                                                        <Box sx={{ mt: 0.25, flexShrink: 0 }}>
                                                            {todo.status === 'completed' ? (
                                                                <CheckCircle2 className="size-3.5 text-muted-foreground" />
                                                            ) : (
                                                                <Circle className="size-3.5 text-amber-500" />
                                                            )}
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
                                                                    ...(todo.status === 'completed'
                                                                        ? { color: 'text.secondary', textDecoration: 'line-through' }
                                                                        : {}),
                                                                }}
                                                            >
                                                                {todo.title}
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
                                                                <Typography
                                                                    component="span"
                                                                    variant="caption"
                                                                    sx={{
                                                                        fontWeight: 500,
                                                                        textTransform: 'capitalize',
                                                                        color:
                                                                            (
                                                                                {
                                                                                    low: 'success.main',
                                                                                    medium: 'warning.main',
                                                                                    high: 'error.main',
                                                                                } as Record<string, string>
                                                                            )[todo.priority] ?? 'inherit',
                                                                    }}
                                                                >
                                                                    {todo.priority}
                                                                </Typography>
                                                                {todo.due_date && <span>&middot; {formatDateTime(todo.due_date)}</span>}
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', flexShrink: 0, gap: 0.25 }}>
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
                                                    {columns.unassigned.filter((t) => t.status !== 'completed').length} pending &middot;{' '}
                                                    {columns.unassigned.filter((t) => t.status === 'completed').length} done
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75, overflowY: 'auto', p: 1 }}>
                                        {columns.unassigned.map((todo) => (
                                            <Box
                                                key={todo.id}
                                                sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, borderRadius: '8px', p: 1 }}
                                                style={{
                                                    backgroundColor: todo.status === 'completed' ? '#9ca3af22' : '#94a3b815',
                                                    borderLeft: `3px solid ${todo.status === 'completed' ? '#9ca3af' : '#94a3b8'}`,
                                                }}
                                            >
                                                <Box sx={{ mt: 0.25, flexShrink: 0 }}>
                                                    {todo.status === 'completed' ? (
                                                        <CheckCircle2 className="size-3.5 text-muted-foreground" />
                                                    ) : (
                                                        <Circle className="size-3.5 text-slate-400" />
                                                    )}
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
                                                            ...(todo.status === 'completed'
                                                                ? { color: 'text.secondary', textDecoration: 'line-through' }
                                                                : {}),
                                                        }}
                                                    >
                                                        {todo.title}
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
                                                        <Typography
                                                            component="span"
                                                            variant="caption"
                                                            sx={{
                                                                fontWeight: 500,
                                                                textTransform: 'capitalize',
                                                                color:
                                                                    (
                                                                        { low: 'success.main', medium: 'warning.main', high: 'error.main' } as Record<
                                                                            string,
                                                                            string
                                                                        >
                                                                    )[todo.priority] ?? 'inherit',
                                                            }}
                                                        >
                                                            {todo.priority}
                                                        </Typography>
                                                        {todo.due_date && <span>&middot; {formatDateTime(todo.due_date)}</span>}
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', flexShrink: 0, gap: 0.25 }}>
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
                                    {todos.length === 0
                                        ? 'No todos yet. Create your first one!'
                                        : 'No members visible. Toggle members above to show their todos.'}
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Edit dialog */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Todo</DialogTitle>
                        </DialogHeader>
                        {editingTodo && (
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
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
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
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
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
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Label>Due Date &amp; Time</Label>
                                        <DateTimeInput
                                            value={editForm.data.due_date}
                                            onChange={(e) => editForm.setData('due_date', e.target.value)}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'grid', gap: 1 }}>
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
