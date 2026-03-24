<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\ListRecipes;
use App\Enums\RecipeCategory;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class ListRecipesToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_returns_empty_message_when_no_recipes(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ListRecipes($user);

        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('No recipes found', $result);
    }

    public function test_handle_lists_family_recipes(): void
    {
        $user = User::factory()->withFamily()->create();
        Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Spaghetti Bolognese',
            'category' => RecipeCategory::Dinner,
        ]);

        $tool = new ListRecipes($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('Spaghetti Bolognese', $result);
    }

    public function test_handle_filters_by_category(): void
    {
        $user = User::factory()->withFamily()->create();
        Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Pancakes',
            'category' => RecipeCategory::Breakfast,
        ]);
        Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Lasagne',
            'category' => RecipeCategory::Dinner,
        ]);

        $tool = new ListRecipes($user);
        $result = $tool->handle(new Request(['category' => 'breakfast']));

        $this->assertStringContainsString('Pancakes', $result);
        $this->assertStringNotContainsString('Lasagne', $result);
    }

    public function test_handle_filters_favorites(): void
    {
        $user = User::factory()->withFamily()->create();
        Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Favourite Pie',
            'category' => RecipeCategory::Dinner,
            'is_favorite' => true,
        ]);
        Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Boring Salad',
            'category' => RecipeCategory::Lunch,
            'is_favorite' => false,
        ]);

        $tool = new ListRecipes($user);
        $result = $tool->handle(new Request(['is_favorite' => true]));

        $this->assertStringContainsString('Favourite Pie', $result);
        $this->assertStringNotContainsString('Boring Salad', $result);
    }

    public function test_handle_does_not_return_other_family_recipes(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        Recipe::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Secret Recipe',
            'category' => RecipeCategory::Dinner,
        ]);

        $tool = new ListRecipes($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('No recipes found', $result);
    }

    public function test_handle_includes_recipe_id_in_output(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Omelette',
            'category' => RecipeCategory::Breakfast,
        ]);

        $tool = new ListRecipes($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString("ID:{$recipe->id}", $result);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertNotEmpty((new ListRecipes($user))->description());
    }
}
