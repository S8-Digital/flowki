import { Head, router, useForm } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { alpha, styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { ChevronLeft, ChevronRight, Loader2, Plus, ShoppingCart, Sparkles, Trash2, UtensilsCrossed } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { destroy, store } from '@/actions/App/Http/Controllers/MealController';
import InputError from '@/components/InputError';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/AppLayout';
import { getXsrfToken } from '@/lib/csrf';
import type { BreadcrumbItem, Meal, Recipe } from '@/types';

interface MealType {
    value: string;
    label: string;
}

interface ShoppingListSummary {
    id: number;
    name: string;
}

interface Props {
    meals: Meal[];
    recipes: Recipe[];
    shoppingLists: ShoppingListSummary[];
    weekStart: string;
    mealTypes: MealType[];
}

interface AiMealSuggestion {
    planned_date: string;
    meal_type: string;
    recipe_id: number;
    recipe_title: string;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Meal Planner', href: '/meals' }];

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DayColumn = styled(Box)(({ theme }) => ({
    flex: 1,
    minWidth: 0,
    borderRadius: theme.shape.borderRadius * 2,
    border: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
}));

const DayHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1, 1.5),
    backgroundColor: theme.palette.background.default,
    borderBottom: `1px solid ${theme.palette.divider}`,
    textAlign: 'center',
}));

const DayBody = styled(Box)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(1),
    minHeight: 120,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
    transition: 'background-color 0.15s',
}));

const MealCard = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.75, 1),
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    '&:active': {
        cursor: 'grabbing',
    },
}));

const RecipeCard = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    cursor: 'grab',
    '&:active': {
        cursor: 'grabbing',
    },
    '&:hover': {
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
}));

function getWeekDays(weekStart: string): Date[] {
    const start = new Date(weekStart + 'T00:00:00');

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);

        return d;
    });
}

function toDateString(date: Date): string {
    return date.toISOString().split('T')[0];
}

function offsetWeek(weekStart: string, delta: number): string {
    const d = new Date(weekStart + 'T00:00:00');
    d.setDate(d.getDate() + delta * 7);

    return toDateString(d);
}

