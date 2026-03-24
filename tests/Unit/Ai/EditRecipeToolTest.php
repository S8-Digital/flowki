<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\EditRecipe;
use App\Enums\RecipeCategory;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class EditRecipeToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_updates_recipe_title(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Old recipe',
            'category' => RecipeCategory::Dinner,
            'instructions' => 'Cook it.',
        ]);

        $tool = new EditRecipe($user);
        $result = $tool->handle(new Request([
            'recipe_id' => $recipe->id,
            'title' => 'New recipe name',
        ]));

        $this->assertStringContainsString('✓', $result);
        $this->assertDatabaseHas('recipes', ['id' => $recipe->id, 'title' => 'New recipe name']);
    }

    public function test_handle_updates_is_favorite_and_rating(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Pasta',
            'category' => RecipeCategory::Dinner,
            'instructions' => 'Boil pasta.',
            'is_favorite' => false,
        ]);

        $tool = new EditRecipe($user);
        $tool->handle(new Request([
            'recipe_id' => $recipe->id,
            'is_favorite' => true,
            'rating' => 5,
        ]));

        $this->assertDatabaseHas('recipes', [
            'id' => $recipe->id,
            'is_favorite' => true,
            'rating' => 5,
        ]);
    }

    public function test_handle_replaces_ingredients(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Soup',
            'category' => RecipeCategory::Lunch,
            'instructions' => 'Boil everything.',
        ]);
        $recipe->ingredients()->create(['name' => 'Old ingredient', 'sort_order' => 0]);

        $tool = new EditRecipe($user);
        $tool->handle(new Request([
            'recipe_id' => $recipe->id,
            'ingredients' => [
                ['name' => 'Carrot', 'quantity' => '2', 'unit' => 'whole'],
            ],
        ]));

        $this->assertDatabaseHas('recipe_ingredients', ['recipe_id' => $recipe->id, 'name' => 'Carrot']);
        $this->assertDatabaseMissing('recipe_ingredients', ['recipe_id' => $recipe->id, 'name' => 'Old ingredient']);
    }

    public function test_handle_returns_error_for_unknown_recipe(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new EditRecipe($user);

        $result = $tool->handle(new Request(['recipe_id' => 99999, 'title' => 'X']));

        $this->assertStringContainsString('Error', $result);
    }

    public function test_handle_cannot_edit_other_family_recipe(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Secret',
            'category' => RecipeCategory::Dinner,
            'instructions' => 'Secret steps.',
        ]);

        $tool = new EditRecipe($user);
        $result = $tool->handle(new Request(['recipe_id' => $recipe->id, 'title' => 'Hacked']));

        $this->assertStringContainsString('Error', $result);
        $this->assertDatabaseHas('recipes', ['id' => $recipe->id, 'title' => 'Secret']);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertNotEmpty((new EditRecipe($user))->description());
    }
}
