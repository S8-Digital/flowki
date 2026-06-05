<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\AcceptMealSuggestions;
use App\Enums\MealType;
use App\Enums\RecipeCategory;
use App\Models\Meal;
use App\Models\Recipe;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Mockery\MockInterface;
use Tests\TestCase;

class AcceptMealSuggestionsToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_returns_error_when_user_has_no_family(): void
    {
        $user = User::factory()->create(['family_id' => null]);
        $tool = new AcceptMealSuggestions($user);

        $result = $tool->handle(new Request(['meals' => []]));

        $this->assertStringContainsString('Error', $result);
    }

    public function test_handle_returns_error_when_no_meals_provided(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new AcceptMealSuggestions($user);

        $result = $tool->handle(new Request(['meals' => []]));

        $this->assertStringContainsString('Error', $result);
    }

    public function test_handle_creates_meals(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Pasta',
            'category' => RecipeCategory::Dinner,
        ]);

        $tool = new AcceptMealSuggestions($user);
        $result = $tool->handle(new Request([
            'meals' => [
                [
                    'planned_date' => '2025-06-02',
                    'meal_type' => MealType::Dinner->value,
                    'recipe_id' => $recipe->id,
                ],
                [
                    'planned_date' => '2025-06-03',
                    'meal_type' => MealType::Dinner->value,
                    'recipe_id' => $recipe->id,
                ],
            ],
        ]));

        $this->assertStringContainsString('2 meal', $result);
        $this->assertDatabaseHas('meals', [
            'family_id' => $user->family_id,
            'planned_date' => '2025-06-02',
            'meal_type' => MealType::Dinner->value,
            'recipe_id' => $recipe->id,
        ]);
        $this->assertDatabaseHas('meals', [
            'family_id' => $user->family_id,
            'planned_date' => '2025-06-03',
        ]);
    }

    public function test_handle_skips_meals_without_required_fields(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new AcceptMealSuggestions($user);

        $result = $tool->handle(new Request([
            'meals' => [
                ['planned_date' => '2025-06-02'], // missing meal_type
                ['meal_type' => 'dinner'],         // missing planned_date
            ],
        ]));

        // Meals without required fields are skipped
        $this->assertDatabaseCount('meals', 0);
    }

    public function test_handle_ignores_recipe_from_other_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $otherRecipe = Recipe::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $tool = new AcceptMealSuggestions($user);
        $result = $tool->handle(new Request([
            'meals' => [
                [
                    'planned_date' => '2025-06-02',
                    'meal_type' => 'dinner',
                    'recipe_id' => $otherRecipe->id,
                ],
            ],
        ]));

        // Meal created but without the foreign recipe
        $this->assertDatabaseHas('meals', [
            'family_id' => $user->family_id,
            'planned_date' => '2025-06-02',
            'recipe_id' => null,
        ]);
        $this->assertStringContainsString('1 meal', $result);
    }

    public function test_handle_returns_error_when_shopping_list_not_found(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new AcceptMealSuggestions($user);

        $result = $tool->handle(new Request([
            'meals' => [
                ['planned_date' => '2025-06-02', 'meal_type' => 'dinner'],
            ],
            'shopping_list_id' => 999999,
        ]));

        $this->assertStringContainsString('Error', $result);
        $this->assertDatabaseCount('meals', 0);
    }

    public function test_handle_mentions_shopping_list_when_provided(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $tool = new AcceptMealSuggestions($user);
        $result = $tool->handle(new Request([
            'meals' => [
                [
                    'planned_date' => '2025-06-02',
                    'meal_type' => 'dinner',
                    'recipe_id' => $recipe->id,
                ],
            ],
            'shopping_list_id' => $list->id,
        ]));

        $this->assertStringContainsString('shopping list', $result);
        $this->assertDatabaseHas('meals', [
            'family_id' => $user->family_id,
            'planned_date' => '2025-06-02',
        ]);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertNotEmpty((new AcceptMealSuggestions($user))->description());
    }

    public function test_schema_contains_required_fields(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new AcceptMealSuggestions($user);

        /** @var JsonSchema&MockInterface $schema */
        $schema = \Mockery::mock(JsonSchema::class);
        $schema->shouldReceive('string')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('integer')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('array')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('description')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('required')->andReturnSelf()->zeroOrMoreTimes();

        $fields = $tool->schema($schema);

        $this->assertArrayHasKey('meals', $fields);
        $this->assertArrayHasKey('shopping_list_id', $fields);
    }
}
