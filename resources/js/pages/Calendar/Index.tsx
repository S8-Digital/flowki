import type { DateSelectArg, DatesSetArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Head, router, useForm } from '@inertiajs/react';
import MuiCheckbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { destroy, move, store, update } from '@/actions/App/Http/Controllers/CalendarEventController';
import { update as updateChore } from '@/actions/App/Http/Controllers/ChoreController';
import { update as updateTodo } from '@/actions/App/Http/Controllers/TodoController';
import FamilyScheduleView from '@/components/Calendar/FamilyScheduleView';
import ScheduleUploadModal from '@/components/Calendar/ScheduleUploadModal';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WeatherStrip from '@/components/WeatherStrip';
import AppLayout from '@/layouts/AppLayout';
import { getProfileColor } from '@/lib/utils';
import type { BreadcrumbItem, CalendarEvent, Chore, Todo, User } from '@/types';

interface Props {
    events: CalendarEvent[];
    todos: Todo[];
    chores: Chore[];
    members: User[];
    initialView?: string;
    initialDate?: string;
}

type CalendarViewType = 'family' | 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

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
    const calendarRef = useRef<FullCalendar>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [editEventOpen, setEditEventOpen] = useState(false);
    const [editTodoOpen, setEditTodoOpen] = useState(false);
    const [editChoreOpen, setEditChoreOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
    const [selectedChore, setSelectedChore] = useState<Chore | null>(null);

    function switchView(view: CalendarViewType) {
        setCalendarView(view);

        if (view !== 'family') {
            calendarRef.current?.getApi().changeView(view);
        }
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

    const editEventForm = useForm({
        title: '',
        description: '',
        location: '',
        start_at: '',
        end_at: '',
        recurrence: '',
        color: '#6366f1',
        attendee_ids: [] as string[],
    });
    const editTodoForm = useForm({ title: '', status: '', priority: '', category: '', due_date: '', assigned_to: '' });
    const editChoreForm = useForm({ title: '', frequency: '', next_due_date: '', assignee_ids: [] as string[] });

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
            editEventForm.setData({
                title: e.title,
                description: e.description ?? '',
                location: e.location ?? '',
                start_at: e.start_at.slice(0, 16),
                end_at: e.end_at?.slice(0, 16) ?? '',
                recurrence: e.recurrence ?? '',
                color: e.color ?? '#6366f1',
                attendee_ids: e.attendees?.map((a) => String(a.id)) ?? [],
            });
            setEditEventOpen(true);
        } else if (type === 'todo') {
            const t = source as Todo;
            setSelectedTodo(t);
            editTodoForm.setData({
                title: t.title,
                status: t.status,
                priority: t.priority,
                category: t.category,
                due_date: t.due_date ?? '',
                assigned_to: String(t.assignee?.id ?? ''),
            });
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
            editEventForm.setData({
                title: event.title,
                description: event.description ?? '',
                location: event.location ?? '',
                start_at: event.start_at.slice(0, 16),
                end_at: event.end_at?.slice(0, 16) ?? '',
                recurrence: event.recurrence ?? '',
                color: event.color ?? '#6366f1',
                attendee_ids: event.attendees?.map((a) => String(a.id)) ?? [],
            });
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

    return (
        <>
            <Head title="Calendar" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <WeatherStrip />
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Calendar</h1>
                        <div className="flex items-center gap-2">
                            <Select value={calendarView} onValueChange={(v) => switchView(v as CalendarViewType)}>
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
                            <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
                                <CalendarDays className="mr-1 size-4" /> Import Schedule
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    createForm.setData({ ...createForm.data, start_at: '', end_at: '' });
                                    setCreateOpen(true);
                                }}
                            >
                                <Plus className="mr-1 size-4" /> New Event
                            </Button>
                        </div>
                    </div>

                    {calendarView === 'family' ? (
                        <FamilyScheduleView
                            members={members}
                            events={events}
                            todos={todos}
                            chores={chores}
                            selectedDate={selectedDate}
                            onDateChange={setSelectedDate}
                            onEventClick={handleFamilyEventClick}
                            onTodoClick={handleFamilyTodoClick}
                            onChoreClick={handleFamilyChoreClick}
                        />
                    ) : (
                        <div className="rounded-xl border p-2">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                                initialView={calendarView}
                                initialDate={selectedDate}
                                headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
                                buttonText={{ today: 'Today' }}
                                editable
                                selectable
                                selectMirror
                                dayMaxEvents
                                nowIndicator
                                height="auto"
                                events={allFcEvents}
                                select={handleDateSelect}
                                eventClick={handleEventClick}
                                eventDrop={handleEventDrop}
                                eventResize={handleEventResize}
                                datesSet={handleDatesSet}
                            />
                        </div>
                    )}
                </div>

                {/* Create Event */}
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>New Event</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Title</Label>
                                <Input
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    placeholder="Event name"
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
                            <div className="grid gap-2">
                                <Label>Location</Label>
                                <Input
                                    value={createForm.data.location}
                                    onChange={(e) => createForm.setData('location', e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label>Start</Label>
                                    <DateTimeInput
                                        value={createForm.data.start_at}
                                        onChange={(e) => createForm.setData('start_at', e.target.value)}
                                        required
                                    />
                                    <InputError message={createForm.errors.start_at} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>End</Label>
                                    <DateTimeInput value={createForm.data.end_at} onChange={(e) => createForm.setData('end_at', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label>Recurrence</Label>
                                    <Select value={createForm.data.recurrence} onValueChange={(v) => createForm.setData('recurrence', v)}>
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
                                </div>
                                <div className="grid gap-2">
                                    <Label>Colour</Label>
                                    <input
                                        type="color"
                                        value={createForm.data.color}
                                        onChange={(e) => createForm.setData('color', e.target.value)}
                                        className="h-9 w-full cursor-pointer rounded-md border border-surface bg-transparent shadow-sm ring ring-transparent transition-all duration-300 hover:border-primary hover:ring-primary/10 focus:border-primary focus:ring-primary/10 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Attendees</Label>
                                <div className="space-y-1">
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
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={createForm.processing}>
                                {createForm.processing ? 'Creating…' : 'Create Event'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Event */}
                <Dialog open={editEventOpen} onOpenChange={setEditEventOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Event</DialogTitle>
                        </DialogHeader>
                        {selectedEvent && (
                            <form onSubmit={handleEditEvent} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={editEventForm.data.title}
                                        onChange={(e) => editEventForm.setData('title', e.target.value)}
                                        required
                                    />
                                    <InputError message={editEventForm.errors.title} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={editEventForm.data.description}
                                        onChange={(e) => editEventForm.setData('description', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Location</Label>
                                    <Input value={editEventForm.data.location} onChange={(e) => editEventForm.setData('location', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <Label>Start</Label>
                                        <DateTimeInput
                                            value={editEventForm.data.start_at}
                                            onChange={(e) => editEventForm.setData('start_at', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>End</Label>
                                        <DateTimeInput
                                            value={editEventForm.data.end_at}
                                            onChange={(e) => editEventForm.setData('end_at', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <Label>Recurrence</Label>
                                        <Select value={editEventForm.data.recurrence} onValueChange={(v) => editEventForm.setData('recurrence', v)}>
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
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Colour</Label>
                                        <input
                                            type="color"
                                            value={editEventForm.data.color}
                                            onChange={(e) => editEventForm.setData('color', e.target.value)}
                                            className="h-9 w-full cursor-pointer rounded-md border border-surface bg-transparent shadow-sm ring ring-transparent transition-all duration-300 hover:border-primary hover:ring-primary/10 focus:border-primary focus:ring-primary/10 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Attendees</Label>
                                    <div className="space-y-1">
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
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" className="flex-1" disabled={editEventForm.processing}>
                                        {editEventForm.processing ? 'Saving…' : 'Save Changes'}
                                    </Button>
                                    <Button type="button" variant="destructive" size="icon" onClick={deleteCurrentEvent}>
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </form>
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
                            <form onSubmit={handleEditTodo} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Title</Label>
                                    <Input value={editTodoForm.data.title} onChange={(e) => editTodoForm.setData('title', e.target.value)} required />
                                    <InputError message={editTodoForm.errors.title} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <Label>Status</Label>
                                        <Select value={editTodoForm.data.status} onValueChange={(v) => editTodoForm.setData('status', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Priority</Label>
                                        <Select value={editTodoForm.data.priority} onValueChange={(v) => editTodoForm.setData('priority', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Priority" />
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
                                        <Label>Category</Label>
                                        <Input
                                            value={editTodoForm.data.category}
                                            onChange={(e) => editTodoForm.setData('category', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Due Date &amp; Time</Label>
                                        <DateTimeInput
                                            value={editTodoForm.data.due_date}
                                            onChange={(e) => editTodoForm.setData('due_date', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Assign To</Label>
                                    <Select value={editTodoForm.data.assigned_to} onValueChange={(v) => editTodoForm.setData('assigned_to', v)}>
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
                                <Button type="submit" className="w-full" disabled={editTodoForm.processing}>
                                    {editTodoForm.processing ? 'Saving…' : 'Save Todo'}
                                </Button>
                            </form>
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
                            <form onSubmit={handleEditChore} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={editChoreForm.data.title}
                                        onChange={(e) => editChoreForm.setData('title', e.target.value)}
                                        required
                                    />
                                    <InputError message={editChoreForm.errors.title} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <Label>Frequency</Label>
                                        <Select value={editChoreForm.data.frequency} onValueChange={(v) => editChoreForm.setData('frequency', v)}>
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
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Next Due</Label>
                                        <DateTimeInput
                                            value={editChoreForm.data.next_due_date}
                                            onChange={(e) => editChoreForm.setData('next_due_date', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Assign To</Label>
                                    <div className="space-y-1">
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
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={editChoreForm.processing}>
                                    {editChoreForm.processing ? 'Saving…' : 'Save Chore'}
                                </Button>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Import Schedule Modal */}
                <ScheduleUploadModal open={importOpen} onOpenChange={setImportOpen} />
            </AppLayout>
        </>
    );
}
