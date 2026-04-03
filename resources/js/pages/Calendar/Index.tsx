import type { DateSelectArg, DatesSetArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Head, router, useForm } from '@inertiajs/react';
import { Fab } from '@mui/material';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import MuiCheckbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { FamilyScheduleView } from '@/components/Calendar/FamilyScheduleView';
import { getMemberColor } from '@/components/Calendar/MemberColumn';
import ScheduleUploadModal from '@/components/Calendar/ScheduleUploadModal';
import { StyledFullCalendar } from '@/components/Calendar/StyledFullCalendar';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WeatherStrip from '@/components/WeatherStrip';
import AppLayout from '@/layouts/AppLayout';
import { calendarNavAriaLabel, calendarViewLabel, navigateCalendar } from '@/lib/calendarNav';
import type { CalendarViewType } from '@/lib/calendarNav';
import { getProfileColor } from '@/lib/utils';
import type { BreadcrumbItem, CalendarEvent, Chore, Todo, User } from '@/types';
import { destroy, move, store, update } from '@/actions/App/Http/Controllers/CalendarEventController';
import { update as updateChore } from '@/actions/App/Http/Controllers/ChoreController';
import { update as updateTodo } from '@/actions/App/Http/Controllers/TodoController';

interface Props {
    events: CalendarEvent[];
    todos: Todo[];
    chores: Chore[];
    members: User[];
    initialView?: string;
    initialDate?: string;
}

const VIEW_OPTIONS: { value: CalendarViewType; label: string }[] = [
    { value: 'family', label: 'Family' },
    { value: 'dayGridMonth', label: 'Month' },
    { value: 'timeGridWeek', label: 'Week' },
    { value: 'timeGridDay', label: 'Day' },
    { value: 'listWeek', label: 'Schedule' },
];

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Calendar', href: '/calendar' }];

