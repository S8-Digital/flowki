<?php

namespace App\Http\Controllers;

use App\Enums\DashboardWidgetType;
use App\Models\CalendarEvent;
use App\Models\DashboardWidget;
use App\Models\Meal;
use App\Models\ShoppingList;
use App\Models\Todo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $family = $user->family;

        if (! $family) {
            return redirect()->route('family.create');
        }

        $widgets = $user->dashboardWidgets()->get();

        if ($widgets->isEmpty()) {
            $this->createDefaultWidgets($user->id);
            $widgets = $user->dashboardWidgets()->get();
        }

        $shoppingLists = $family->shoppingLists()->select('id', 'name')->get()->toArray();

        $todoCategories = $family->getTodoCategories();

        return Inertia::render('Dashboard', [
            'widgets' => $widgets->map(fn ($w) => [
                'id' => $w->id,
                'type' => $w->type->value,
                'position' => $w->position,
                'settings' => $w->settings ?? [],
            ])->values()->all(),
            'widgetTypes' => collect(DashboardWidgetType::cases())->map(fn ($t) => [
                'value' => $t->value,
                'label' => $t->label(),
            ])->all(),
            'shoppingLists' => $shoppingLists,
            'todoCategories' => $todoCategories,
            'calendarEvents' => $this->getUpcomingEvents($family->id),
            'todosToday' => $this->getTodayTodos($family->id, $user->id),
            'shoppingItems' => $this->getShoppingItems($family->id),
            'weekDinners' => $this->getWeekDinners($family->id),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::enum(DashboardWidgetType::class)],
            'settings' => ['nullable', 'array'],
        ]);

        $position = DashboardWidget::where('user_id', $request->user()->id)->max('position') + 1;

        DashboardWidget::create([
            'user_id' => $request->user()->id,
            'type' => $validated['type'],
            'position' => $position,
            'settings' => $validated['settings'] ?? [],
        ]);

        return back();
    }

    public function update(Request $request, DashboardWidget $dashboardWidget): RedirectResponse
    {
        abort_unless($dashboardWidget->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'settings' => ['nullable', 'array'],
        ]);

        $dashboardWidget->update(['settings' => $validated['settings'] ?? []]);

        return back();
    }

    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer'],
        ]);

        foreach ($validated['order'] as $position => $widgetId) {
            DashboardWidget::where('id', $widgetId)
                ->where('user_id', $request->user()->id)
                ->update(['position' => $position]);
        }

        return back();
    }

    public function destroy(Request $request, DashboardWidget $dashboardWidget): RedirectResponse
    {
        abort_unless($dashboardWidget->user_id === $request->user()->id, 403);
        $dashboardWidget->delete();

        return back();
    }

    /** @return array<int, mixed> */
    private function getUpcomingEvents(int $familyId): array
    {
        return CalendarEvent::query()
            ->forFamily($familyId)
            ->where('start_at', '>=', now())
            ->where('start_at', '<=', now()->addDays(14))
            ->orderBy('start_at')
            ->limit(10)
            ->get(['id', 'title', 'start_at', 'end_at', 'is_all_day', 'color', 'location'])
            ->toArray();
    }

    /** @return array<int, mixed> */
    private function getTodayTodos(int $familyId, int $userId): array
    {
        return Todo::query()
            ->forFamily($familyId)
            ->where('assigned_to', $userId)
            ->whereDate('due_date', today())
            ->where('status', '!=', 'completed')
            ->orderBy('priority')
            ->limit(10)
            ->get(['id', 'title', 'status', 'priority', 'category', 'due_date'])
            ->toArray();
    }

    /** @return array<int, mixed> */
    private function getShoppingItems(int $familyId): array
    {
        return ShoppingList::query()
            ->forFamily($familyId)
            ->with(['items' => fn ($q) => $q->where('is_checked', false)->limit(20)])
            ->get(['id', 'name'])
            ->mapWithKeys(fn ($list) => [
                $list->id => [
                    'id' => $list->id,
                    'name' => $list->name,
                    'items' => $list->items->map(fn ($item) => [
                        'id' => $item->id,
                        'name' => $item->name,
                        'quantity' => $item->quantity,
                        'category' => $item->category,
                        'is_checked' => $item->is_checked,
                    ])->values()->all(),
                ],
            ])
            ->all();
    }

    /** @return array<int, mixed> */
    private function getWeekDinners(int $familyId): array
    {
        return Meal::query()
            ->forFamily($familyId)
            ->forWeek(now()->startOfWeek()->toDateString())
            ->where('meal_type', 'dinner')
            ->with(['recipe:id,title,photo_path,rating'])
            ->orderBy('planned_date')
            ->get()
            ->map(fn ($meal) => [
                'id' => $meal->id,
                'planned_date' => $meal->planned_date?->toDateString(),
                'meal_type' => $meal->meal_type?->value,
                'notes' => $meal->notes,
                'recipe' => $meal->recipe ? [
                    'id' => $meal->recipe->id,
                    'title' => $meal->recipe->title,
                    'photo_path' => $meal->recipe->photo_path,
                    'rating' => $meal->recipe->rating,
                ] : null,
            ])
            ->all();
    }

    private function createDefaultWidgets(int $userId): void
    {
        $defaults = [
            ['type' => DashboardWidgetType::CalendarSchedule, 'position' => 0],
            ['type' => DashboardWidgetType::CalendarToday, 'position' => 1],
            ['type' => DashboardWidgetType::TodoList, 'position' => 2],
            ['type' => DashboardWidgetType::ShoppingList, 'position' => 3],
        ];

        foreach ($defaults as $default) {
            DashboardWidget::create([
                'user_id' => $userId,
                'type' => $default['type'],
                'position' => $default['position'],
                'settings' => [],
            ]);
        }
    }
}