export default function MealsIndex({ meals, recipes, shoppingLists, weekStart, mealTypes }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [dragRecipeId, setDragRecipeId] = useState<number | null>(null);
    const [dropTargetDate, setDropTargetDate] = useState<string | null>(null);
    const [groceryMealId, setGroceryMealId] = useState<number | null>(null);
    const [groceryListOpen, setGroceryListOpen] = useState(false);
    const [selectedListId, setSelectedListId] = useState('');

    // AI meal suggestion state
    const [aiPlanOpen, setAiPlanOpen] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [aiSuggestions, setAiSuggestions] = useState<AiMealSuggestion[] | null>(null);
    const [aiPreferences, setAiPreferences] = useState('');
    const [aiShoppingListId, setAiShoppingListId] = useState('');

    // Optimistic local state — instantly reflects drops / deletes without waiting for server
    const localStorageKey = `meals_week_${weekStart}`;
    const [localMeals, setLocalMeals] = useState<Meal[]>(() => {
        try {
            const cached = localStorage.getItem(localStorageKey);

            if (cached) {
                const parsed = JSON.parse(cached) as Meal[];

                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch {
            /* ignore */
        }

        return meals;
    });
    // Mutable ref for collision-free temporary IDs — doesn't need to trigger a re-render
    const optimisticCounterRef = useRef(0);

    // When Inertia reloads with authoritative server data, sync local state and update cache
    useEffect(() => {
        setLocalMeals(meals);

        try {
            localStorage.setItem(localStorageKey, JSON.stringify(meals));
        } catch {
            /* ignore */
        }
    }, [meals, localStorageKey]);

    const { data, setData, post, processing, errors, reset } = useForm({
        recipe_id: '',
        planned_date: '',
        meal_type: 'dinner',
        servings: '',
        notes: '',
        shopping_list_id: '',
    });

    const weekDays = getWeekDays(weekStart);

    function getMealsForDate(dateStr: string): Meal[] {
        return localMeals.filter((m) => m.planned_date === dateStr);
    }

    function navigateWeek(delta: number) {
        router.visit(`/meals?week=${offsetWeek(weekStart, delta)}`);
    }

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        post(store().url, {
            onSuccess: () => {
                setCreateOpen(false);
                reset();
            },
        });
    }

    function handleDelete(meal: Meal) {
        if (!confirm('Remove this meal?')) {
            return;
        }

        // Optimistic removal — disappears instantly; Inertia sync will confirm on response
        setLocalMeals((prev) => {
            const updated = prev.filter((m) => m.id !== meal.id);

            try {
                localStorage.setItem(localStorageKey, JSON.stringify(updated));
            } catch {
                /* ignore */
            }

            return updated;
        });

        // Only send server delete for real (persisted) meals — optimistic entries have negative IDs
        if (meal.id > 0) {
            router.delete(destroy(meal.id).url, { preserveScroll: true });
        }
    }

    // Drag-and-drop from recipe panel to day column
    function onRecipeDragStart(recipeId: number) {
        setDragRecipeId(recipeId);
    }

    function onDayDragOver(e: React.DragEvent, dateStr: string) {
        e.preventDefault();
        setDropTargetDate(dateStr);
    }

    function onDayDragLeave() {
        setDropTargetDate(null);
    }

    function onDayDrop(e: React.DragEvent, dateStr: string) {
        e.preventDefault();
        setDropTargetDate(null);

        if (dragRecipeId === null) {
            return;
        }

        const recipe = recipes.find((r) => r.id === dragRecipeId) ?? null;
        // Synchronously increment the ref so rapid drops never produce the same temp ID
        const tempId = -++optimisticCounterRef.current;

        const optimisticMeal: Meal = {
            id: tempId,
            family_id: -1,
            created_by: -1,
            recipe_id: null, // null keeps shopping-list actions hidden until server returns the real meal ID
            planned_date: dateStr,
            meal_type: 'dinner',
            servings: recipe?.servings ?? null,
            notes: null,
            recipe,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Apply optimistically before server responds
        setLocalMeals((prev) => {
            const updated = [...prev, optimisticMeal];

            try {
                localStorage.setItem(localStorageKey, JSON.stringify(updated));
            } catch {
                /* ignore */
            }

            return updated;
        });

        setDragRecipeId(null);

        router.post(
            store().url,
            {
                recipe_id: dragRecipeId,
                planned_date: dateStr,
                meal_type: 'dinner',
            },
            {
                preserveScroll: true,
                onError: () => {
                    // Revert on failure
                    setLocalMeals((prev) => {
                        const reverted = prev.filter((m) => m.id !== tempId);

                        try {
                            localStorage.setItem(localStorageKey, JSON.stringify(reverted));
                        } catch {
                            /* ignore */
                        }

                        return reverted;
                    });
                },
            },
        );
    }

    function onDragEnd() {
        setDragRecipeId(null);
        setDropTargetDate(null);
    }

    function openGroceryDialog(mealId: number) {
        setGroceryMealId(mealId);
        setSelectedListId(shoppingLists[0]?.id?.toString() ?? '');
        setGroceryListOpen(true);
    }

    function addGroceries() {
        if (!groceryMealId || !selectedListId) {
            return;
        }

        router.post(
            `/meals/${groceryMealId}/groceries`,
            { shopping_list_id: selectedListId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setGroceryListOpen(false);
                    setGroceryMealId(null);
                },
            },
        );
    }

    async function fetchAiSuggestions() {
        setAiLoading(true);
        setAiError(null);
        setAiSuggestions(null);

        try {
            const response = await fetch('/meals/ai-suggest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getXsrfToken(),
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    week_start: weekStart,
                    preferences: aiPreferences || undefined,
                }),
            });

            const data = (await response.json()) as { suggestions?: AiMealSuggestion[]; error?: string; message?: string };

            if (!response.ok || data.error) {
                setAiError(data.message ?? data.error ?? 'Something went wrong. Please try again.');

                return;
            }

            setAiSuggestions(data.suggestions ?? null);
        } catch {
            setAiError('Failed to connect. Please try again.');
        } finally {
            setAiLoading(false);
        }
    }

    function acceptAiSuggestions() {
        if (!aiSuggestions) {
            return;
        }

        router.post(
            '/meals/bulk',
            {
                meals: aiSuggestions,
                shopping_list_id: aiShoppingListId || undefined,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAiPlanOpen(false);
                    setAiSuggestions(null);
                    setAiPreferences('');
                    setAiShoppingListId('');
                },
            },
        );
    }

    const weekLabel = `${weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

    return (
        <>
            <Head title="Meal Planner" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <UtensilsCrossed size={20} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Meal Planner
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton size="small" onClick={() => navigateWeek(-1)} aria-label="Previous week">
                                <ChevronLeft size={18} />
                            </IconButton>
                            <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 160, textAlign: 'center' }}>
                                {weekLabel}
                            </Typography>
                            <IconButton size="small" onClick={() => navigateWeek(1)} aria-label="Next week">
                                <ChevronRight size={18} />
                            </IconButton>

                            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm">
                                        <Plus size={16} style={{ marginRight: 4 }} /> Add Meal
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Meal</DialogTitle>
                                    </DialogHeader>
                                    <Stack component="form" onSubmit={handleCreate} spacing={2}>
                                        <Box sx={{ display: 'grid', gap: 1 }}>
                                            <FormLabel>Date</FormLabel>
                                            <Input
                                                type="date"
                                                value={data.planned_date}
                                                onChange={(e) => setData('planned_date', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.planned_date} />
                                        </Box>

                                        <Box sx={{ display: 'grid', gap: 1 }}>
                                            <FormLabel>Recipe</FormLabel>
                                            <FormControl fullWidth size="small">
                                                <MuiSelect value={data.recipe_id} onChange={(e) => setData('recipe_id', e.target.value)} displayEmpty>
                                                    <MenuItem value="">— No recipe —</MenuItem>
                                                    {recipes.map((r) => (
                                                        <MenuItem key={r.id} value={String(r.id)}>
                                                            {r.title}
                                                        </MenuItem>
                                                    ))}
                                                </MuiSelect>
                                            </FormControl>
                                            <InputError message={errors.recipe_id} />
                                        </Box>

                                        <Box sx={{ display: 'grid', gap: 1 }}>
                                            <FormLabel>Meal type</FormLabel>
                                            <FormControl fullWidth size="small">
                                                <MuiSelect value={data.meal_type} onChange={(e) => setData('meal_type', e.target.value)}>
                                                    {mealTypes.map((t) => (
                                                        <MenuItem key={t.value} value={t.value}>
                                                            {t.label}
                                                        </MenuItem>
                                                    ))}
                                                </MuiSelect>
                                            </FormControl>
                                            <InputError message={errors.meal_type} />
                                        </Box>

                                        <Box sx={{ display: 'grid', gap: 1 }}>
                                            <Input
                                                label="Servings"
                                                type="number"
                                                value={data.servings}
                                                onChange={(e) => setData('servings', e.target.value)}
                                                placeholder="Leave blank to use recipe default"
                                            />
                                            <InputError message={errors.servings} />
                                        </Box>

                                        <Box sx={{ display: 'grid', gap: 1 }}>
                                            <Input
                                                label="Notes"
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                placeholder="Optional notes"
                                            />
                                            <InputError message={errors.notes} />
                                        </Box>

                                        {shoppingLists.length > 0 && (
                                            <Box sx={{ display: 'grid', gap: 1 }}>
                                                <FormLabel>Add ingredients to shopping list</FormLabel>
                                                <FormControl fullWidth size="small">
                                                    <MuiSelect
                                                        value={data.shopping_list_id}
                                                        onChange={(e) => setData('shopping_list_id', e.target.value)}
                                                        displayEmpty
                                                    >
                                                        <MenuItem value="">— Don't add —</MenuItem>
                                                        {shoppingLists.map((l) => (
                                                            <MenuItem key={l.id} value={String(l.id)}>
                                                                {l.name}
                                                            </MenuItem>
                                                        ))}
                                                    </MuiSelect>
                                                </FormControl>
                                            </Box>
                                        )}

                                        <Button type="submit" disabled={processing}>
                                            Save Meal
                                        </Button>
                                    </Stack>
                                </DialogContent>
                            </Dialog>

                            {/* AI Auto-Plan dialog */}
                            <Dialog
                                open={aiPlanOpen}
                                onOpenChange={(open) => {
                                    setAiPlanOpen(open);

                                    if (!open) {
                                        setAiSuggestions(null);
                                        setAiError(null);
                                    }
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                        <Sparkles size={16} style={{ marginRight: 4 }} /> Auto Plan Week
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Auto Plan Week</DialogTitle>
                                    </DialogHeader>
                                    <Stack spacing={2}>
                                        {!aiSuggestions ? (
                                            <>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    Let AI suggest dinners for each day of the week based on your saved recipes.
                                                </Typography>
                                                <Box sx={{ display: 'grid', gap: 1 }}>
                                                    <FormLabel>Preferences (optional)</FormLabel>
                                                    <Input
                                                        placeholder="e.g. no fish, vegetarian on Wednesday"
                                                        value={aiPreferences}
                                                        onChange={(e) => setAiPreferences(e.target.value)}
                                                    />
                                                </Box>
                                                {shoppingLists.length > 0 && (
                                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                                        <FormLabel>Add ingredients to shopping list (optional)</FormLabel>
                                                        <FormControl fullWidth size="small">
                                                            <MuiSelect
                                                                value={aiShoppingListId}
                                                                onChange={(e) => setAiShoppingListId(e.target.value)}
                                                                displayEmpty
                                                            >
                                                                <MenuItem value="">— Don't add —</MenuItem>
                                                                {shoppingLists.map((l) => (
                                                                    <MenuItem key={l.id} value={String(l.id)}>
                                                                        {l.name}
                                                                    </MenuItem>
                                                                ))}
                                                            </MuiSelect>
                                                        </FormControl>
                                                    </Box>
                                                )}
                                                {aiError && (
                                                    <Typography variant="body2" sx={{ color: 'error.main' }}>
                                                        {aiError}
                                                    </Typography>
                                                )}
                                                <Button onClick={fetchAiSuggestions} disabled={aiLoading}>
                                                    {aiLoading ? (
                                                        <>
                                                            <Loader2 size={16} style={{ marginRight: 4, animation: 'spin 1s linear infinite' }} />
                                                            Thinking…
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles size={16} style={{ marginRight: 4 }} /> Generate Suggestions
                                                        </>
                                                    )}
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    Here's the AI-suggested plan. Accept to add these meals to your calendar.
                                                </Typography>
                                                <Stack spacing={0.75}>
                                                    {aiSuggestions.map((s, i) => (
                                                        <Box
                                                            key={i}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1,
                                                                p: 1,
                                                                borderRadius: 1,
                                                                border: (t) => `1px solid ${t.palette.divider}`,
                                                                bgcolor: 'background.paper',
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                sx={{ fontWeight: 600, minWidth: 80, color: 'text.secondary' }}
                                                            >
                                                                {new Date(s.planned_date + 'T00:00:00').toLocaleDateString(undefined, {
                                                                    weekday: 'short',
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                })}
                                                            </Typography>
                                                            <Chip
                                                                label={s.meal_type}
                                                                size="small"
                                                                sx={{ height: 18, fontSize: '0.65rem', textTransform: 'capitalize' }}
                                                            />
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    flex: 1,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {s.recipe_title}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button variant="outline" onClick={() => setAiSuggestions(null)} style={{ flex: 1 }}>
                                                        Regenerate
                                                    </Button>
                                                    <Button onClick={acceptAiSuggestions} style={{ flex: 1 }}>
                                                        Accept Plan
                                                    </Button>
                                                </Box>
                                            </>
                                        )}
                                    </Stack>
                                </DialogContent>
                            </Dialog>
                        </Box>
                    </Box>

                    {/* Grocery list selection dialog */}
                    <Dialog open={groceryListOpen} onOpenChange={setGroceryListOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add to Shopping List</DialogTitle>
                            </DialogHeader>
                            <Stack spacing={2}>
                                <FormControl fullWidth size="small">
                                    <MuiSelect value={selectedListId} onChange={(e) => setSelectedListId(e.target.value)} displayEmpty>
                                        <MenuItem value="">Select a list</MenuItem>
                                        {shoppingLists.map((l) => (
                                            <MenuItem key={l.id} value={String(l.id)}>
                                                {l.name}
                                            </MenuItem>
                                        ))}
                                    </MuiSelect>
                                </FormControl>
                                <Button onClick={addGroceries} disabled={!selectedListId}>
                                    Add Ingredients
                                </Button>
                            </Stack>
                        </DialogContent>
                    </Dialog>

                    {/* Main layout: 7-day grid + recipe panel */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        {/* 7-day grid */}
                        <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: 0, overflowX: 'auto' }}>
                            {weekDays.map((day, idx) => {
                                const dateStr = toDateString(day);
                                const dayMeals = getMealsForDate(dateStr);
                                const isToday = toDateString(new Date()) === dateStr;
                                const isDropTarget = dropTargetDate === dateStr && dragRecipeId !== null;

                                return (
                                    <DayColumn
                                        key={dateStr}
                                        onDragOver={(e) => onDayDragOver(e, dateStr)}
                                        onDragLeave={onDayDragLeave}
                                        onDrop={(e) => onDayDrop(e, dateStr)}
                                        sx={
                                            isDropTarget
                                                ? { borderColor: 'primary.main', backgroundColor: (t) => alpha(t.palette.primary.main, 0.05) }
                                                : {}
                                        }
                                    >
                                        <DayHeader>
                                            <Typography
                                                variant="caption"
                                                sx={{ fontWeight: 600, color: isToday ? 'primary.main' : 'text.secondary' }}
                                            >
                                                {DAY_NAMES[idx]}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: isToday ? 700 : 400 }}>
                                                {day.getDate()}
                                            </Typography>
                                        </DayHeader>
                                        <DayBody>
                                            {dayMeals.map((meal) => (
                                                <MealCard key={meal.id}>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontWeight: 600,
                                                                display: 'block',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {meal.recipe?.title ?? 'Meal'}
                                                        </Typography>
                                                        <Chip
                                                            label={meal.meal_type}
                                                            size="small"
                                                            sx={{ height: 16, fontSize: '0.65rem', mt: 0.25, textTransform: 'capitalize' }}
                                                        />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', flexShrink: 0 }}>
                                                        {meal.recipe_id && shoppingLists.length > 0 && (
                                                            <Tooltip title="Add to shopping list">
                                                                <IconButton size="small" onClick={() => openGroceryDialog(meal.id)}>
                                                                    <ShoppingCart size={12} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip title="Remove">
                                                            <IconButton size="small" onClick={() => handleDelete(meal)}>
                                                                <Trash2 size={12} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </MealCard>
                                            ))}
                                        </DayBody>
                                    </DayColumn>
                                );
                            })}
                        </Box>

                        {/* Recipe panel */}
                        <Box
                            sx={{
                                width: 200,
                                flexShrink: 0,
                                border: (t) => `1px solid ${t.palette.divider}`,
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            <Box sx={{ p: 1.5, borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                                    Recipes
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                    Drag to a day
                                </Typography>
                            </Box>
                            <Stack spacing={0.75} sx={{ p: 1, maxHeight: 480, overflowY: 'auto' }}>
                                {recipes.length === 0 ? (
                                    <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', py: 2, display: 'block' }}>
                                        No recipes yet.
                                    </Typography>
                                ) : (
                                    recipes.map((recipe) => (
                                        <RecipeCard key={recipe.id} draggable onDragStart={() => onRecipeDragStart(recipe.id)} onDragEnd={onDragEnd}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontWeight: 500,
                                                    display: 'block',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {recipe.title}
                                            </Typography>
                                            {recipe.category && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                                                    {recipe.category}
                                                </Typography>
                                            )}
                                        </RecipeCard>
                                    ))
                                )}
                            </Stack>
                        </Box>
                    </Box>
                </Box>
            </AppLayout>
        </>
    );
}
