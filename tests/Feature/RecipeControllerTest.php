<?php

namespace Tests\Feature;

use App\Enums\RecipeCategory;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecipeControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_recipes(): void
    {
        $this->get(route('recipes.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_recipes(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)->get(route('recipes.index'))->assertOk();
    }

    public function test_user_can_create_recipe(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('recipes.store'), $this->validRecipeData())
            ->assertRedirect();

        $this->assertDatabaseHas('recipes', [
            'family_id' => $user->family_id,
            'title' => 'Spaghetti Bolognese',
        ]);
    }

    public function test_recipe_store_validates_required_fields(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('recipes.store'), [])
            ->assertSessionHasErrors(['title', 'instructions']);
    }

    public function test_recipe_store_creates_ingredients(): void
    {
        $user = User::factory()->withFamily()->create();

        $data = array_merge($this->validRecipeData(), [
            'ingredients' => [
                ['name' => 'Pasta', 'quantity' => '200g', 'unit' => null, 'notes' => null],
                ['name' => 'Ground beef', 'quantity' => '500g', 'unit' => null, 'notes' => null],
            ],
        ]);

        $this->actingAs($user)->post(route('recipes.store'), $data)->assertRedirect();

        $recipe = Recipe::where('title', 'Spaghetti Bolognese')->first();
        $this->assertEquals(2, $recipe->ingredients()->count());
    }

    public function test_user_can_view_own_family_recipe(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)->get(route('recipes.show', $recipe))->assertOk();
    }

    public function test_user_cannot_view_another_familys_recipe(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $this->actingAs($user)->get(route('recipes.show', $recipe))->assertForbidden();
    }

    public function test_user_can_update_own_recipe(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->patch(route('recipes.update', $recipe), array_merge($this->validRecipeData(), ['title' => 'Updated Recipe']))
            ->assertRedirect();

        $this->assertDatabaseHas('recipes', ['id' => $recipe->id, 'title' => 'Updated Recipe']);
    }

    public function test_user_can_delete_own_recipe(): void
    {
        $user = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)->delete(route('recipes.destroy', $recipe))->assertRedirect();
        $this->assertDatabaseMissing('recipes', ['id' => $recipe->id]);
    }

    public function test_user_cannot_delete_another_familys_recipe(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $recipe = Recipe::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $this->actingAs($user)->delete(route('recipes.destroy', $recipe))->assertForbidden();
    }

    /** @return array<string, mixed> */
    private function validRecipeData(): array
    {
        return [
            'title' => 'Spaghetti Bolognese',
            'description' => null,
            'category' => RecipeCategory::Dinner->value,
            'servings' => 4,
            'prep_time_minutes' => 15,
            'cook_time_minutes' => 30,
            'instructions' => 'Cook pasta. Add sauce.',
            'is_favorite' => false,
        ];
    }
}
