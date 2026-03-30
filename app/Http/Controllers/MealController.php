<?php

namespace App\Http\Controllers;

use App\Enums\MealType;
use App\Http\Resources\MealResource;
use App\Jobs\AggregateMealGroceries;
use App\Models\Meal;
use App\Models\Recipe;
use App\Models\ShoppingList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MealController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Meal::class);

        $family = $request->user()->family;

        // Default to current week (Monday)
        $weekStart = $request->get('week', now()->startOfWeek()->toDateString());

        $meals = MealResource::collection(
            Meal::query()
                ->forFamily($family->id)
                ->forWeek($weekStart)
                ->with(['recipe.ingredients', 'creator:id,name'])
                ->orderBy('planned_date')
                ->orderBy('meal_type')
                ->get()
        )->resolve();

        $recipes = Recipe::query()
            ->forFamily($family->id)
            ->with(['creator:id,name'])
            ->orderBy('title')
            ->get(['id', 'title', 'servings', 'category', 'photo_path', 'rating', 'is_favorite'])
            ->toArray();

        $shoppingLists = $family->shoppingLists()->select('id', 'name')->orderBy('created_at')->get()->toArray();

        return Inertia::render('Meals/Index', [
            'meals' => $meals,
            'recipes' => $recipes,
            'shoppingLists' => $shoppingLists,
            'weekStart' => $weekStart,
            'mealTypes' => collect(MealType::cases())->map(fn ($t) => [
                'value' => $t->value,
                'label' => $t->label(),
            ])->all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Meal::class);

        $validated = $request->validate([
            'recipe_id' => ['nullable', 'integer', Rule::exists('recipes', 'id')->where('family_id', $request->user()->family_id)],
            'planned_date' => ['required', 'date'],
            'meal_type' => ['required', 'string', 'in:breakfast,lunch,dinner,snack'],
            'servings' => ['nullable', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:500'],
            'shopping_list_id' => ['nullable', 'integer', Rule::exists('shopping_lists', 'id')->where('family_id', $request->user()->family_id)],
        ]);

        if (! empty($validated['shopping_list_id']) && ! empty($validated['recipe_id'])) {
            $shoppingList = ShoppingList::findOrFail($validated['shopping_list_id']);
            $this->authorize('addItem', $shoppingList);
        }

        $meal = Meal::create(array_merge(
            collect($validated)->except('shopping_list_id')->all(),
            [
                'family_id' => $request->user()->family_id,
                'created_by' => $request->user()->id,
            ]
        ));

        // If a shopping list was specified and the meal has a recipe, aggregate groceries
        if (! empty($validated['shopping_list_id']) && $meal->recipe_id) {
            AggregateMealGroceries::dispatch($meal->id, $validated['shopping_list_id']);
        }

        return back();
    }

    public function update(Request $request, Meal $meal): RedirectResponse
    {
        $this->authorize('update', $meal);

        $validated = $request->validate([
            'recipe_id' => ['nullable', 'integer', Rule::exists('recipes', 'id')->where('family_id', $request->user()->family_id)],
            'planned_date' => ['sometimes', 'date'],
            'meal_type' => ['sometimes', 'string', 'in:breakfast,lunch,dinner,snack'],
            'servings' => ['nullable', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $meal->update($validated);

        return back();
    }

    public function destroy(Request $request, Meal $meal): RedirectResponse
    {
        $this->authorize('delete', $meal);

        $meal->delete();

        return back();
    }

    public function aggregateGroceries(Request $request, Meal $meal): RedirectResponse
    {
        $this->authorize('view', $meal);

        $validated = $request->validate([
            'shopping_list_id' => ['required', 'integer', Rule::exists('shopping_lists', 'id')->where('family_id', $request->user()->family_id)],
        ]);

        $shoppingList = ShoppingList::findOrFail($validated['shopping_list_id']);
        $this->authorize('addItem', $shoppingList);

        // Ensure the shopping list belongs to the same family
        abort_unless($shoppingList->family_id === $request->user()->family_id, 403);

        if ($meal->recipe_id) {
            AggregateMealGroceries::dispatch($meal->id, $validated['shopping_list_id']);
        }

        return back();
    }
}
