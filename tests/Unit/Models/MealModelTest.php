<?php

namespace Tests\Unit\Models;

use App\Enums\MealType;
use App\Models\Meal;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MealModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_meal_belongs_to_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->assertNotNull($meal->family);
        $this->assertEquals($user->family_id, $meal->family->id);
    }

    public function test_meal_belongs_to_creator(): void
    {
        $user = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->assertNotNull($meal->creator);
        $this->assertEquals($user->id, $meal->creator->id);
    }

    public function test_meal_belongs_to_recipe_when_set(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'recipe_id' => $recipe->id,
        ]);

        $this->assertNotNull($meal->recipe);
        $this->assertEquals($recipe->id, $meal->recipe->id);
    }

    public function test_meal_recipe_is_null_when_not_set(): void
    {
        $user = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'recipe_id' => null,
        ]);

        $this->assertNull($meal->recipe);
    }

    public function test_meal_type_is_cast_to_enum(): void
    {
        $user = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'meal_type' => 'dinner',
        ]);

        $this->assertInstanceOf(MealType::class, $meal->meal_type);
        $this->assertEquals(MealType::Dinner, $meal->meal_type);
    }

    public function test_planned_date_is_cast_to_carbon(): void
    {
        $user = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'planned_date' => '2025-06-15',
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $meal->planned_date);
        $this->assertEquals('2025-06-15', $meal->planned_date->toDateString());
    }

    public function test_servings_is_cast_to_integer(): void
    {
        $user = User::factory()->withFamily()->create();
        $meal = Meal::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'servings' => 4,
        ]);

        $this->assertIsInt($meal->servings);
        $this->assertEquals(4, $meal->servings);
    }
}
