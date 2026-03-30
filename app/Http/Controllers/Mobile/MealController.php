<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\MealResource;
use App\Jobs\AggregateMealGroceries;
use App\Models\Meal;
use App\Models\ShoppingList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class MealController extends Controller
{
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
        abort_unless($shoppingList->family_id === $request->user()->family_id, 403);

        if ($meal->recipe_id) {
            AggregateMealGroceries::dispatch($meal->id, $validated['shopping_list_id']);
        }

        return response()->json(['message' => 'Ingredients added to shopping list.']);
    }
}
