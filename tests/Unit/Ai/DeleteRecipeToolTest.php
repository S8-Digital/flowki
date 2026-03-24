<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\DeleteRecipe;
use App\Enums\RecipeCategory;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class DeleteRecipeToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_deletes_the_recipe(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Chicken Curry',
            'category' => RecipeCategory::Dinner,
            'instructions' => 'Cook chicken in curry sauce.',
        ]);

        $tool = new DeleteRecipe($user);
        $result = $tool->handle(new Request(['recipe_id' => $recipe->id]));

        $this->assertStringContainsString('✓', $result);
        $this->assertStringContainsString('Chicken Curry', $result);
        $this->assertDatabaseMissing('recipes', ['id' => $recipe->id]);
    }

    public function test_handle_returns_error_for_unknown_recipe(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new DeleteRecipe($user);

        $result = $tool->handle(new Request(['recipe_id' => 99999]));

        $this->assertStringContainsString('Error', $result);
    }

    public function test_handle_cannot_delete_other_family_recipe(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Secret Recipe',
            'category' => RecipeCategory::Dinner,
            'instructions' => 'Top secret.',
        ]);

        $tool = new DeleteRecipe($user);
        $result = $tool->handle(new Request(['recipe_id' => $recipe->id]));

        $this->assertStringContainsString('Error', $result);
        $this->assertDatabaseHas('recipes', ['id' => $recipe->id]);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertNotEmpty((new DeleteRecipe($user))->description());
    }
}
