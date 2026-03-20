import { Head, router } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GripVertical, Plus, Settings2, X } from 'lucide-react';
import { useState } from 'react';
import { destroy, reorder, store, update } from '@/actions/App/Http/Controllers/DashboardController';
import CalendarScheduleWidget from '@/components/Dashboard/CalendarScheduleWidget';
import CalendarTodayWidget from '@/components/Dashboard/CalendarTodayWidget';
import ShoppingListWidget from '@/components/Dashboard/ShoppingListWidget';
import TodoListWidget from '@/components/Dashboard/TodoListWidget';
import WeatherWidget from '@/components/Dashboard/WeatherWidget';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/AppLayout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, CalendarEvent, DashboardShoppingListData, DashboardWidget, DashboardWidgetType, Todo } from '@/types';

interface Props {
    widgets: DashboardWidget[];
    widgetTypes: DashboardWidgetType[];
    shoppingLists: { id: number; name: string }[];
    todoCategories: { value: string; label: string }[];
    calendarEvents: CalendarEvent[];
    todosToday: Todo[];
    shoppingItems: Record<number, DashboardShoppingListData>;
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
    const [localWidgets, setLocalWidgets] = useState<DashboardWidget[]>([...initialWidgets]);
    const [addOpen, setAddOpen] = useState(false);
    const [newWidgetType, setNewWidgetType] = useState('');
    const [newWidgetListId, setNewWidgetListId] = useState('');
    const [newWidgetCategory, setNewWidgetCategory] = useState('');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsWidget, setSettingsWidget] = useState<DashboardWidget | null>(null);
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

    function filteredTodos(widget: DashboardWidget) {
        const cat = widget.settings?.category as string | undefined;

        return cat ? todosToday.filter((t) => t.category === cat) : todosToday;
    }

    function addWidget() {
        if (!newWidgetType) {
            return;
        }

        const settings: Record<string, string | number | boolean | null> = {};

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

    function removeWidget(widget: DashboardWidget) {
        router.delete(destroy(widget.id).url, { preserveScroll: true });
    }

    function openSettings(widget: DashboardWidget) {
        setSettingsWidget(widget);
        setSettingsListId(String(widget.settings?.list_id ?? ''));
        setSettingsCategory(String(widget.settings?.category ?? ''));
        setSettingsOpen(true);
    }

    function saveSettings() {
        if (!settingsWidget) {
            return;
        }

        const settings: Record<string, string | number | boolean | null> = {};

        if (settingsListId) {
            settings.list_id = settingsListId;
        }

        if (settingsCategory) {
            settings.category = settingsCategory;
        }

        router.patch(update(settingsWidget.id).url, { settings }, { onSuccess: () => setSettingsOpen(false), preserveScroll: true });
    }

    function onDragStart(widget: DashboardWidget) {
        setDraggingId(widget.id);
    }

    function onDragOver(e: React.DragEvent, widget: DashboardWidget) {
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Dashboard
                        </Typography>
                        <Button size="sm" onClick={() => setAddOpen(true)}>
                            <Plus className="mr-1 size-4" /> Add Widget
                        </Button>
                    </Box>

                    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' } }}>
                        {localWidgets.map((widget) => (
                            <Box
                                key={widget.id}
                                sx={{
                                    borderRadius: 2,
                                    border: 1,
                                    borderColor: 'divider',
                                    bgcolor: 'background.paper',
                                    boxShadow: 1,
                                    opacity: draggingId === widget.id ? 0.5 : 1,
                                    transform: draggingId === widget.id ? 'scale(0.98)' : 'none',
                                    transition: 'box-shadow 0.2s, opacity 0.2s, transform 0.2s',
                                }}
                                draggable
                                onDragStart={() => onDragStart(widget)}
                                onDragOver={(e) => onDragOver(e, widget)}
                                onDrop={onDrop}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderBottom: 1,
                                        borderColor: 'divider',
                                        px: 2,
                                        py: 1.25,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <GripVertical className="size-4 cursor-grab text-muted-foreground/40 active:cursor-grabbing" />
                                        <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>
                                            {widgetLabel(widget.type)}
                                        </Typography>
                                        {(widget.settings?.category as string) && (
                                            <Box
                                                component="span"
                                                sx={{
                                                    borderRadius: '50px',
                                                    bgcolor: 'secondary.main',
                                                    px: 1,
                                                    py: 0.25,
                                                    fontSize: '0.75rem',
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {widget.settings.category as string}
                                            </Box>
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {hasSettings(widget.type) && (
                                            <Button variant="ghost" size="icon" className="size-7" onClick={() => openSettings(widget)}>
                                                <Settings2 className="size-3.5 text-muted-foreground" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" className="size-7" onClick={() => removeWidget(widget)}>
                                            <X className="size-3.5 text-muted-foreground" />
                                        </Button>
                                    </Box>
                                </Box>
                                <Box sx={{ p: 2 }}>
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
                                    {widget.type === 'weather' && <WeatherWidget />}
                                </Box>
                            </Box>
                        ))}

                        {localWidgets.length === 0 && (
                            <Box
                                sx={{
                                    gridColumn: '1 / -1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 2,
                                    border: 1,
                                    borderColor: 'divider',
                                    borderStyle: 'dashed',
                                    py: 10,
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    No widgets yet.
                                </Typography>
                                <Button variant="outline" size="sm" className="mt-3" onClick={() => setAddOpen(true)}>
                                    <Plus className="mr-1 size-4" /> Add your first widget
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Add Widget Dialog */}
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Widget</DialogTitle>
                        </DialogHeader>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'grid', gap: 1 }}>
                                <Select label="Widget Type" value={newWidgetType} onValueChange={setNewWidgetType}>
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
                            </Box>
                            {showListFilter && (
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Select label="Shopping List" value={newWidgetListId} onValueChange={setNewWidgetListId}>
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
                                </Box>
                            )}
                            {showCategoryFilter && (
                                <Box sx={{ display: 'grid', gap: 1 }}>
                                    <Select label="Category Filter (optional)" value={newWidgetCategory} onValueChange={setNewWidgetCategory}>
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
                                </Box>
                            )}
                            <Button className="w-full" disabled={!newWidgetType} onClick={addWidget}>
                                Add Widget
                            </Button>
                        </Stack>
                    </DialogContent>
                </Dialog>

                {/* Settings Dialog */}
                <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Widget Settings</DialogTitle>
                        </DialogHeader>
                        {settingsWidget && (
                            <Stack spacing={2}>
                                {settingsWidget.type === 'shopping_list' && (
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Select label="Shopping List" value={settingsListId} onValueChange={setSettingsListId}>
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
                                    </Box>
                                )}
                                {settingsWidget.type === 'todo_list' && (
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        <Select label="Category Filter (optional)" value={settingsCategory} onValueChange={setSettingsCategory}>
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
                                    </Box>
                                )}
                                <Button className="w-full" onClick={saveSettings}>
                                    Save Settings
                                </Button>
                            </Stack>
                        )}
                    </DialogContent>
                </Dialog>
            </AppLayout>
        </>
    );
}
