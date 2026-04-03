<?php

namespace Tests\Unit\Models;

use App\Enums\MealType;
use App\Models\Family;
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
        $meal = Meal::factory()->create();
        $this->assertInstanceOf(Family::class, $meal->family);
    }

    public function test_meal_belongs_to_creator(): void
    {
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
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $meal->fresh()->planned_date);
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
