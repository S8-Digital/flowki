<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Meal;
use App\Models\ShoppingList;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class AggregateMealGroceries implements ShouldQueue
{
    use Queueable;

    /**
     * @param  int  $mealId  The meal whose recipe ingredients should be added to the shopping list
     * @param  int  $shoppingListId  The shopping list to add items to
     */
    public function __construct(
        public readonly int $mealId,
        public readonly int $shoppingListId,
    ) {}

    /**
     * Scale the meal's recipe ingredients and add them to the shopping list.
     */
    public function handle(): void
    {
        $meal = Meal::with(['recipe.ingredients'])->find($this->mealId);

        if (! $meal || ! $meal->recipe) {
            return;
        }

        $shoppingList = ShoppingList::find($this->shoppingListId);

        if (! $shoppingList) {
            return;
        }

        $recipeServings = $meal->recipe->servings ?? 1;
        $plannedServings = $meal->servings ?? $recipeServings;
        $scaleFactor = $recipeServings > 0 ? $plannedServings / $recipeServings : 1;

        foreach ($meal->recipe->ingredients as $ingredient) {
            $scaledQuantity = $this->scaleQuantity($ingredient->quantity, $scaleFactor);

            $shoppingList->items()->create([
                'name' => $ingredient->name,
                'quantity' => $scaledQuantity,
                'added_by' => $meal->created_by,
            ]);
        }
    }

    /**
     * Scale a quantity string by a factor. Returns original if not numeric.
     */
    private function scaleQuantity(?string $quantity, float $factor): ?string
    {
        if ($quantity === null || $factor == 1.0) {
            return $quantity;
        }

        // Extract leading numeric part (e.g. "200g" → 200, "1 cup" → 1)
        if (preg_match('/^(\d+(?:\.\d+)?)\s*(.*)$/', $quantity, $matches)) {
            $scaled = round((float) $matches[1] * $factor, 2);
            $unit = $matches[2];

            return $unit !== '' ? "{$scaled} {$unit}" : (string) $scaled;
        }

        return $quantity;
    }
}
