<script setup lang="ts">
import { destroy, reorder, store, update } from '@/actions/App/Http/Controllers/DashboardController';
import CalendarScheduleWidget from '@/components/Dashboard/CalendarScheduleWidget.vue';
import CalendarTodayWidget from '@/components/Dashboard/CalendarTodayWidget.vue';
import ShoppingListWidget from '@/components/Dashboard/ShoppingListWidget.vue';
import TodoListWidget from '@/components/Dashboard/TodoListWidget.vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/AppLayout.vue';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/vue3';
import { GripVertical, Plus, Settings2, X } from 'lucide-vue-next';
import { computed, ref } from 'vue';

interface Widget {
    id: number;
    type: string;
    position: number;
    settings: Record<string, unknown>;
}

interface WidgetType {
    value: string;
    label: string;
}

interface CalendarEventItem {
    id: number;
    title: string;
    start_at: string;
    end_at: string | null;
    is_all_day: boolean;
    color: string | null;
    location: string | null;
}

interface TodoItem {
    id: number;
    title: string;
    status: string;
    priority: string;
    category: string;
    due_date: string | null;
}

interface ShoppingListData {
    id: number;
    name: string;
    items: { id: number; name: string; quantity: string | null; category: string; is_checked: boolean }[];
}

interface Props {
    widgets: Widget[];
    widgetTypes: WidgetType[];
    shoppingLists: { id: number; name: string }[];
    todoCategories: { value: string; label: string }[];
    calendarEvents: CalendarEventItem[];
    todosToday: TodoItem[];
    shoppingItems: Record<number, ShoppingListData>;
}

const props = defineProps<Props>();

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard().url }];

// Local mutable widget list for drag-to-reorder
const localWidgets = ref<Widget[]>([...props.widgets]);

// Add widget dialog
const addOpen = ref(false);
const newWidgetType = ref('');
const newWidgetListId = ref('');
const newWidgetCategory = ref('');

// Settings dialog
const settingsOpen = ref(false);
const settingsWidget = ref<Widget | null>(null);
const settingsListId = ref('');
const settingsCategory = ref('');

// Dragging state
const draggingId = ref<number | null>(null);
const dragOverId = ref<number | null>(null);

function widgetLabel(type: string): string {
    return props.widgetTypes.find((t) => t.value === type)?.label ?? type;
}

// ── Filtering helpers ──────────────────────────────────────────────────────────

function todayEvents(): CalendarEventItem[] {
    const todayStr = new Date().toDateString();
    return props.calendarEvents.filter((e) => new Date(e.start_at).toDateString() === todayStr);
}

