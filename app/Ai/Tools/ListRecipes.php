<?php

namespace App\Ai\Tools;

use App\Models\Recipe;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class ListRecipes implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'List recipes for the family with optional filters. Call this when the user asks to see, find, or browse recipes.';
    }

    public function handle(Request $request): string
    {
        $recipes = Recipe::query()
            ->forFamily($this->user->family_id)
            ->when($request['category'] ?? null, fn ($q) => $q->where('category', $request['category']))
            ->when($request['is_favorite'] ?? false, fn ($q) => $q->where('is_favorite', true))
            ->when($request['search'] ?? null, fn ($q) => $q->search($request['search']))
            ->orderBy('title')
            ->limit(20)
            ->get();

        if ($recipes->isEmpty()) {
            return 'No recipes found matching that criteria.';
        }

        return $recipes->map(function (Recipe $recipe) {
            $category = $recipe->category?->value ?? 'uncategorised';
            $time = $recipe->totalTimeMinutes() > 0 ? " ({$recipe->totalTimeMinutes()} min)" : '';
            $fav = $recipe->is_favorite ? ' ★' : '';

            return "• [ID:{$recipe->id}] [{$category}] {$recipe->title}{$time}{$fav}";
        })->implode("\n");
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'category' => $schema->string()->description('Filter by category: breakfast, lunch, dinner, snack, dessert, or beverage'),
            'is_favorite' => $schema->boolean()->description('Only show favourite recipes'),
            'search' => $schema->string()->description('Search term to filter recipes by title or description'),
        ];
    }
}
