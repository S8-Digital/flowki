<?php

namespace App\Ai\Tools;

use App\Jobs\AggregateMealGroceries;
use App\Models\Meal;
use App\Models\Recipe;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\DB;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class AcceptMealSuggestions implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Create meal entries from the agreed weekly meal plan. Call this once the user has accepted the suggested meal plan. Each entry needs a planned_date and meal_type; recipe_id is required for grocery population.';
    }

    public function handle(Request $request): string
    {
        if (! $this->user->family_id) {
            return 'Error: user is not part of a family.';
        }

        $meals = $request['meals'] ?? [];

        if (empty($meals)) {
            return 'Error: no meals provided.';
        }

        $shoppingListId = $request['shopping_list_id'] ?? null;

        // Validate shopping list belongs to family if provided
        if ($shoppingListId) {
            $shoppingList = ShoppingList::query()
                ->forFamily($this->user->family_id)
                ->find($shoppingListId);

            if (! $shoppingList) {
                return 'Error: shopping list not found.';
            }
        }

        try {
            $created = DB::transaction(function () use ($meals, $shoppingListId) {
                $results = [];

                foreach ($meals as $entry) {
                    if (empty($entry['planned_date']) || empty($entry['meal_type'])) {
                        continue;
                    }

                    $recipeId = ! empty($entry['recipe_id']) ? (int) $entry['recipe_id'] : null;

                    // Verify recipe belongs to family
                    if ($recipeId) {
                        $recipeExists = Recipe::query()
                            ->forFamily($this->user->family_id)
                            ->where('id', $recipeId)
                            ->exists();

                        if (! $recipeExists) {
                            $recipeId = null;
                        }
                    }

                    $meal = Meal::create([
                        'family_id' => $this->user->family_id,
                        'created_by' => $this->user->id,
                        'recipe_id' => $recipeId,
                        'planned_date' => $entry['planned_date'],
                        'meal_type' => $entry['meal_type'],
                        'servings' => ! empty($entry['servings']) ? (int) $entry['servings'] : null,
                        'notes' => $entry['notes'] ?? null,
                    ]);

                    if ($shoppingListId && $meal->recipe_id) {
                        AggregateMealGroceries::dispatch($meal->id, (int) $shoppingListId);
                    }

                    $results[] = $meal;
                }

                return $results;
            });
        } catch (\Throwable $e) {
            report($e);

            return 'Error: failed to create meals. Please try again.';
        }

        $count = count($created);
        $groceryNote = $shoppingListId ? ' Ingredients have been added to your shopping list.' : '';

        return "✓ Created {$count} meal(s) for the week.{$groceryNote}";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'meals' => $schema->array()->description('Array of meal entries to create. Each entry must include planned_date (YYYY-MM-DD), meal_type (breakfast/lunch/dinner/snack), and optionally recipe_id, servings, and notes.')->required(),
            'shopping_list_id' => $schema->integer()->description('Optional ID of a shopping list to auto-populate with recipe ingredients.'),
        ];
    }
}
