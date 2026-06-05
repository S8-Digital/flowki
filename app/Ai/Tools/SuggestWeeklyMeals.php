<?php

namespace App\Ai\Tools;

use App\Models\Meal;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class SuggestWeeklyMeals implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Retrieve available recipes and the current week\'s meals so you can suggest a full weekly meal plan. Call this when the user asks you to plan meals for the week, auto-plan, or suggest weekly meals.';
    }

    public function handle(Request $request): string
    {
        if (! $this->user->family_id) {
            return 'Error: user is not part of a family.';
        }

        $weekStart = $request['week_start'] ?? now()->startOfWeek()->toDateString();

        // Retrieve available recipes
        $recipes = Recipe::query()
            ->forFamily($this->user->family_id)
            ->orderBy('title')
            ->limit(50)
            ->get(['id', 'title', 'category', 'servings', 'is_favorite']);

        if ($recipes->isEmpty()) {
            return 'No recipes are saved yet. Please add some recipes before planning meals.';
        }

        // Build list of week dates
        $weekDates = [];
        for ($i = 0; $i < 7; $i++) {
            $date = date('Y-m-d', strtotime($weekStart." +{$i} days"));
            $weekDates[] = date('l, d M Y', strtotime($date))." ({$date})";
        }

        // Show existing meals this week to avoid duplicates
        $existingMeals = Meal::query()
            ->forFamily($this->user->family_id)
            ->forWeek($weekStart)
            ->with('recipe:id,title')
            ->get();

        $recipeList = $recipes->map(function (Recipe $recipe) {
            $category = $recipe->category?->value ?? 'uncategorised';
            $fav = $recipe->is_favorite ? ' ★' : '';

            return "  • [ID:{$recipe->id}] {$recipe->title} ({$category}){$fav}";
        })->implode("\n");

        $existingList = $existingMeals->isEmpty()
            ? '  None'
            : $existingMeals->map(fn ($m) => "  • {$m->planned_date?->toDateString()} – {$m->meal_type?->value}: ".($m->recipe?->title ?? 'custom'))->implode("\n");

        $preferences = $request['preferences'] ?? null;
        $prefLine = $preferences ? "\nUser preferences: {$preferences}" : '';

        return <<<TEXT
        Week starting: {$weekStart}
        Days:
        {$this->formatList($weekDates)}

        Available recipes:
        {$recipeList}

        Already planned this week:
        {$existingList}
        {$prefLine}

        Please suggest a meal plan (primarily dinners, optionally lunches) for the 7-day week above using the available recipes. Once the user accepts your suggestion, call `accept_meal_suggestions` with the agreed plan to create the meals.
        TEXT;
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'week_start' => $schema->string()->description('Week start date in YYYY-MM-DD format. Defaults to this Monday if not provided.'),
            'preferences' => $schema->string()->description('Optional dietary preferences or constraints, e.g. "no fish", "vegetarian on Wednesdays".'),
        ];
    }

    /** @param  string[]  $items */
    private function formatList(array $items): string
    {
        return implode("\n", array_map(fn ($i) => "  • {$i}", $items));
    }
}
