<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\SuggestWeeklyMeals;
use App\Enums\RecipeCategory;
use App\Models\Meal;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Mockery\MockInterface;
use Tests\TestCase;

class SuggestWeeklyMealsToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_returns_error_when_user_has_no_family(): void
    {
        $user = User::factory()->create(['family_id' => null]);
        $tool = new SuggestWeeklyMeals($user);

        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('Error', $result);
    }

    public function test_handle_returns_message_when_no_recipes(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new SuggestWeeklyMeals($user);

        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('No recipes', $result);
    }

    public function test_handle_returns_recipe_list_with_week_dates(): void
    {
        $user = User::factory()->withFamily()->create();
        Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Spaghetti Bolognese',
            'category' => RecipeCategory::Dinner,
        ]);

        $tool = new SuggestWeeklyMeals($user);
        $result = $tool->handle(new Request(['week_start' => '2025-06-02']));

        $this->assertStringContainsString('Spaghetti Bolognese', $result);
        $this->assertStringContainsString('2025-06-02', $result);
    }

    public function test_handle_shows_existing_meals(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Roast Chicken',
            'category' => RecipeCategory::Dinner,
        ]);
        Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'recipe_id' => $recipe->id,
            'planned_date' => '2025-06-02',
            'meal_type' => 'dinner',
        ]);

        $tool = new SuggestWeeklyMeals($user);
        $result = $tool->handle(new Request(['week_start' => '2025-06-02']));

        $this->assertStringContainsString('Roast Chicken', $result);
    }

    public function test_handle_includes_preferences_when_provided(): void
    {
        $user = User::factory()->withFamily()->create();
        Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Fish Tacos',
            'category' => RecipeCategory::Dinner,
        ]);

        $tool = new SuggestWeeklyMeals($user);
        $result = $tool->handle(new Request([
            'week_start' => '2025-06-02',
            'preferences' => 'no seafood',
        ]));

        $this->assertStringContainsString('no seafood', $result);
    }

    public function test_handle_does_not_return_other_family_recipes(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        Recipe::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Secret Recipe',
            'category' => RecipeCategory::Dinner,
        ]);

        $tool = new SuggestWeeklyMeals($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('No recipes', $result);
    }

    public function test_handle_uses_current_week_when_no_week_start_provided(): void
    {
        $user = User::factory()->withFamily()->create();
        Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Pasta',
            'category' => RecipeCategory::Dinner,
        ]);

        $tool = new SuggestWeeklyMeals($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString(now()->startOfWeek()->toDateString(), $result);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertNotEmpty((new SuggestWeeklyMeals($user))->description());
    }

    public function test_schema_contains_expected_fields(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new SuggestWeeklyMeals($user);

        /** @var JsonSchema&MockInterface $schema */
        $schema = \Mockery::mock(JsonSchema::class);
        $schema->shouldReceive('string')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('description')->andReturnSelf()->zeroOrMoreTimes();

        $fields = $tool->schema($schema);

        $this->assertArrayHasKey('week_start', $fields);
        $this->assertArrayHasKey('preferences', $fields);
    }
}