function filteredTodos(widget: Widget): TodoItem[] {
    const cat = widget.settings?.category as string | undefined;
    if (cat) {
        return props.todosToday.filter((t) => t.category === cat);
    }
    return props.todosToday;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

function addWidget() {
    if (!newWidgetType.value) return;

    const settings: Record<string, unknown> = {};
    if (newWidgetListId.value) settings.list_id = newWidgetListId.value;
    if (newWidgetCategory.value) settings.category = newWidgetCategory.value;

    router.post(
        store().url,
        { type: newWidgetType.value, settings },
        {
            onSuccess: () => {
                addOpen.value = false;
                newWidgetType.value = '';
                newWidgetListId.value = '';
                newWidgetCategory.value = '';
            },
            preserveScroll: true,
        },
    );
}

function removeWidget(widget: Widget) {
    router.delete(destroy(widget.id).url, { preserveScroll: true });
}

function openSettings(widget: Widget) {
    settingsWidget.value = widget;
    settingsListId.value = String(widget.settings?.list_id ?? '');
    settingsCategory.value = String(widget.settings?.category ?? '');
    settingsOpen.value = true;
}

function saveSettings() {
    if (!settingsWidget.value) return;
    const settings: Record<string, unknown> = {};
    if (settingsListId.value) settings.list_id = settingsListId.value;
    if (settingsCategory.value) settings.category = settingsCategory.value;

    router.patch(
        update(settingsWidget.value.id).url,
        { settings },
        {
            onSuccess: () => {
                settingsOpen.value = false;
            },
            preserveScroll: true,
        },
    );
}

// ── Drag-to-reorder ───────────────────────────────────────────────────────────

function onDragStart(widget: Widget) {
    draggingId.value = widget.id;
}

function onDragOver(widget: Widget) {
    if (draggingId.value === widget.id) return;
    dragOverId.value = widget.id;

    const from = localWidgets.value.findIndex((w) => w.id === draggingId.value);
    const to = localWidgets.value.findIndex((w) => w.id === widget.id);
    if (from === -1 || to === -1) return;

    const updated = [...localWidgets.value];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    localWidgets.value = updated;
}

function onDrop() {
    draggingId.value = null;
    dragOverId.value = null;
    router.post(reorder().url, { order: localWidgets.value.map((w) => w.id) }, { preserveScroll: true });
}

// Show settings option only for widgets with configurable settings
function hasSettings(type: string): boolean {
    return type === 'todo_list' || type === 'shopping_list';
}

const showListFilter = computed(() => newWidgetType.value === 'shopping_list');
const showCategoryFilter = computed(() => newWidgetType.value === 'todo_list');
</script>

<template>
    <Head title="Dashboard" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-col gap-4 p-4">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <h1 class="text-xl font-semibold">Dashboard</h1>
                <Button size="sm" @click="addOpen = true"> <Plus class="mr-1 size-4" /> Add Widget </Button>
            </div>

            <!-- Widget grid -->
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div
                    v-for="widget in localWidgets"
                    :key="widget.id"
                    class="rounded-xl border bg-card transition-shadow"
                    :class="{ 'scale-[0.98] opacity-50': draggingId === widget.id }"
                    draggable="true"
                    @dragstart="onDragStart(widget)"
                    @dragover.prevent="onDragOver(widget)"
                    @drop.prevent="onDrop"
                >
                    <!-- Widget header -->
                    <div class="flex items-center justify-between border-b px-4 py-2.5">
                        <div class="flex items-center gap-2">
                            <GripVertical class="size-4 cursor-grab text-muted-foreground/40 active:cursor-grabbing" />
                            <span class="text-sm font-medium">{{ widgetLabel(widget.type) }}</span>
                            <span v-if="widget.settings?.category" class="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">
                                {{ widget.settings.category }}
                            </span>
                        </div>
                        <div class="flex items-center gap-1">
                            <Button v-if="hasSettings(widget.type)" variant="ghost" size="icon" class="size-7" @click="openSettings(widget)">
                                <Settings2 class="size-3.5 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" class="size-7" @click="removeWidget(widget)">
                                <X class="size-3.5 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>

                    <!-- Widget content -->
                    <div class="p-4">
                        <CalendarScheduleWidget v-if="widget.type === 'calendar_schedule'" :events="calendarEvents" />
                        <CalendarTodayWidget v-else-if="widget.type === 'calendar_today'" :events="todayEvents()" />
                        <TodoListWidget
                            v-else-if="widget.type === 'todo_list'"
                            :todos="filteredTodos(widget)"
                            :category-filter="String(widget.settings?.category ?? '')"
                        />
                        <ShoppingListWidget
                            v-else-if="widget.type === 'shopping_list'"
                            :shopping-items="shoppingItems"
                            :list-id="widget.settings?.list_id ?? undefined"
                            :shopping-lists="shoppingLists"
                        />
                    </div>
                </div>

                <!-- Empty state -->
                <div
                    v-if="localWidgets.length === 0"
                    class="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center"
                >
                    <p class="text-sm text-muted-foreground">No widgets yet.</p>
                    <Button variant="outline" size="sm" class="mt-3" @click="addOpen = true">
                        <Plus class="mr-1 size-4" /> Add your first widget
                    </Button>
                </div>
            </div>
        </div>

        <!-- Add Widget Dialog -->
        <Dialog v-model:open="addOpen">
            <DialogContent>
                <DialogHeader><DialogTitle>Add Widget</DialogTitle></DialogHeader>
                <div class="space-y-4">
                    <div class="grid gap-2">
                        <Label>Widget Type</Label>
                        <Select v-model="newWidgetType">
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a widget…" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="wt in widgetTypes" :key="wt.value" :value="wt.value">
                                    {{ wt.label }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <!-- Shopping list filter -->
                    <div v-if="showListFilter" class="grid gap-2">
                        <Label>Shopping List</Label>
                        <Select v-model="newWidgetListId">
                            <SelectTrigger>
                                <SelectValue placeholder="All lists (first list)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="list in shoppingLists" :key="list.id" :value="String(list.id)">
                                    {{ list.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <!-- Todo category filter -->
                    <div v-if="showCategoryFilter" class="grid gap-2">
                        <Label>Category Filter <span class="text-xs text-muted-foreground">(optional)</span></Label>
                        <Select v-model="newWidgetCategory">
                            <SelectTrigger>
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All categories</SelectItem>
                                <SelectItem v-for="cat in todoCategories" :key="cat.value" :value="cat.value">
                                    {{ cat.label }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button class="w-full" :disabled="!newWidgetType" @click="addWidget"> Add Widget </Button>
                </div>
            </DialogContent>
        </Dialog>

        <!-- Settings Dialog -->
        <Dialog v-model:open="settingsOpen">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Widget Settings</DialogTitle>
                </DialogHeader>
                <div v-if="settingsWidget" class="space-y-4">
                    <!-- Shopping list settings -->
                    <div v-if="settingsWidget.type === 'shopping_list'" class="grid gap-2">
                        <Label>Shopping List</Label>
                        <Select v-model="settingsListId">
                            <SelectTrigger>
                                <SelectValue placeholder="First list" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="list in shoppingLists" :key="list.id" :value="String(list.id)">
                                    {{ list.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <!-- Todo settings -->
                    <div v-if="settingsWidget.type === 'todo_list'" class="grid gap-2">
                        <Label>Category Filter <span class="text-xs text-muted-foreground">(optional)</span></Label>
                        <Select v-model="settingsCategory">
                            <SelectTrigger>
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All categories</SelectItem>
                                <SelectItem v-for="cat in todoCategories" :key="cat.value" :value="cat.value">
                                    {{ cat.label }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button class="w-full" @click="saveSettings">Save Settings</Button>
                </div>
            </DialogContent>
        </Dialog>
    </AppLayout>
</template>
