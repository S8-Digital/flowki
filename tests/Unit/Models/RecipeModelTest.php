<?php

namespace Tests\Unit\Models;

use App\Enums\RecipeCategory;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecipeModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_recipe_belongs_to_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create(['family_id' => $user->family_id]);

        $this->assertEquals($user->family_id, $recipe->family_id);
    }

    public function test_recipe_belongs_to_creator(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);
        $recipe->load('creator');

        $this->assertEquals($user->id, $recipe->creator->id);
    }

    public function test_recipe_has_ingredients_relationship(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create(['family_id' => $user->family_id]);
        RecipeIngredient::factory()->create(['recipe_id' => $recipe->id]);

        $this->assertCount(1, $recipe->ingredients);
    }

    public function test_is_favorite_cast_to_boolean(): void
    {
        $recipe = Recipe::factory()->create(['is_favorite' => true]);

        $this->assertIsBool($recipe->fresh()->is_favorite);
        $this->assertTrue($recipe->fresh()->is_favorite);
    }

    public function test_total_time_minutes_returns_sum_of_prep_and_cook(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'prep_time_minutes' => 15,
            'cook_time_minutes' => 45,
        ]);

        $this->assertEquals(60, $recipe->totalTimeMinutes());
    }

    public function test_total_time_minutes_returns_zero_when_both_null(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'prep_time_minutes' => null,
            'cook_time_minutes' => null,
        ]);

        $this->assertEquals(0, $recipe->totalTimeMinutes());
    }

    public function test_category_is_cast_to_enum(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'category' => RecipeCategory::Dinner,
        ]);

        $this->assertInstanceOf(RecipeCategory::class, $recipe->fresh()->category);
    }

    public function test_can_filter_recipes_by_is_favorite(): void
    {
        $user = User::factory()->withFamily()->create();
        Recipe::factory()->create(['family_id' => $user->family_id, 'is_favorite' => true]);
        Recipe::factory()->create(['family_id' => $user->family_id, 'is_favorite' => false]);

        $favorites = Recipe::where('family_id', $user->family_id)->where('is_favorite', true)->get();
        $this->assertCount(1, $favorites);
    }
}