function localToday(): string {
    const d = new Date();

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarIndex({ events, todos, chores, members, initialView, initialDate }: Props) {
    const [calendarView, setCalendarView] = useState<CalendarViewType>((initialView as CalendarViewType) ?? 'family');
    const [selectedDate, setSelectedDate] = useState<string>(initialDate ?? localToday());
    const [hiddenMembers, setHiddenMembers] = useState<Set<number>>(new Set());
    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [fabMenuAnchor, setFabMenuAnchor] = useState<HTMLElement | null>(null);
    const [editEventOpen, setEditEventOpen] = useState(false);
    const [editTodoOpen, setEditTodoOpen] = useState(false);
    const [editChoreOpen, setEditChoreOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
    const [selectedChore, setSelectedChore] = useState<Chore | null>(null);

    function navigate(direction: 'prev' | 'next') {
        setSelectedDate(navigateCalendar(selectedDate, direction, calendarView));
    }

    function navAriaLabel(direction: 'prev' | 'next'): string {
        return calendarNavAriaLabel(direction, calendarView);
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

    const MemberToggle = styled(ButtonBase)({
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
    });

    function switchView(view: CalendarViewType) {
        setCalendarView(view);
    }

    const createForm = useForm({
        title: '',
        description: '',
        location: '',
        start_at: '',
        end_at: '',
        recurrence: '',
        color: '#6366f1',
        attendee_ids: [] as string[],
    });

    /** When attendees change in the create form, auto-apply the sole attendee's profile colour. */
    function handleCreateAttendeesChange(ids: string[]) {
        let color = createForm.data.color;

        if (ids.length === 1) {
            const member = members.find((m) => String(m.id) === ids[0]);
            const memberColor = getProfileColor(member);

            if (memberColor) {
                color = memberColor;
            }
        }

        createForm.setData({ ...createForm.data, attendee_ids: ids, color });
    }

    const editEventForm = useForm<{
        title: string;
        description: string;
        location: string;
        start_at: string;
        end_at: string;
        recurrence: string;
        color: string;
        attendee_ids: string[];
    }>({
        title: '',
        description: '',
        location: '',
        start_at: '',
        end_at: '',
        recurrence: '',
        color: '#6366f1',
        attendee_ids: [],
    });
    const editTodoForm = useForm<{
        title: string;
        status: string;
        priority: string;
        category: string;
        due_date: string;
        assigned_to: string;
    }>({
        title: '',
        status: '',
        priority: '',
        category: '',
        due_date: '',
        assigned_to: '',
    });
    const editChoreForm = useForm<{
        title: string;
        frequency: string;
        next_due_date: string;
        assignee_ids: string[];
    }>({
        title: '',
        frequency: '',
        next_due_date: '',
        assignee_ids: [],
    });

    const allFcEvents = useMemo(
        () => [
            ...(events ?? []).map((e) => ({
                id: `event-${e.id}`,
                title: e.title,
                start: e.start_at,
                end: e.end_at ?? undefined,
                allDay: e.is_all_day,
                backgroundColor: e.color ?? '#6366f1',
                borderColor: e.color ?? '#6366f1',
                textColor: '#ffffff',
                editable: true,
                extendedProps: { type: 'event', source: e },
                display: 'block',
            })),
            ...(todos ?? [])
                .filter((t) => t.due_date)
                .map((t) => ({
                    id: `todo-${t.id}`,
                    title: `☑ ${t.title}`,
                    start: t.due_date!,
                    backgroundColor: t.status === 'completed' ? '#9ca3af' : '#f59e0b',
                    borderColor: t.status === 'completed' ? '#9ca3af' : '#f59e0b',
                    textColor: '#ffffff',
                    editable: false,
                    extendedProps: { type: 'todo', source: t },
                    display: 'block',
                })),
            ...(chores ?? [])
                .filter((c) => c.next_due_date)
                .map((c) => ({
                    id: `chore-${c.id}`,
                    title: `↺ ${c.title}`,
                    start: c.next_due_date!,
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                    textColor: '#ffffff',
                    editable: false,
                    extendedProps: { type: 'chore', source: c },
                    display: 'block',
                })),
        ],
        [events, todos, chores],
    );

    function handleDateSelect(info: DateSelectArg) {
        createForm.setData({ ...createForm.data, start_at: info.startStr.slice(0, 16), end_at: info.endStr ? info.endStr.slice(0, 16) : '' });
        setCreateOpen(true);
    }

    function handleEventClick(info: EventClickArg) {
        const { type, source } = info.event.extendedProps;

        if (type === 'event') {
            const e = source as CalendarEvent;
            setSelectedEvent(e);
            editEventForm.setData('title', e.title);
            editEventForm.setData('description', e.description ?? '');
            editEventForm.setData('location', e.location ?? '');
            editEventForm.setData('start_at', e.start_at.slice(0, 16));
            editEventForm.setData('end_at', e.end_at?.slice(0, 16) ?? '');
            editEventForm.setData('recurrence', e.recurrence ?? '');
            editEventForm.setData('color', e.color ?? '#6366f1');
            editEventForm.setData('attendee_ids', e.attendees?.map((a) => String(a.id)) ?? []);
            setEditEventOpen(true);
        } else if (type === 'todo') {
            const t = source as Todo;
            setSelectedTodo(t);
            editTodoForm.setData('title', t.title);
            editTodoForm.setData('status', t.status);
            editTodoForm.setData('priority', t.priority);
            editTodoForm.setData('category', t.category);
            editTodoForm.setData('due_date', t.due_date ?? '');
            editTodoForm.setData('assigned_to', String(t.assignee?.id ?? ''));
            setEditTodoOpen(true);
        } else if (type === 'chore') {
            const c = source as Chore;
            setSelectedChore(c);
            editChoreForm.setData({
                title: c.title,
                frequency: c.frequency ?? '',
                next_due_date: c.next_due_date ?? '',
                assignee_ids: c.assignees?.map((a) => String(a.id)) ?? [],
            });
            setEditChoreOpen(true);
        }
    }

    function handleEventDrop(info: EventDropArg) {
        if (info.event.extendedProps.type !== 'event') {
            info.revert();

            return;
        }

        router.patch(
            move(info.event.extendedProps.source.id).url,
            { start_at: info.event.startStr, end_at: info.event.endStr || null },
            { preserveState: true, preserveScroll: true },
        );
    }

    function handleEventResize(info: EventResizeDoneArg) {
        router.patch(
            move(info.event.extendedProps.source.id).url,
            { start_at: info.event.startStr, end_at: info.event.endStr },
            { preserveState: true, preserveScroll: true },
        );
    }

    function handleDatesSet(info: DatesSetArg) {
        setSelectedDate(info.startStr.split('T')[0]);
    }

    function deleteCurrentEvent() {
        if (!selectedEvent) {
            return;
        }

        if (!confirm('Delete this event?')) {
            return;
        }

        setEditEventOpen(false);
        router.delete(destroy(selectedEvent.id).url);
    }

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post(store().url, { onSuccess: () => setCreateOpen(false) });
    }

    function handleEditEvent(e: React.FormEvent) {
        e.preventDefault();

        if (!selectedEvent) {
            return;
        }

        editEventForm.patch(update(selectedEvent.id).url, { onSuccess: () => setEditEventOpen(false) });
    }

    function handleEditTodo(e: React.FormEvent) {
        e.preventDefault();

        if (!selectedTodo) {
            return;
        }

        editTodoForm.patch(updateTodo(selectedTodo.id).url, { onSuccess: () => setEditTodoOpen(false) });
    }

    function handleEditChore(e: React.FormEvent) {
        e.preventDefault();

        if (!selectedChore) {
            return;
        }

        editChoreForm.patch(updateChore(selectedChore.id).url, { onSuccess: () => setEditChoreOpen(false) });
    }

    const handleFamilyEventClick = useCallback(
        (event: CalendarEvent) => {
            setSelectedEvent(event);
            editEventForm.setData('title', event.title);
            editEventForm.setData('description', event.description ?? '');
            editEventForm.setData('location', event.location ?? '');
            editEventForm.setData('start_at', event.start_at.slice(0, 16));
            editEventForm.setData('end_at', event.end_at?.slice(0, 16) ?? '');
            editEventForm.setData('recurrence', event.recurrence ?? '');
            editEventForm.setData('color', event.color ?? '#6366f1');
            editEventForm.setData('attendee_ids', event.attendees?.map((a) => String(a.id)) ?? []);
            setEditEventOpen(true);
        },
        [editEventForm],
    );

    const handleFamilyTodoClick = useCallback(
        (todo: Todo) => {
            setSelectedTodo(todo);
            editTodoForm.setData({
                title: todo.title,
                status: todo.status,
                priority: todo.priority,
                category: todo.category,
                due_date: todo.due_date ?? '',
                assigned_to: String(todo.assignee?.id ?? ''),
            });
            setEditTodoOpen(true);
        },
        [editTodoForm],
    );

    const handleFamilyChoreClick = useCallback(
        (chore: Chore) => {
            setSelectedChore(chore);
            editChoreForm.setData({
                title: chore.title,
                frequency: chore.frequency ?? '',
                next_due_date: chore.next_due_date ?? '',
                assignee_ids: chore.assignees?.map((a) => String(a.id)) ?? [],
            });
            setEditChoreOpen(true);
        },
        [editChoreForm],
    );

    const viewLabel = useMemo(() => calendarViewLabel(selectedDate, calendarView), [calendarView, selectedDate]);

    return (
        <>
            <Head title="Calendar" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
                    {/* Top bar: date + weather (left) | view select + add (right) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography variant="h5">{viewLabel}</Typography>
                            <WeatherStrip />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Fab sx={{ ml: 2 }} color="primary" aria-label="Add event or import" onClick={(e) => setFabMenuAnchor(e.currentTarget)}>
                                <Plus size={18} />
                            </Fab>
                        </Box>
                    </Box>

                    {/* Date navigation and member toggles (always visible) */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Button variant="outline" size="icon" onClick={() => navigate('prev')} aria-label={navAriaLabel('prev')}>
                                <ChevronLeft style={{ width: 16, height: 16 }} />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedDate(localToday())}>
                                Today
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => navigate('next')} aria-label={navAriaLabel('next')}>
                                <ChevronRight style={{ width: 16, height: 16 }} />
                            </Button>
                        </Box>
                        <DateTimeInput
                            type="date"
                            label="Selected Date"
                            value={dayjs(selectedDate)}
                            onChange={(value) => setSelectedDate(value?.format('YYYY-MM-DD') ?? '')}
                            slotProps={{ textField: { size: 'small', inputProps: { 'aria-label': 'Select date' }, color: 'primary' } }}
                        />
                        <Box>
                            <Select value={calendarView} onValueChange={(v) => switchView(v as CalendarViewType)} label="View">
                                <SelectTrigger aria-label="Calendar view">
                                    <SelectValue placeholder="View" />
                                </SelectTrigger>
                                <SelectContent>
                                    {VIEW_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Box>
                        {/* Member toggles */}
                        <Box sx={{ ml: 'auto', display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {members.map((member, idx) => {
                                const color = getMemberColor(member, idx);
                                const hidden = hiddenMembers.has(member.id);

                                return (
                                    <MemberToggle
                                        key={member.id}
                                        onClick={() => toggleMember(member.id)}
                                        aria-pressed={!hidden}
                                        title={hidden ? `Show ${member.name}` : `Hide ${member.name}`}
                                        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5 }}
                                        style={{
                                            opacity: hidden ? 0.4 : 1,
                                            color: hidden ? 'inherit' : color,
                                            backgroundColor: hidden ? 'transparent' : `${color}15`,
                                            border: `1px solid ${color}`,
                                        }}
                                    >
                                        {hidden ? <EyeOff style={{ width: 12, height: 12 }} /> : <Eye style={{ width: 12, height: 12 }} />}
                                        {member.name}
                                    </MemberToggle>
                                );
                            })}
                        </Box>
                    </Box>

                    {calendarView === 'family' ? (
                        <FamilyScheduleView
                            members={members}
                            events={events}
                            todos={todos}
                            chores={chores}
                            selectedDate={selectedDate}
                            hiddenMembers={hiddenMembers}
                            toggleMember={toggleMember}
                            onEventClick={handleFamilyEventClick}
                            onTodoClick={handleFamilyTodoClick}
                            onChoreClick={handleFamilyChoreClick}
                        />
                    ) : (
                        <StyledFullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                            initialView={calendarView}
                            view={calendarView}
                            selectedDate={selectedDate}
                            events={allFcEvents}
                            select={handleDateSelect}
                            eventClick={handleEventClick}
                            eventDrop={handleEventDrop}
                            eventResize={handleEventResize}
                            datesSet={handleDatesSet}
                            editable
                            selectable
                            selectMirror
                            dayMaxEvents
                            nowIndicator
                            height="auto"
                        />
                    )}
                </Box>

                {/* Create Event */}
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Event</DialogTitle>
                        </DialogHeader>
                        <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'grid', gap: 1 }}>
                                <Input
                                    label="Title"
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    placeholder="Event name"
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
                            <Box sx={{ display: 'grid', gap: 1 }}>
                                <Input
                                    label="Location"
                                    value={createForm.data.location}
                                    onChange={(e) => createForm.setData('location', e.target.value)}
                                    placeholder="Optional"
                                />
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <DateTimeInput
                                        label="Start"
                                        value={createForm.data.start_at ? dayjs(createForm.data.start_at) : null}
                                        onChange={(value) => createForm.setData('start_at', value?.format('YYYY-MM-DDTHH:mm') ?? '')}
                                        slotProps={{ textField: { required: true, size: 'small' } }}
                                    />
                                    <InputError message={createForm.errors.start_at} />
                                </Box>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <DateTimeInput
                                        label="End"
                                        value={createForm.data.end_at ? dayjs(createForm.data.end_at) : null}
                                        onChange={(value) => createForm.setData('end_at', value?.format('YYYY-MM-DDTHH:mm') ?? '')}
                                        slotProps={{ textField: { size: 'small' } }}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Select
                                        label="Recurrence"
                                        value={createForm.data.recurrence}
                                        onValueChange={(v) => createForm.setData('recurrence', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">None</SelectItem>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Box>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Input
                                        label="Colour"
                                        type="color"
                                        value={createForm.data.color}
                                        onChange={(e) => createForm.setData('color', e.target.value)}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'grid', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Attendees
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {members.map((m) => (
                                        <FormControlLabel
                                            key={m.id}
                                            control={
                                                <MuiCheckbox
                                                    id={`create-attendee-${m.id}`}
                                                    checked={createForm.data.attendee_ids.includes(String(m.id))}
                                                    onChange={(e) => {
                                                        const id = String(m.id);
                                                        const next = e.target.checked
                                                            ? [...createForm.data.attendee_ids, id]
                                                            : createForm.data.attendee_ids.filter((x) => x !== id);
                                                        handleCreateAttendeesChange(next);
                                                    }}
                                                    size="small"
                                                />
                                            }
                                            label={m.name}
                                        />
                                    ))}
                                </Box>
                            </Box>
                            <Button type="submit" sx={{ width: '100%' }} disabled={createForm.processing}>
                                {createForm.processing ? 'Creating…' : 'Create Event'}
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>

                {/* Edit Event */}
                <Dialog open={editEventOpen} onOpenChange={setEditEventOpen}>
                    <DialogContent sx={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <DialogHeader>
                            <DialogTitle>Edit Event</DialogTitle>
                        </DialogHeader>
                        {selectedEvent && (
                            <Box component="form" onSubmit={handleEditEvent} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Input
                                        label="Title"
                                        value={editEventForm.data.title}
                                        onChange={(e) => editEventForm.setData('title', e.target.value)}
                                        required
                                    />
                                    <InputError message={editEventForm.errors.title} />
                                </Box>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Input
                                        label="Description"
                                        value={editEventForm.data.description}
                                        onChange={(e) => editEventForm.setData('description', e.target.value)}
                                    />
                                </Box>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Input
                                        label="Location"
                                        value={editEventForm.data.location}
                                        onChange={(e) => editEventForm.setData('location', e.target.value)}
                                    />
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <DateTimeInput
                                            label="Start"
                                            value={editEventForm.data.start_at ? dayjs(editEventForm.data.start_at) : null}
                                            onChange={(value) => editEventForm.setData('start_at', value?.format('YYYY-MM-DDTHH:mm') ?? '')}
                                            slotProps={{ textField: { required: true } }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <DateTimeInput
                                            label="End"
                                            value={editEventForm.data.end_at ? dayjs(editEventForm.data.end_at) : null}
                                            onChange={(value) => editEventForm.setData('end_at', value?.format('YYYY-MM-DDTHH:mm') ?? '')}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Select
                                            label="Recurrence"
                                            value={editEventForm.data.recurrence}
                                            onValueChange={(v) => editEventForm.setData('recurrence', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="None" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">None</SelectItem>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            Colour
                                        </Typography>
                                        <Input
                                            type="color"
                                            value={editEventForm.data.color}
                                            onChange={(e) => editEventForm.setData('color', e.target.value)}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Attendees
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        {members.map((m) => (
                                            <FormControlLabel
                                                key={m.id}
                                                control={
                                                    <MuiCheckbox
                                                        id={`edit-attendee-${m.id}`}
                                                        checked={editEventForm.data.attendee_ids.includes(String(m.id))}
                                                        onChange={(e) => {
                                                            const id = String(m.id);
                                                            const next = e.target.checked
                                                                ? [...editEventForm.data.attendee_ids, id]
                                                                : editEventForm.data.attendee_ids.filter((x) => x !== id);
                                                            editEventForm.setData('attendee_ids', next);
                                                        }}
                                                        size="small"
                                                    />
                                                }
                                                label={m.name}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button type="submit" sx={{ flex: 1 }} disabled={editEventForm.processing}>
                                        {editEventForm.processing ? 'Saving…' : 'Save Changes'}
                                    </Button>
                                    <Button type="button" variant="destructive" size="icon" onClick={deleteCurrentEvent}>
                                        <Trash2 size={16} />
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit Todo (from calendar) */}
                <Dialog open={editTodoOpen} onOpenChange={setEditTodoOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Todo</DialogTitle>
                        </DialogHeader>
                        {selectedTodo && (
                            <Box component="form" onSubmit={handleEditTodo} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Input
                                        label="Title"
                                        value={editTodoForm.data.title}
                                        onChange={(e) => editTodoForm.setData('title', e.target.value)}
                                        required
                                    />
                                    <InputError message={editTodoForm.errors.title} />
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Select
                                            label="Status"
                                            value={editTodoForm.data.status}
                                            onValueChange={(v) => editTodoForm.setData('status', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Select
                                            label="Priority"
                                            value={editTodoForm.data.priority}
                                            onValueChange={(v) => editTodoForm.setData('priority', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Priority" />
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
                                        <Input
                                            label="Category"
                                            value={editTodoForm.data.category}
                                            onChange={(e) => editTodoForm.setData('category', e.target.value)}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <DateTimeInput
                                            label="Due Date & Time"
                                            value={editTodoForm.data.due_date ? dayjs(editTodoForm.data.due_date) : null}
                                            onChange={(value) => editTodoForm.setData('due_date', value?.format('YYYY-MM-DDTHH:mm') ?? '')}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Select
                                        label="Assign To"
                                        value={editTodoForm.data.assigned_to}
                                        onValueChange={(v) => editTodoForm.setData('assigned_to', v)}
                                    >
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
                                <Button type="submit" sx={{ width: '100%' }} disabled={editTodoForm.processing}>
                                    {editTodoForm.processing ? 'Saving…' : 'Save Todo'}
                                </Button>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit Chore (from calendar) */}
                <Dialog open={editChoreOpen} onOpenChange={setEditChoreOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Chore</DialogTitle>
                        </DialogHeader>
                        {selectedChore && (
                            <Box component="form" onSubmit={handleEditChore} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Input
                                        label="Title"
                                        value={editChoreForm.data.title}
                                        onChange={(e) => editChoreForm.setData('title', e.target.value)}
                                        required
                                    />
                                    <InputError message={editChoreForm.errors.title} />
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Select
                                            label="Frequency"
                                            value={editChoreForm.data.frequency}
                                            onValueChange={(v) => editChoreForm.setData('frequency', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Frequency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="as_needed">As Needed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Box>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <DateTimeInput
                                            label="Next Due"
                                            type="date"
                                            value={editChoreForm.data.next_due_date ? dayjs(editChoreForm.data.next_due_date) : null}
                                            onChange={(value) => editChoreForm.setData('next_due_date', value?.format('YYYY-MM-DD') ?? '')}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Assign To
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        {members.map((m) => (
                                            <FormControlLabel
                                                key={m.id}
                                                control={
                                                    <MuiCheckbox
                                                        id={`assignee-${m.id}`}
                                                        checked={editChoreForm.data.assignee_ids.includes(String(m.id))}
                                                        onChange={(e) => {
                                                            const id = String(m.id);
                                                            const next = e.target.checked
                                                                ? [...editChoreForm.data.assignee_ids, id]
                                                                : editChoreForm.data.assignee_ids.filter((x) => x !== id);
                                                            editChoreForm.setData('assignee_ids', next);
                                                        }}
                                                        size="small"
                                                    />
                                                }
                                                label={m.name}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                                <Button type="submit" sx={{ width: '100%' }} disabled={editChoreForm.processing}>
                                    {editChoreForm.processing ? 'Saving…' : 'Save Chore'}
                                </Button>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Import Schedule Modal */}
                <ScheduleUploadModal open={importOpen} onOpenChange={setImportOpen} />

                {/* Add menu (triggered by toolbar icon button) */}
                <Menu
                    anchorEl={fabMenuAnchor}
                    open={Boolean(fabMenuAnchor)}
                    onClose={() => setFabMenuAnchor(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    slotProps={{ paper: { sx: { minWidth: 180, borderRadius: 2 } } }}
                >
                    <MenuItem
                        onClick={() => {
                            setFabMenuAnchor(null);
                            createForm.setData({ ...createForm.data, start_at: '', end_at: '' });
                            setCreateOpen(true);
                        }}
                    >
                        <ListItemIcon>
                            <Plus size={18} />
                        </ListItemIcon>
                        <ListItemText>New Event</ListItemText>
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setFabMenuAnchor(null);
                            setImportOpen(true);
                        }}
                    >
                        <ListItemIcon>
                            <CalendarDays size={18} />
                        </ListItemIcon>
                        <ListItemText>Import Schedule</ListItemText>
                    </MenuItem>
                </Menu>
            </AppLayout>
        </>
    );
}
