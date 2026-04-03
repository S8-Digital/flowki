<?php

namespace Tests\Unit\Models;

use App\Models\Recipe;
use App\Models\RecipeIngredient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecipeIngredientModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_recipe_ingredient_belongs_to_recipe(): void
    {
        $ingredient = RecipeIngredient::factory()->create();
        $this->assertInstanceOf(Recipe::class, $ingredient->recipe);
    }

    public function test_recipe_ingredient_casts_sort_order_to_integer(): void
    {
        $ingredient = RecipeIngredient::factory()->create(['sort_order' => 3]);
        $this->assertIsInt($ingredient->fresh()->sort_order);
        $this->assertEquals(3, $ingredient->fresh()->sort_order);
    }

    public function test_recipe_ingredient_is_fillable(): void
    {
        $recipe = Recipe::factory()->create();
        $ingredient = RecipeIngredient::create([
            'recipe_id' => $recipe->id,
            'name' => 'flour',
            'quantity' => '2',
            'unit' => 'cups',
            'notes' => 'sifted',
            'sort_order' => 1,
        ]);

        $this->assertEquals('flour', $ingredient->name);
        $this->assertEquals('2', $ingredient->quantity);
        $this->assertEquals('cups', $ingredient->unit);
        $this->assertEquals('sifted', $ingredient->notes);
    }

    public function test_recipe_has_many_ingredients(): void
    {
        $recipe = Recipe::factory()->create();
        RecipeIngredient::factory()->count(3)->create(['recipe_id' => $recipe->id]);

        $this->assertCount(3, $recipe->fresh()->ingredients);
    }

    public function test_recipe_ingredient_nullable_fields_can_be_null(): void
    {
        $recipe = Recipe::factory()->create();
        $ingredient = RecipeIngredient::create([
            'recipe_id' => $recipe->id,
            'name' => 'salt',
            'quantity' => null,
            'unit' => null,
            'notes' => null,
            'sort_order' => 0,
        ]);

        $this->assertNull($ingredient->quantity);
        $this->assertNull($ingredient->unit);
        $this->assertNull($ingredient->notes);
    }
}
