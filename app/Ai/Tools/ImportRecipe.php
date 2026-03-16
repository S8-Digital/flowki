<?php

namespace App\Ai\Tools;

use App\Enums\RecipeCategory;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class ImportRecipe implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Import a recipe from pasted text or a URL. The input should contain a recipe with a title, ingredients, and instructions. Creates a Recipe record with associated ingredients.';
    }

    public function handle(Request $request): string
    {
        $title = $request['title'] ?? 'Untitled Recipe';
        $ingredients = $request['ingredients'] ?? [];
        $instructions = $request['instructions'] ?? null;

        $recipe = Recipe::create([
            'family_id' => $this->user->family_id,
            'created_by' => $this->user->id,
            'title' => $title,
            'description' => $request['description'] ?? null,
            'category' => $request['category'] ?? RecipeCategory::Dinner->value,
            'servings' => $request['servings'] ?? null,
            'prep_time_minutes' => $request['prep_time_minutes'] ?? null,
            'cook_time_minutes' => $request['cook_time_minutes'] ?? null,
            'instructions' => $instructions,
        ]);

        foreach ($ingredients as $index => $ingredient) {
            $recipe->ingredients()->create([
                'name' => $ingredient['name'],
                'quantity' => $ingredient['quantity'] ?? null,
                'unit' => $ingredient['unit'] ?? null,
                'notes' => $ingredient['notes'] ?? null,
                'sort_order' => $index,
            ]);
        }

        $count = count($ingredients);

        return "✓ Recipe imported: \"{$recipe->title}\" with {$count} ingredient(s)";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->description('The recipe title')->required(),
            'description' => $schema->string()->description('A brief description of the recipe'),
            'category' => $schema->string()->description('breakfast, lunch, dinner, snack, dessert, or beverage'),
            'servings' => $schema->integer()->description('Number of servings'),
            'prep_time_minutes' => $schema->integer()->description('Preparation time in minutes'),
            'cook_time_minutes' => $schema->integer()->description('Cooking time in minutes'),
            'instructions' => $schema->string()->description('Step-by-step cooking instructions')->required(),
            'ingredients' => $schema->array()->description('List of ingredients')->required(),
        ];
    }
}
