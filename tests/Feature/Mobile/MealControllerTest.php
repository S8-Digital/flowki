<?php

namespace Tests\Feature\Mobile;

use App\Models\Meal;
use App\Models\Recipe;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MealControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_view_meals(): void
    {
        $this->getJson(route('mobile.meals.index'))->assertUnauthorized();
    }

    public function test_user_can_list_current_week_meals(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);
        Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'recipe_id' => $recipe->id,
            'planned_date' => now()->startOfWeek()->toDateString(),
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.meals.index'))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.recipe.title', $recipe->title);
    }

    public function test_user_can_create_a_meal(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);
        $list = ShoppingList::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.meals.store'), [
                'recipe_id' => $recipe->id,
                'planned_date' => now()->toDateString(),
                'meal_type' => 'dinner',
                'shopping_list_id' => $list->id,
            ])
            ->assertCreated()
            ->assertJsonPath('data.recipe.id', $recipe->id);

        $this->assertDatabaseHas('meals', [
            'family_id' => $user->family_id,
            'recipe_id' => $recipe->id,
            'meal_type' => 'dinner',
        ]);
    }

    public function test_meal_store_validates_required_fields(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.meals.store'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['planned_date', 'meal_type']);
    }

    public function test_user_cannot_use_another_familys_recipe(): void
    {
        $user = User::factory()->withFamily()->create();
        $otherUser = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create(['family_id' => $otherUser->family_id, 'created_by' => $otherUser->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.meals.store'), [
                'recipe_id' => $recipe->id,
                'planned_date' => now()->toDateString(),
                'meal_type' => 'dinner',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('recipe_id');
    }

    public function test_user_cannot_use_another_familys_shopping_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);
        $otherUser = User::factory()->withFamily()->create();
        $shoppingList = ShoppingList::factory()->create(['family_id' => $otherUser->family_id, 'created_by' => $otherUser->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.meals.store'), [
                'recipe_id' => $recipe->id,
                'planned_date' => now()->toDateString(),
                'meal_type' => 'dinner',
                'shopping_list_id' => $shoppingList->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('shopping_list_id');
    }

    public function test_user_needs_add_item_permission_to_aggregate_groceries_when_creating_meal(): void
    {
        $user = User::factory()->withFamily()->create();
        $user->syncRoles(['Guest']);
        $user->givePermissionTo('create-meals');
        $recipe = Recipe::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);
        $shoppingList = ShoppingList::factory()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.meals.store'), [
                'recipe_id' => $recipe->id,
                'planned_date' => now()->toDateString(),
                'meal_type' => 'dinner',
                'shopping_list_id' => $shoppingList->id,
            ])
            ->assertForbidden();
    }

    public function test_user_can_delete_own_family_meal(): void
    {
        $user = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson(route('mobile.meals.destroy', $meal))
            ->assertNoContent();

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

        $this->actingAs($user, 'sanctum')
            ->deleteJson(route('mobile.meals.destroy', $meal))
            ->assertForbidden();
    }

    public function test_user_can_add_meal_ingredients_to_shopping_list(): void
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

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.meals.groceries', $meal), ['shopping_list_id' => $list->id])
            ->assertOk()
            ->assertJsonFragment(['message' => 'Ingredients added to shopping list.']);
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

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.meals.groceries', $meal), ['shopping_list_id' => $list->id])
            ->assertForbidden();
    }
}
