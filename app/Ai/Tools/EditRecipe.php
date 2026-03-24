<?php

namespace App\Ai\Tools;

use App\Models\Recipe;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\DB;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class EditRecipe implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Edit an existing recipe\'s attributes and ingredients. Call this when the user asks to update or change a recipe. Use list_recipes to find the recipe ID first.';
    }

    public function handle(Request $request): string
    {
        $recipe = Recipe::query()
            ->forFamily($this->user->family_id)
            ->find($request['recipe_id']);

        if (! $recipe) {
            return 'Error: recipe not found. Use list_recipes to find the correct recipe ID.';
        }

        try {
            DB::transaction(function () use ($request, $recipe) {
                $fields = array_filter([
                    'title' => $request['title'] ?? null,
                    'description' => $request['description'] ?? null,
                    'category' => $request['category'] ?? null,
                    'servings' => $request['servings'] ?? null,
                    'prep_time_minutes' => $request['prep_time_minutes'] ?? null,
                    'cook_time_minutes' => $request['cook_time_minutes'] ?? null,
                    'instructions' => $request['instructions'] ?? null,
                    'rating' => $request['rating'] ?? null,
                    'is_favorite' => isset($request['is_favorite']) ? (bool) $request['is_favorite'] : null,
                ], fn ($v) => $v !== null);

                if (! empty($fields)) {
                    $recipe->update($fields);
                }

                if (isset($request['ingredients'])) {
                    $recipe->ingredients()->delete();
                    foreach ($request['ingredients'] as $index => $ingredient) {
                        $recipe->ingredients()->create([
                            'name' => $ingredient['name'],
                            'quantity' => $ingredient['quantity'] ?? null,
                            'unit' => $ingredient['unit'] ?? null,
                            'notes' => $ingredient['notes'] ?? null,
                            'sort_order' => $index,
                        ]);
                    }
                }
            });
        } catch (\Throwable $e) {
            report($e);

            return 'Error: failed to update recipe. Please check the input and try again.';
        }

        return "✓ Recipe updated: \"{$recipe->title}\" (ID: {$recipe->id})";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'recipe_id' => $schema->integer()->description('ID of the recipe to edit')->required(),
            'title' => $schema->string()->description('New recipe title'),
            'description' => $schema->string()->description('New description'),
            'category' => $schema->string()->description('New category: breakfast, lunch, dinner, snack, dessert, or beverage'),
            'servings' => $schema->integer()->description('New number of servings'),
            'prep_time_minutes' => $schema->integer()->description('New preparation time in minutes'),
            'cook_time_minutes' => $schema->integer()->description('New cooking time in minutes'),
            'instructions' => $schema->string()->description('New step-by-step cooking instructions'),
            'rating' => $schema->integer()->description('Rating from 1 to 5'),
            'is_favorite' => $schema->boolean()->description('Mark or unmark as a favourite'),
            'ingredients' => $schema->array()->description('Replacement ingredient list. Each entry needs "name" and optionally "quantity", "unit", and "notes". Replaces all existing ingredients.'),
        ];
    }
}
