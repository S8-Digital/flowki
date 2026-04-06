<?php

namespace Tests\Unit\Models;

use App\Enums\MealType;
use App\Models\Family;
use App\Models\Meal;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
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
        $meal = Meal::factory()->create();
        $this->assertInstanceOf(Family::class, $meal->family);
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

        $this->assertInstanceOf(Carbon::class, $meal->planned_date);
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
        $meal = Meal::factory()->create();
        $this->assertInstanceOf(User::class, $meal->creator);
    }

    public function test_meal_belongs_to_recipe(): void
    {
        $meal = Meal::factory()->create();
        $this->assertInstanceOf(Recipe::class, $meal->recipe);
    }

    public function test_meal_casts_meal_type_to_enum(): void
    {
        $meal = Meal::factory()->create(['meal_type' => MealType::Dinner]);
        $this->assertInstanceOf(MealType::class, $meal->fresh()->meal_type);
        $this->assertEquals(MealType::Dinner, $meal->fresh()->meal_type);
    }

    public function test_meal_casts_planned_date_to_date(): void
    {
        $meal = Meal::factory()->create(['planned_date' => '2025-06-15']);
        $this->assertInstanceOf(Carbon::class, $meal->fresh()->planned_date);
    }

    public function test_meal_casts_servings_to_integer(): void
    {
        $meal = Meal::factory()->create(['servings' => 4]);
        $this->assertIsInt($meal->fresh()->servings);
        $this->assertEquals(4, $meal->fresh()->servings);
    }

    public function test_scope_for_family_filters_by_family(): void
    {
        $familyA = Family::factory()->create();
        $familyB = Family::factory()->create();
        Meal::factory()->count(2)->create(['family_id' => $familyA->id]);
        Meal::factory()->create(['family_id' => $familyB->id]);

        $results = Meal::query()->forFamily($familyA->id)->get();
        $this->assertCount(2, $results);
        $results->each(fn ($m) => $this->assertEquals($familyA->id, $m->family_id));
    }

    public function test_scope_for_week_filters_by_week(): void
    {
        $family = Family::factory()->create();
        $weekStart = '2025-06-09';
        Meal::factory()->create(['family_id' => $family->id, 'planned_date' => '2025-06-09']);
        Meal::factory()->create(['family_id' => $family->id, 'planned_date' => '2025-06-12']);
        Meal::factory()->create(['family_id' => $family->id, 'planned_date' => '2025-06-16']); // outside week

        $results = Meal::query()->forFamily($family->id)->forWeek($weekStart)->get();
        $this->assertCount(2, $results);
    }

    public function test_to_sync_array_returns_expected_keys(): void
    {
        $meal = Meal::factory()->create(['meal_type' => MealType::Lunch, 'servings' => 3]);
        $sync = $meal->toSyncArray();

        $this->assertArrayHasKey('id', $sync);
        $this->assertArrayHasKey('family_id', $sync);
        $this->assertArrayHasKey('created_by', $sync);
        $this->assertArrayHasKey('recipe_id', $sync);
        $this->assertArrayHasKey('planned_date', $sync);
        $this->assertArrayHasKey('meal_type', $sync);
        $this->assertArrayHasKey('servings', $sync);
        $this->assertArrayHasKey('notes', $sync);
        $this->assertEquals('lunch', $sync['meal_type']);
        $this->assertEquals(3, $sync['servings']);
    }
}
