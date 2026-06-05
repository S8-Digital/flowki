<?php

namespace Tests\Feature;

use App\Ai\MealPlannerAgent;
use App\Jobs\AggregateMealGroceries;
use App\Models\Meal;
use App\Models\Recipe;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class MealControllerTest extends TestCase
{
    use RefreshDatabase;

    // ── index ──────────────────────────────────────────────────────────────────

    public function test_guests_cannot_view_meals(): void
    {
        $this->get(route('meals.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_meals(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)->get(route('meals.index'))->assertOk();
    }

    public function test_meals_index_shows_current_week_meals(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);
        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'recipe_id' => $recipe->id,
            'planned_date' => now()->startOfWeek()->toDateString(),
        ]);

        $this->actingAs($user)
            ->get(route('meals.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('meals'));
    }

    // ── store ──────────────────────────────────────────────────────────────────

    public function test_user_can_create_a_meal(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);

        $this->actingAs($user)
            ->post(route('meals.store'), [
                'recipe_id' => $recipe->id,
                'planned_date' => now()->toDateString(),
                'meal_type' => 'dinner',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('meals', [
            'family_id' => $user->family_id,
            'recipe_id' => $recipe->id,
            'meal_type' => 'dinner',
        ]);
    }

    public function test_meal_store_validates_required_fields(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('meals.store'), [])
            ->assertSessionHasErrors(['planned_date', 'meal_type']);
    }

    public function test_meal_can_be_created_without_recipe(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('meals.store'), [
                'planned_date' => now()->toDateString(),
                'meal_type' => 'breakfast',
                'notes' => 'Cereal and milk',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('meals', [
            'family_id' => $user->family_id,
            'recipe_id' => null,
            'meal_type' => 'breakfast',
            'notes' => 'Cereal and milk',
        ]);
    }

    public function test_user_cannot_add_another_familys_recipe_to_meal(): void
    {
        $user = User::factory()->withFamily()->create();
        $otherUser = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create(['family_id' => $otherUser->family_id, 'created_by' => $otherUser->id]);

        $this->actingAs($user)
            ->post(route('meals.store'), [
                'recipe_id' => $recipe->id,
                'planned_date' => now()->toDateString(),
                'meal_type' => 'dinner',
            ])
            ->assertSessionHasErrors('recipe_id');
    }

    public function test_user_cannot_add_another_familys_shopping_list_to_meal(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);
        $otherUser = User::factory()->withFamily()->create();
        $shoppingList = ShoppingList::factory()->create(['family_id' => $otherUser->family_id, 'created_by' => $otherUser->id]);

        $this->actingAs($user)
            ->post(route('meals.store'), [
                'recipe_id' => $recipe->id,
                'planned_date' => now()->toDateString(),
                'meal_type' => 'dinner',
                'shopping_list_id' => $shoppingList->id,
            ])
            ->assertSessionHasErrors('shopping_list_id');
    }

    public function test_user_needs_add_item_permission_to_aggregate_groceries_when_creating_meal(): void
    {
        $user = User::factory()->withFamily()->create();
        $user->syncRoles(['Guest']);
        $user->givePermissionTo('create-meals');
        $recipe = Recipe::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);
        $shoppingList = ShoppingList::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);

        $this->actingAs($user)
            ->post(route('meals.store'), [
                'recipe_id' => $recipe->id,
                'planned_date' => now()->toDateString(),
                'meal_type' => 'dinner',
                'shopping_list_id' => $shoppingList->id,
            ])
            ->assertForbidden();
    }

    // ── destroy ─────────────────────────────────────────────────────────────────

    public function test_user_can_delete_own_family_meal(): void
    {
        $user = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->delete(route('meals.destroy', $meal))
            ->assertRedirect();

        $this->assertDatabaseMissing('meals', ['id' => $meal->id]);
    }

    public function test_user_cannot_delete_another_familys_meal(): void
    {
        $user = User::factory()->withFamily()->create();
        $otherUser = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create([
            'family_id' => $otherUser->family_id,
            'created_by' => $otherUser->id,
        ]);

        $this->actingAs($user)
            ->delete(route('meals.destroy', $meal))
            ->assertForbidden();
    }

    // ── update ─────────────────────────────────────────────────────────────────

    public function test_user_can_update_a_meal(): void
    {
        $user = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'meal_type' => 'lunch',
        ]);

        $this->actingAs($user)
            ->patch(route('meals.update', $meal), ['meal_type' => 'dinner'])
            ->assertRedirect();

        $this->assertDatabaseHas('meals', ['id' => $meal->id, 'meal_type' => 'dinner']);
    }

    // ── aggregateGroceries ─────────────────────────────────────────────────────

    public function test_user_can_aggregate_groceries_for_a_meal(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);
        $recipe->ingredients()->create(['name' => 'Pasta', 'quantity' => '200g', 'sort_order' => 0]);
        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'recipe_id' => $recipe->id,
        ]);
        $list = ShoppingList::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);

        $this->actingAs($user)
            ->post(route('meals.groceries', $meal), ['shopping_list_id' => $list->id])
            ->assertRedirect();
    }

    public function test_user_cannot_aggregate_groceries_for_another_familys_meal(): void
    {
        $user = User::factory()->withFamily()->create();
        $otherUser = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create([
            'family_id' => $otherUser->family_id,
            'created_by' => $otherUser->id,
        ]);
        $list = ShoppingList::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);

        $this->actingAs($user)
            ->post(route('meals.groceries', $meal), ['shopping_list_id' => $list->id])
            ->assertForbidden();
    }

    public function test_user_needs_add_item_permission_to_aggregate_groceries_for_a_meal(): void
    {
        $user = User::factory()->withFamily()->create();
        $user->syncRoles(['Guest']);
        $user->givePermissionTo('view-meals');
        $recipe = Recipe::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);
        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'recipe_id' => $recipe->id,
        ]);
        $list = ShoppingList::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);

        $this->actingAs($user)
            ->post(route('meals.groceries', $meal), ['shopping_list_id' => $list->id])
            ->assertForbidden();
    }

    public function test_ai_suggest_returns_valid_suggestions_for_web_preview(): void
    {
        $user = User::factory()->withFamily()->create();
        config()->set('ai.default', 'openai');
        config()->set('ai.providers.openai.key', 'test-key');

        $planner = \Mockery::mock(MealPlannerAgent::class);
        $planner->shouldReceive('prompt')->once()->andReturn(json_encode([
            [
                'planned_date' => '2025-06-02',
                'meal_type' => 'dinner',
                'recipe_id' => 12,
                'recipe_title' => 'Pasta',
            ],
        ]));
        $this->app->bind(MealPlannerAgent::class, fn () => $planner);

        $this->actingAs($user)
            ->postJson(route('meals.ai-suggest'), ['week_start' => '2025-06-02'])
            ->assertOk()
            ->assertJsonPath('suggestions.0.planned_date', '2025-06-02')
            ->assertJsonPath('suggestions.0.meal_type', 'dinner')
            ->assertJsonPath('suggestions.0.recipe_id', 12)
            ->assertJsonPath('suggestions.0.recipe_title', 'Pasta');
    }

    public function test_ai_suggest_rejects_malformed_suggestions_for_web_preview(): void
    {
        $user = User::factory()->withFamily()->create();
        config()->set('ai.default', 'openai');
        config()->set('ai.providers.openai.key', 'test-key');

        $planner = \Mockery::mock(MealPlannerAgent::class);
        $planner->shouldReceive('prompt')->once()->andReturn(json_encode([
            [
                'planned_date' => '2025-06-02',
                'meal_type' => 'dinner',
                'recipe_id' => 'invalid',
                'recipe_title' => 'Pasta',
            ],
        ]));
        $this->app->bind(MealPlannerAgent::class, fn () => $planner);

        $this->actingAs($user)
            ->postJson(route('meals.ai-suggest'), ['week_start' => '2025-06-02'])
            ->assertStatus(502)
            ->assertJsonPath('error', 'AI returned an unexpected response. Please try again.');
    }

    public function test_user_can_bulk_create_meals_from_ai_suggestions(): void
    {
        Queue::fake();

        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);
        $list = ShoppingList::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);

        $this->actingAs($user)
            ->post(route('meals.bulk'), [
                'shopping_list_id' => $list->id,
                'meals' => [
                    [
                        'planned_date' => '2025-06-02',
                        'meal_type' => 'dinner',
                        'recipe_id' => $recipe->id,
                    ],
                    [
                        'planned_date' => '2025-06-03',
                        'meal_type' => 'dinner',
                        'recipe_id' => $recipe->id,
                    ],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('meals', [
            'family_id' => $user->family_id,
            'planned_date' => '2025-06-02',
            'recipe_id' => $recipe->id,
        ]);
        $this->assertDatabaseHas('meals', [
            'family_id' => $user->family_id,
            'planned_date' => '2025-06-03',
            'recipe_id' => $recipe->id,
        ]);
        Queue::assertPushed(AggregateMealGroceries::class, 2);
    }
}
