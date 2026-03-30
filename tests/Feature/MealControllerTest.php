<?php

namespace Tests\Feature;

use App\Models\Meal;
use App\Models\Recipe;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
