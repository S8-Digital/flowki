<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile;

use App\Ai\MealPlannerAgent;
use App\Http\Controllers\Controller;
use App\Http\Resources\MealResource;
use App\Jobs\AggregateMealGroceries;
use App\Models\Meal;
use App\Models\ShoppingList;
use App\Traits\StripsMdFences;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class MealController extends Controller
{
    use StripsMdFences;

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Meal::class);

        $weekStart = (string) $request->get('week', now()->startOfWeek()->toDateString());

        $meals = Meal::query()
            ->forFamily($request->user()->family_id)
            ->forWeek($weekStart)
            ->with(['recipe.ingredients', 'creator:id,name'])
            ->orderBy('planned_date')
            ->orderBy('meal_type')
            ->get();

        return MealResource::collection($meals);
    }

    public function store(Request $request): JsonResponse
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

        if (! empty($validated['shopping_list_id']) && $meal->recipe_id) {
            AggregateMealGroceries::dispatch($meal->id, $validated['shopping_list_id']);
        }

        return (new MealResource($meal->load(['recipe.ingredients', 'creator:id,name'])))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, Meal $meal): JsonResponse
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

        return (new MealResource($meal->fresh(['recipe.ingredients', 'creator:id,name'])))->response();
    }

    public function destroy(Meal $meal): JsonResponse
    {
        $this->authorize('delete', $meal);

        $meal->delete();

        return response()->json(null, 204);
    }

    public function aggregateGroceries(Request $request, Meal $meal): JsonResponse
    {
        $this->authorize('view', $meal);

        $validated = $request->validate([
            'shopping_list_id' => ['required', 'integer', Rule::exists('shopping_lists', 'id')->where('family_id', $request->user()->family_id)],
        ]);

        $shoppingList = ShoppingList::findOrFail($validated['shopping_list_id']);
        $this->authorize('addItem', $shoppingList);
        abort_unless($shoppingList->family_id === $request->user()->family_id, 403);

        if ($meal->recipe_id) {
            AggregateMealGroceries::dispatch($meal->id, $validated['shopping_list_id']);
        }

        return response()->json(['message' => 'Ingredients added to shopping list.']);
    }

    /**
     * Use AI to suggest meals for the week and return structured JSON for the mobile UI preview.
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
            /** @var MealPlannerAgent $agent */
            $agent = app()->makeWith(MealPlannerAgent::class, [
                'user' => $user,
                'weekStart' => $weekStart,
                'preferences' => $preferences,
            ]);
            $response = $agent->prompt('Suggest meals for this week.');

            $json = $this->stripJsonFences($response->text);

            $suggestions = json_decode($json, true);

            if (! is_array($suggestions)) {
                return response()->json(['error' => 'AI returned an unexpected response. Please try again.'], 502);
            }

            if (isset($suggestions['error'])) {
                return response()->json($suggestions, 422);
            }

            if (! $this->hasValidSuggestionShape($suggestions)) {
                return response()->json(['error' => 'AI returned an unexpected response. Please try again.'], 502);
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
    public function bulkCreate(Request $request): JsonResponse
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
                    AggregateMealGroceries::dispatch($meal->id, (int) $shoppingListId)->afterCommit();
                }
            }
        });

        return response()->json(['message' => 'Meals created.'], 201);
    }

    private function hasValidSuggestionShape(array $suggestions): bool
    {
        if (! array_is_list($suggestions)) {
            return false;
        }

        return validator($suggestions, [
            '*.planned_date' => ['required', 'date_format:Y-m-d'],
            '*.meal_type' => ['required', 'string', Rule::in(['breakfast', 'lunch', 'dinner', 'snack'])],
            '*.recipe_id' => ['required', 'integer', 'min:1'],
            '*.recipe_title' => ['required', 'string', 'max:255'],
        ])->passes();
    }
}
