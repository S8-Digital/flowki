<script setup lang="ts">
import { destroy, move, store, update } from '@/actions/App/Http/Controllers/CalendarEventController';
import { update as updateTodo } from '@/actions/App/Http/Controllers/TodoController';
import { update as updateChore } from '@/actions/App/Http/Controllers/ChoreController';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectInput } from '@/components/ui/select-input';
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem, type CalendarEvent, type Chore, type Todo, type User } from '@/types';
import { Form, Head, router } from '@inertiajs/vue3';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { CalendarOptions, EventClickArg, DateSelectArg, EventDropArg, EventResizeDoneArg } from '@fullcalendar/core';
import { Plus, Trash2 } from 'lucide-vue-next';
import { computed, ref } from 'vue';

interface Props {
    events: CalendarEvent[];
    todos: Todo[];
    chores: Chore[];
    members: User[];
}

const props = defineProps<Props>();

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Calendar', href: '/calendar' }];

// ── Modal state ────────────────────────────────────────────────────────────────

const createOpen = ref(false);
const editEventOpen = ref(false);
const editTodoOpen = ref(false);
const editChoreOpen = ref(false);

const selectedEvent = ref<CalendarEvent | null>(null);
const selectedTodo = ref<Todo | null>(null);
const selectedChore = ref<Chore | null>(null);
const createStart = ref('');
const createEnd = ref('');

// ── Event transformation for FullCalendar ─────────────────────────────────────

