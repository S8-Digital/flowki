<?php

namespace App\Ai\Tools;

use App\Models\Recipe;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class DeleteRecipe implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Delete a recipe. Call this when the user asks to remove or delete a recipe. Use list_recipes to find the recipe ID first.';
    }

    public function handle(Request $request): string
    {
        $recipe = Recipe::query()
            ->forFamily($this->user->family_id)
            ->find($request['recipe_id']);

        if (! $recipe) {
            return 'Error: recipe not found. Use list_recipes to find the correct recipe ID.';
        }

        $title = $recipe->title;
        $recipe->delete();

        return "✓ Recipe deleted: \"{$title}\"";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'recipe_id' => $schema->integer()->description('ID of the recipe to delete')->required(),
        ];
    }
}
