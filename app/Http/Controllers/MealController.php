<?php

namespace App\Http\Controllers;

use App\Ai\MealPlannerAgent;
use App\Enums\MealType;
use App\Http\Resources\MealResource;
use App\Jobs\AggregateMealGroceries;
use App\Models\Meal;
use App\Models\Recipe;
use App\Models\ShoppingList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

    /**
     * Use AI to suggest meals for the week and return structured JSON for the UI preview.
     */
    public function aiSuggest(Request $request): JsonResponse
    {
        $this->authorize('create', Meal::class);

        $validated = $request->validate([
            'week_start' => ['nullable', 'date_format:Y-m-d'],
            'preferences' => ['nullable', 'string', 'max:500'],
        ]);

        if (! config('ai.providers.'.config('ai.default').'.key')) {
            return response()->json(['error' => 'AI is not configured on this server.'], 503);
        }

        $user = $request->user();
        $weekStart = $validated['week_start'] ?? now()->startOfWeek()->toDateString();
        $preferences = $validated['preferences'] ?? null;

        try {
            $agent = new MealPlannerAgent($user, $weekStart, $preferences);
            $raw = $agent->prompt('Suggest meals for this week.');

            // Strip markdown code fences if the model wraps JSON in them
            $json = preg_replace('/^```(?:json)?\s*/i', '', trim($raw));
            $json = preg_replace('/\s*```$/', '', $json);

            $suggestions = json_decode($json, true);

            if (! is_array($suggestions)) {
                return response()->json(['error' => 'AI returned an unexpected response. Please try again.'], 502);
            }

            // Handle no-recipes error object
            if (isset($suggestions['error'])) {
                return response()->json($suggestions, 422);
            }

            return response()->json(['suggestions' => $suggestions]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json(['error' => 'Failed to generate suggestions. Please try again.'], 500);
        }
    }

    /**
     * Bulk-create meals from AI suggestions that the user has accepted.
     */
    public function bulkStore(Request $request): RedirectResponse
    {
        $this->authorize('create', Meal::class);

        $validated = $request->validate([
            'meals' => ['required', 'array', 'min:1', 'max:21'],
            'meals.*.planned_date' => ['required', 'date'],
            'meals.*.meal_type' => ['required', 'string', 'in:breakfast,lunch,dinner,snack'],
            'meals.*.recipe_id' => ['nullable', 'integer', Rule::exists('recipes', 'id')->where('family_id', $request->user()->family_id)],
            'meals.*.servings' => ['nullable', 'integer', 'min:1'],
            'meals.*.notes' => ['nullable', 'string', 'max:500'],
            'shopping_list_id' => ['nullable', 'integer', Rule::exists('shopping_lists', 'id')->where('family_id', $request->user()->family_id)],
        ]);

        $shoppingListId = $validated['shopping_list_id'] ?? null;

        if ($shoppingListId) {
            $shoppingList = ShoppingList::findOrFail($shoppingListId);
            $this->authorize('addItem', $shoppingList);
        }

        DB::transaction(function () use ($validated, $shoppingListId, $request) {
            foreach ($validated['meals'] as $entry) {
                $meal = Meal::create([
                    'family_id' => $request->user()->family_id,
                    'created_by' => $request->user()->id,
                    'recipe_id' => $entry['recipe_id'] ?? null,
                    'planned_date' => $entry['planned_date'],
                    'meal_type' => $entry['meal_type'],
                    'servings' => $entry['servings'] ?? null,
                    'notes' => $entry['notes'] ?? null,
                ]);

                if ($shoppingListId && $meal->recipe_id) {
                    AggregateMealGroceries::dispatch($meal->id, (int) $shoppingListId);
                }
            }
        });

        return back();
    }
}
