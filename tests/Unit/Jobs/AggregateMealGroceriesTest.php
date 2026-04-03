<?php

namespace Tests\Unit\Jobs;

use App\Jobs\AggregateMealGroceries;
use App\Models\Meal;
use App\Models\Recipe;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AggregateMealGroceriesTest extends TestCase
{
    use RefreshDatabase;

    public function test_job_adds_recipe_ingredients_to_shopping_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'servings' => 4,
        ]);
        $recipe->ingredients()->create(['name' => 'Pasta', 'quantity' => '400g', 'sort_order' => 0]);
        $recipe->ingredients()->create(['name' => 'Tomato sauce', 'quantity' => '2 cans', 'sort_order' => 1]);

        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'recipe_id' => $recipe->id,
            'servings' => 4,
        ]);

        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        (new AggregateMealGroceries($meal->id, $list->id))->handle();

        $this->assertDatabaseHas('shopping_items', [
            'shopping_list_id' => $list->id,
            'name' => 'Pasta',
            'quantity' => '400g',
        ]);
        $this->assertDatabaseHas('shopping_items', [
            'shopping_list_id' => $list->id,
            'name' => 'Tomato sauce',
            'quantity' => '2 cans',
        ]);
    }

    public function test_job_scales_quantities_when_servings_differ(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'servings' => 4,
        ]);
        $recipe->ingredients()->create(['name' => 'Flour', 'quantity' => '200g', 'sort_order' => 0]);

        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'recipe_id' => $recipe->id,
            'servings' => 8, // double
        ]);

        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        (new AggregateMealGroceries($meal->id, $list->id))->handle();

        $this->assertDatabaseHas('shopping_items', [
            'shopping_list_id' => $list->id,
            'name' => 'Flour',
            'quantity' => '400 g',
        ]);
    }

    public function test_job_does_nothing_when_meal_has_no_recipe(): void
    {
        $user = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'recipe_id' => null,
        ]);
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        (new AggregateMealGroceries($meal->id, $list->id))->handle();

        $this->assertDatabaseCount('shopping_items', 0);
    }

    public function test_job_does_nothing_when_meal_not_found(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        (new AggregateMealGroceries(99999, $list->id))->handle();

        $this->assertDatabaseCount('shopping_items', 0);
    }
}
