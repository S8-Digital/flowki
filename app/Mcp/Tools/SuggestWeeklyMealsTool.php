<?php

namespace App\Mcp\Tools;

use App\Models\Meal;
use App\Models\Recipe;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Auth;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Retrieve available family recipes and the current week\'s meal schedule to help suggest a weekly meal plan.')]
class SuggestWeeklyMealsTool extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $user = Auth::user();

        if (! $user?->family_id) {
            return Response::text('Error: User is not part of a family.');
        }

        $input = $request->all();
        $weekStart = $this->resolveWeekStart($input['week_start'] ?? null);

        $recipes = Recipe::query()
            ->forFamily($user->family_id)
            ->orderBy('is_favorite', 'desc')
            ->orderBy('title')
            ->limit(50)
            ->get(['id', 'title', 'category', 'servings', 'is_favorite']);

        if ($recipes->isEmpty()) {
            return Response::text('No recipes found. Please add some recipes before planning meals.');
        }

        $existingMeals = Meal::query()
            ->forFamily($user->family_id)
            ->forWeek($weekStart)
            ->with('recipe:id,title')
            ->get();

        $recipeLines = $recipes->map(function (Recipe $recipe) {
            $fav = $recipe->is_favorite ? ' ★' : '';
            $category = $recipe->category?->value ?? 'uncategorised';

            return "• [ID:{$recipe->id}] {$recipe->title} ({$category}){$fav}";
        })->implode("\n");

        $existingLines = $existingMeals->isEmpty()
            ? 'None planned yet.'
            : $existingMeals->map(fn ($m) => "• {$m->planned_date?->toDateString()} – {$m->meal_type?->value}: ".($m->recipe?->title ?? 'custom'))->implode("\n");

        $preferences = ! empty($input['preferences']) ? "\nPreferences: {$input['preferences']}" : '';

        $weekDates = [];
        for ($i = 0; $i < 7; $i++) {
            $weekDates[] = date('l (Y-m-d)', strtotime($weekStart." +{$i} days"));
        }
        $datesBlock = implode("\n", array_map(fn ($d) => "  • {$d}", $weekDates));

        $text = <<<TEXT
        Week starting: {$weekStart}
        Days:
        {$datesBlock}

        Available recipes:
        {$recipeLines}

        Already planned this week:
        {$existingLines}
        {$preferences}

        Using the available recipes above, suggest a dinner (and optionally a lunch) for each day of the week. For each suggestion include the recipe ID, recipe title, date, and meal type. Once the user confirms, use the meal creation tools to save the plan.
        TEXT;

        return Response::text($text);
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'week_start' => $schema->string()->description('Week start date in YYYY-MM-DD format (defaults to this Monday).'),
            'preferences' => $schema->string()->description('Optional dietary preferences, e.g. "no fish, vegetarian Wednesdays".'),
        ];
    }

    private function resolveWeekStart(mixed $weekStart): string
    {
        if (! is_string($weekStart) || ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $weekStart)) {
            return now()->startOfWeek()->toDateString();
        }

        [$year, $month, $day] = array_map('intval', explode('-', $weekStart));

        return checkdate($month, $day, $year)
            ? $weekStart
            : now()->startOfWeek()->toDateString();
    }
}
