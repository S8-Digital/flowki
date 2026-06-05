<?php

namespace App\Ai;

use App\Models\Recipe;
use App\Models\User;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;

/**
 * Specialist agent that generates a structured weekly meal plan as JSON.
 *
 * Unlike the conversational FamilyAssistantAgent, this agent is used
 * non-interactively by the HTTP endpoint to return a machine-parseable
 * JSON array of meal suggestions that the UI can preview before accepting.
 */
class MealPlannerAgent implements Agent
{
    use Promptable;

    /**
     * @param  string  $weekStart  ISO date of the Monday to plan
     * @param  string|null  $preferences  Optional user preferences / constraints
     */
    public function __construct(
        protected User $user,
        protected string $weekStart,
        protected ?string $preferences = null,
    ) {}

    public function instructions(): string
    {
        $recipes = Recipe::query()
            ->forFamily($this->user->family_id)
            ->orderBy('is_favorite', 'desc')
            ->orderBy('title')
            ->limit(50)
            ->get(['id', 'title', 'category', 'servings']);

        if ($recipes->isEmpty()) {
            return <<<MARKDOWN
            You are a meal planner. The family has no saved recipes yet.
            Respond with exactly this JSON and nothing else:
            {"error":"no_recipes","message":"No recipes found. Please add some recipes first."}
            MARKDOWN;
        }

        $recipeJson = $recipes->map(fn (Recipe $r) => [
            'id' => $r->id,
            'title' => $r->title,
            'category' => $r->category?->value,
        ])->values()->toJson();

        $prefLine = $this->preferences ? "User preferences: {$this->preferences}" : '';

        return <<<MARKDOWN
        You are a meal planner for a family organiser app. Today you must return ONLY valid JSON — no markdown, no explanation, no code fences.

        Plan 7 dinners (one per day) for the week starting {$this->weekStart}, using the available recipes below.
        Vary the selections. Prefer favourite recipes. Only use recipes from the list provided.

        {$prefLine}

        Available recipes (JSON):
        {$recipeJson}

        Return a JSON array where each element has:
        - "planned_date": ISO date string (YYYY-MM-DD)
        - "meal_type": always "dinner"
        - "recipe_id": integer ID from the list above
        - "recipe_title": string recipe title (for display only)

        Example format (do not copy, use actual data):
        [{"planned_date":"2025-06-02","meal_type":"dinner","recipe_id":1,"recipe_title":"Spaghetti Bolognese"},...]

        Return ONLY the JSON array. No other text.
        MARKDOWN;
    }
}
