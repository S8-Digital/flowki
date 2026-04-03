<?php

namespace Tests\Feature\Mobile;

use App\Models\Recipe;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecipeControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_view_recipes(): void
    {
        $this->getJson(route('mobile.recipes.index'))->assertUnauthorized();
    }

    public function test_user_can_list_their_family_recipes(): void
    {
        $user = User::factory()->withFamily()->create();
        Recipe::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Pasta Bake',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.recipes.index'));

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['title' => 'Pasta Bake']);
    }

    public function test_user_cannot_list_another_familys_recipes(): void
    {
        $user = User::factory()->withFamily()->create();
        $otherUser = User::factory()->withFamily()->create();

        Recipe::factory()->create([
            'family_id' => $otherUser->family_id,
            'created_by' => $otherUser->id,
            'title' => 'Other Family Recipe',
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.recipes.index'))
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }
}