const allFcEvents = computed(() => [
    ...(props.events ?? []).map((e) => ({
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
    ...(props.todos ?? []).map((t) => ({
        id: `todo-${t.id}`,
        title: `☑ ${t.title}`,
        start: t.due_date!,
        backgroundColor: t.status === 'completed' ? '#9ca3af' : '#f59e0b',
        borderColor: t.status === 'completed' ? '#9ca3af' : '#f59e0b',
        textColor: '#ffffff',
        editable: false,
        extendedProps: { type: 'todo', source: t },
    })),
    ...(props.chores ?? []).map((c) => ({
        id: `chore-${c.id}`,
        title: `↺ ${c.title}`,
        start: c.next_due_date!,
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        textColor: '#ffffff',
        editable: false,
        extendedProps: { type: 'chore', source: c },
    })),
]);

// ── Calendar event handlers ────────────────────────────────────────────────────

function handleDateSelect(info: DateSelectArg) {
    createStart.value = info.startStr.slice(0, 16);
    createEnd.value = info.endStr ? info.endStr.slice(0, 16) : '';
    createOpen.value = true;
}

function handleEventClick(info: EventClickArg) {
    const { type, source } = info.event.extendedProps;
    if (type === 'event') {
        selectedEvent.value = source;
        editEventOpen.value = true;
    } else if (type === 'todo') {
        selectedTodo.value = source;
        editTodoOpen.value = true;
    } else if (type === 'chore') {
        selectedChore.value = source;
        editChoreOpen.value = true;
    }
}

function handleEventDrop(info: EventDropArg) {
    if (info.event.extendedProps.type !== 'event') {
        info.revert();
        return;
    }
    router.patch(
        move(info.event.extendedProps.source.id).url,
        {
            start_at: info.event.startStr,
            end_at: info.event.endStr || null,
        },
        { preserveState: true, preserveScroll: true },
    );
}

function handleEventResize(info: EventResizeDoneArg) {
    router.patch(
        move(info.event.extendedProps.source.id).url,
        {
            start_at: info.event.startStr,
            end_at: info.event.endStr,
        },
        { preserveState: true, preserveScroll: true },
    );
}

function deleteCurrentEvent() {
    if (!selectedEvent.value) return;
    if (!confirm('Delete this event?')) return;
    editEventOpen.value = false;
    router.delete(destroy(selectedEvent.value.id).url);
}

// ── FullCalendar config ────────────────────────────────────────────────────────

const calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    buttonText: {
        today: 'Today',
        month: 'Month',
        week: 'Week',
        day: 'Day',
        list: 'Schedule',
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    nowIndicator: true,
    height: 'auto',
    events: allFcEvents.value,
    select: handleDateSelect,
    eventClick: handleEventClick,
    eventDrop: handleEventDrop,
    eventResize: handleEventResize,
}));
</script>

<template>
    <Head title="Calendar" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col gap-4 p-4">
            <div class="flex items-center justify-between">
                <h1 class="text-xl font-semibold">Calendar</h1>
                <Button size="sm" @click="createStart = ''; createEnd = ''; createOpen = true">
                    <Plus class="mr-1 size-4" /> New Event
                </Button>
            </div>

            <!-- FullCalendar -->
            <div class="rounded-xl border p-2">
                <FullCalendar :options="calendarOptions" />
            </div>
        </div>

        <!-- ── Create Event Modal ──────────────────────────────────────────── -->
        <Dialog v-model:open="createOpen">
            <DialogContent class="max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>New Event</DialogTitle></DialogHeader>
                <Form
                    :action="store()"
                    method="post"
                    class="space-y-4"
                    v-slot="{ errors, processing }"
                    reset-on-success
                    @success="createOpen = false"
                >
                    <div class="grid gap-2">
                        <Label for="c-title">Title</Label>
                        <Input id="c-title" name="title" placeholder="Event name" required />
                        <InputError :message="errors.title" />
                    </div>
                    <div class="grid gap-2">
                        <Label for="c-description">Description</Label>
                        <Input id="c-description" name="description" placeholder="Optional" />
                    </div>
                    <div class="grid gap-2">
                        <Label for="c-location">Location</Label>
                        <Input id="c-location" name="location" placeholder="Optional" />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="grid gap-2">
                            <Label for="c-start">Start</Label>
                            <Input id="c-start" name="start_at" type="datetime-local" :default-value="createStart" required />
                            <InputError :message="errors.start_at" />
                        </div>
                        <div class="grid gap-2">
                            <Label for="c-end">End</Label>
                            <Input id="c-end" name="end_at" type="datetime-local" :default-value="createEnd" />
                            <InputError :message="errors.end_at" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="grid gap-2">
                            <Label for="c-recurrence">Recurrence</Label>
                            <SelectInput id="c-recurrence" name="recurrence">
                                <option value="">None</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </SelectInput>
                        </div>
                        <div class="grid gap-2">
                            <Label for="c-color">Colour</Label>
                            <Input id="c-color" name="color" type="color" class="h-9 w-full cursor-pointer rounded-md border px-1" value="#6366f1" />
                        </div>
                    </div>
                    <div class="grid gap-2">
                        <Label>Attendees</Label>
                        <SelectInput name="attendee_ids[]" multiple class="h-24">
                            <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
                        </SelectInput>
                        <p class="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple</p>
                    </div>
                    <Button type="submit" class="w-full" :disabled="processing">
                        {{ processing ? 'Creating…' : 'Create Event' }}
                    </Button>
                </Form>
            </DialogContent>
        </Dialog>

        <!-- ── Edit Event Modal ───────────────────────────────────────────── -->
        <Dialog v-model:open="editEventOpen">
            <DialogContent class="max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
                <Form
                    v-if="selectedEvent"
                    :action="update(selectedEvent.id)"
                    method="patch"
                    class="space-y-4"
                    v-slot="{ errors, processing }"
                    @success="editEventOpen = false"
                >
                    <div class="grid gap-2">
                        <Label>Title</Label>
                        <Input name="title" :default-value="selectedEvent.title" required />
                        <InputError :message="errors.title" />
                    </div>
                    <div class="grid gap-2">
                        <Label>Description</Label>
                        <Input name="description" :default-value="selectedEvent.description ?? ''" />
                    </div>
                    <div class="grid gap-2">
                        <Label>Location</Label>
                        <Input name="location" :default-value="selectedEvent.location ?? ''" />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="grid gap-2">
                            <Label>Start</Label>
                            <Input name="start_at" type="datetime-local" :default-value="selectedEvent.start_at.slice(0, 16)" required />
                            <InputError :message="errors.start_at" />
                        </div>
                        <div class="grid gap-2">
                            <Label>End</Label>
                            <Input name="end_at" type="datetime-local" :default-value="selectedEvent.end_at?.slice(0, 16) ?? ''" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="grid gap-2">
                            <Label>Recurrence</Label>
                            <SelectInput name="recurrence" :value="selectedEvent.recurrence ?? ''">
                                <option value="">None</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </SelectInput>
                        </div>
                        <div class="grid gap-2">
                            <Label>Colour</Label>
                            <Input name="color" type="color" class="h-9 w-full cursor-pointer rounded-md border px-1" :value="selectedEvent.color ?? '#6366f1'" />
                        </div>
                    </div>
                    <div class="grid gap-2">
                        <Label>Attendees</Label>
                        <SelectInput name="attendee_ids[]" multiple class="h-24">
                            <option v-for="m in members" :key="m.id" :value="m.id"
                                :selected="selectedEvent.attendees?.some(a => a.id === m.id)">
                                {{ m.name }}
                            </option>
                        </SelectInput>
                    </div>
                    <div class="flex gap-2">
                        <Button type="submit" class="flex-1" :disabled="processing">
                            {{ processing ? 'Saving…' : 'Save Changes' }}
                        </Button>
                        <Button type="button" variant="destructive" size="icon" @click="deleteCurrentEvent">
                            <Trash2 class="size-4" />
                        </Button>
                    </div>
                </Form>
            </DialogContent>
        </Dialog>

        <!-- ── Edit Todo Modal (from calendar click) ───────────────────────── -->
        <Dialog v-model:open="editTodoOpen">
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Todo</DialogTitle></DialogHeader>
                <Form
                    v-if="selectedTodo"
                    :action="updateTodo(selectedTodo.id)"
                    method="patch"
                    class="space-y-4"
                    v-slot="{ errors, processing }"
                    @success="editTodoOpen = false"
                >
                    <div class="grid gap-2">
                        <Label>Title</Label>
                        <Input name="title" :default-value="selectedTodo.title" required />
                        <InputError :message="errors.title" />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="grid gap-2">
                            <Label>Status</Label>
                            <SelectInput name="status" :value="selectedTodo.status">
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </SelectInput>
                        </div>
                        <div class="grid gap-2">
                            <Label>Priority</Label>
                            <SelectInput name="priority" :value="selectedTodo.priority">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </SelectInput>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="grid gap-2">
                            <Label>Category</Label>
                            <SelectInput name="category" :value="selectedTodo.category">
                                <option value="home">Home</option>
                                <option value="work">Work</option>
                                <option value="school">School</option>
                                <option value="personal">Personal</option>
                            </SelectInput>
                        </div>
                        <div class="grid gap-2">
                            <Label>Due Date & Time</Label>
                            <Input name="due_date" type="datetime-local" :default-value="selectedTodo.due_date ?? ''" />
                        </div>
                    </div>
                    <div class="grid gap-2">
                        <Label>Assign To</Label>
                        <SelectInput name="assigned_to" :value="selectedTodo.assignee?.id ?? ''">
                            <option value="">Unassigned</option>
                            <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
                        </SelectInput>
                    </div>
                    <Button type="submit" class="w-full" :disabled="processing">
                        {{ processing ? 'Saving…' : 'Save Todo' }}
                    </Button>
                </Form>
            </DialogContent>
        </Dialog>

        <!-- ── Edit Chore Modal (from calendar click) ──────────────────────── -->
        <Dialog v-model:open="editChoreOpen">
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Chore</DialogTitle></DialogHeader>
                <Form
                    v-if="selectedChore"
                    :action="updateChore(selectedChore.id)"
                    method="patch"
                    class="space-y-4"
                    v-slot="{ errors, processing }"
                    @success="editChoreOpen = false"
                >
                    <div class="grid gap-2">
                        <Label>Title</Label>
                        <Input name="title" :default-value="selectedChore.title" required />
                        <InputError :message="errors.title" />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="grid gap-2">
                            <Label>Frequency</Label>
                            <SelectInput name="frequency" :value="selectedChore.frequency">
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="biweekly">Bi-weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="as_needed">As Needed</option>
                            </SelectInput>
                        </div>
                        <div class="grid gap-2">
                            <Label>Next Due</Label>
                            <Input name="next_due_date" type="datetime-local" :default-value="selectedChore.next_due_date ?? ''" />
                        </div>
                    </div>
                    <div class="grid gap-2">
                        <Label>Assign To</Label>
                        <SelectInput name="assignee_ids[]" multiple class="h-20">
                            <option v-for="m in members" :key="m.id" :value="m.id"
                                :selected="selectedChore.assignees?.some(a => a.id === m.id)">
                                {{ m.name }}
                            </option>
                        </SelectInput>
                    </div>
                    <Button type="submit" class="w-full" :disabled="processing">
                        {{ processing ? 'Saving…' : 'Save Chore' }}
                    </Button>
                </Form>
            </DialogContent>
        </Dialog>
    </AppLayout>
</template>

