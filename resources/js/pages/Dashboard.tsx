import { Head, router } from '@inertiajs/react';
import { GripVertical, Plus, Settings2, X } from 'lucide-react';
import { useState } from 'react';
import { destroy, reorder, store, update } from '@/actions/App/Http/Controllers/DashboardController';
import CalendarScheduleWidget from '@/components/Dashboard/CalendarScheduleWidget';
import CalendarTodayWidget from '@/components/Dashboard/CalendarTodayWidget';
import ShoppingListWidget from '@/components/Dashboard/ShoppingListWidget';
import TodoListWidget from '@/components/Dashboard/TodoListWidget';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/AppLayout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

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

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard() }];

export default function Dashboard({
    widgets: initialWidgets,
    widgetTypes,
    shoppingLists,
    todoCategories,
    calendarEvents,
    todosToday,
    shoppingItems,
}: Props) {
    const [localWidgets, setLocalWidgets] = useState<Widget[]>([...initialWidgets]);
    const [addOpen, setAddOpen] = useState(false);
    const [newWidgetType, setNewWidgetType] = useState('');
    const [newWidgetListId, setNewWidgetListId] = useState('');
    const [newWidgetCategory, setNewWidgetCategory] = useState('');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsWidget, setSettingsWidget] = useState<Widget | null>(null);
    const [settingsListId, setSettingsListId] = useState('');
    const [settingsCategory, setSettingsCategory] = useState('');
    const [draggingId, setDraggingId] = useState<number | null>(null);

    function widgetLabel(type: string) {
        return widgetTypes.find((t) => t.value === type)?.label ?? type;
    }

    function todayEvents() {
        const todayStr = new Date().toDateString();

        return calendarEvents.filter((e) => new Date(e.start_at).toDateString() === todayStr);
    }

    function filteredTodos(widget: Widget) {
        const cat = widget.settings?.category as string | undefined;

        return cat ? todosToday.filter((t) => t.category === cat) : todosToday;
    }

    function addWidget() {
        if (!newWidgetType) {
            return;
        }

        const settings: Record<string, unknown> = {};

        if (newWidgetListId) {
            settings.list_id = newWidgetListId;
        }

        if (newWidgetCategory) {
            settings.category = newWidgetCategory;
        }

        router.post(
            store().url,
            { type: newWidgetType, settings },
            {
                onSuccess: () => {
                    setAddOpen(false);
                    setNewWidgetType('');
                    setNewWidgetListId('');
                    setNewWidgetCategory('');
                },
                preserveScroll: true,
            },
        );
    }

    function removeWidget(widget: Widget) {
        router.delete(destroy(widget.id).url, { preserveScroll: true });
    }

    function openSettings(widget: Widget) {
        setSettingsWidget(widget);
        setSettingsListId(String(widget.settings?.list_id ?? ''));
        setSettingsCategory(String(widget.settings?.category ?? ''));
        setSettingsOpen(true);
    }

    function saveSettings() {
        if (!settingsWidget) {
            return;
        }

        const settings: Record<string, unknown> = {};

        if (settingsListId) {
            settings.list_id = settingsListId;
        }

        if (settingsCategory) {
            settings.category = settingsCategory;
        }

        router.patch(update(settingsWidget.id).url, { settings }, { onSuccess: () => setSettingsOpen(false), preserveScroll: true });
    }

    function onDragStart(widget: Widget) {
        setDraggingId(widget.id);
    }

    function onDragOver(e: React.DragEvent, widget: Widget) {
        e.preventDefault();

        if (draggingId === widget.id) {
            return;
        }

        setLocalWidgets((prev) => {
            const from = prev.findIndex((w) => w.id === draggingId);
            const to = prev.findIndex((w) => w.id === widget.id);

            if (from === -1 || to === -1) {
                return prev;
            }

            const updated = [...prev];
            const [moved] = updated.splice(from, 1);
            updated.splice(to, 0, moved);

            return updated;
        });
    }

    function onDrop(e: React.DragEvent) {
        e.preventDefault();
        setDraggingId(null);
        router.post(reorder().url, { order: localWidgets.map((w) => w.id) }, { preserveScroll: true });
    }

    function hasSettings(type: string) {
        return type === 'todo_list' || type === 'shopping_list';
    }

    const showListFilter = newWidgetType === 'shopping_list';
    const showCategoryFilter = newWidgetType === 'todo_list';

    return (
        <>
            <Head title="Dashboard" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Dashboard</h1>
                        <Button size="sm" onClick={() => setAddOpen(true)}>
                            <Plus className="mr-1 size-4" /> Add Widget
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {localWidgets.map((widget) => (
                            <div
                                key={widget.id}
                                className={`rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md${draggingId === widget.id ? 'scale-[0.98] opacity-50' : ''}`}
                                draggable
                                onDragStart={() => onDragStart(widget)}
                                onDragOver={(e) => onDragOver(e, widget)}
                                onDrop={onDrop}
                            >
                                <div className="flex items-center justify-between border-b px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="size-4 cursor-grab text-muted-foreground/40 active:cursor-grabbing" />
                                        <span className="text-sm font-medium">{widgetLabel(widget.type)}</span>
                                        {widget.settings?.category && (
                                            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">
                                                {widget.settings.category as string}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {hasSettings(widget.type) && (
                                            <Button variant="ghost" size="icon" className="size-7" onClick={() => openSettings(widget)}>
                                                <Settings2 className="size-3.5 text-muted-foreground" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" className="size-7" onClick={() => removeWidget(widget)}>
                                            <X className="size-3.5 text-muted-foreground" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    {widget.type === 'calendar_schedule' && <CalendarScheduleWidget events={calendarEvents} />}
                                    {widget.type === 'calendar_today' && <CalendarTodayWidget events={todayEvents()} />}
                                    {widget.type === 'todo_list' && (
                                        <TodoListWidget todos={filteredTodos(widget)} categoryFilter={String(widget.settings?.category ?? '')} />
                                    )}
                                    {widget.type === 'shopping_list' && (
                                        <ShoppingListWidget
                                            shoppingItems={shoppingItems}
                                            listId={widget.settings?.list_id as number | undefined}
                                            shoppingLists={shoppingLists}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}

                        {localWidgets.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
                                <p className="text-sm text-muted-foreground">No widgets yet.</p>
                                <Button variant="outline" size="sm" className="mt-3" onClick={() => setAddOpen(true)}>
                                    <Plus className="mr-1 size-4" /> Add your first widget
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Widget Dialog */}
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Widget</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Widget Type</Label>
                                <Select value={newWidgetType} onValueChange={setNewWidgetType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a widget…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {widgetTypes.map((wt) => (
                                            <SelectItem key={wt.value} value={wt.value}>
                                                {wt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {showListFilter && (
                                <div className="grid gap-2">
                                    <Label>Shopping List</Label>
                                    <Select value={newWidgetListId} onValueChange={setNewWidgetListId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All lists (first list)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {shoppingLists.map((list) => (
                                                <SelectItem key={list.id} value={String(list.id)}>
                                                    {list.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {showCategoryFilter && (
                                <div className="grid gap-2">
                                    <Label>
                                        Category Filter <span className="text-xs text-muted-foreground">(optional)</span>
                                    </Label>
                                    <Select value={newWidgetCategory} onValueChange={setNewWidgetCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All categories</SelectItem>
                                            {todoCategories.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <Button className="w-full" disabled={!newWidgetType} onClick={addWidget}>
                                Add Widget
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Settings Dialog */}
                <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Widget Settings</DialogTitle>
                        </DialogHeader>
                        {settingsWidget && (
                            <div className="space-y-4">
                                {settingsWidget.type === 'shopping_list' && (
                                    <div className="grid gap-2">
                                        <Label>Shopping List</Label>
                                        <Select value={settingsListId} onValueChange={setSettingsListId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="First list" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {shoppingLists.map((list) => (
                                                    <SelectItem key={list.id} value={String(list.id)}>
                                                        {list.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {settingsWidget.type === 'todo_list' && (
                                    <div className="grid gap-2">
                                        <Label>
                                            Category Filter <span className="text-xs text-muted-foreground">(optional)</span>
                                        </Label>
                                        <Select value={settingsCategory} onValueChange={setSettingsCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All categories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All categories</SelectItem>
                                                {todoCategories.map((cat) => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        {cat.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <Button className="w-full" onClick={saveSettings}>
                                    Save Settings
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </AppLayout>
        </>
    );
}
