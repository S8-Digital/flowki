<?php

namespace Tests\Feature;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GlobalSearchControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_search(): void
    {
        $this->getJson(route('search').'?q=test')->assertUnauthorized();
    }

    public function test_search_requires_minimum_two_characters(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->getJson(route('search').'?q=a')
            ->assertUnprocessable();
    }

    public function test_search_requires_query_parameter(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->getJson(route('search'))
            ->assertUnprocessable();
    }

    public function test_search_returns_results_from_own_family(): void
    {
        $user = User::factory()->withFamily()->create();
        Todo::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Buy bananas',
        ]);

        $response = $this->actingAs($user)
            ->getJson(route('search').'?q=banana')
            ->assertOk();

        $this->assertCount(1, $response->json('todos'));
    }

    public function test_search_does_not_return_another_familys_results(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        Todo::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Buy bananas',
        ]);

        $response = $this->actingAs($user)
            ->getJson(route('search').'?q=banana')
            ->assertOk();

        $this->assertCount(0, $response->json('todos'));
    }

    public function test_search_returns_expected_keys(): void
    {
        $user = User::factory()->withFamily()->create();

        $response = $this->actingAs($user)
            ->getJson(route('search').'?q=test')
            ->assertOk();

        $response->assertJsonStructure(['todos', 'chores', 'events', 'recipes', 'shopping_items']);
    }
}
