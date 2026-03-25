<?php

namespace Tests\Feature\Mobile;

use App\Models\Chore;
use App\Models\ChoreCompletion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChoreControllerTest extends TestCase
{
    use RefreshDatabase;

    // ── index ──────────────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_list_chores(): void
    {
        $this->getJson(route('mobile.chores.index'))->assertUnauthorized();
    }

    public function test_user_without_family_cannot_list_chores(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.chores.index'))
            ->assertForbidden();
    }

    public function test_user_can_list_family_chores(): void
    {
        $user = User::factory()->withFamily()->create();
        Chore::factory()->count(3)->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.chores.index'));

        $response->assertOk()->assertJsonCount(3, 'data');
    }

    public function test_user_does_not_see_other_family_chores(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();

        Chore::factory()->count(2)->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.chores.index'));

        $response->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_chores_are_returned_with_assignees_and_creator(): void
    {
        $user = User::factory()->withFamily()->create();
        Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.chores.index'));

        $response->assertOk()
            ->assertJsonStructure(['data' => [['id', 'title', 'creator']]]);
    }

    // ── store ──────────────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_create_chore(): void
    {
        $this->postJson(route('mobile.chores.store'), ['title' => 'Test'])->assertUnauthorized();
    }

    public function test_user_can_create_chore(): void
    {
        $user = User::factory()->withFamily()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.chores.store'), [
                'title' => 'Vacuum floors',
                'frequency' => 'weekly',
            ]);

        $response->assertCreated()
            ->assertJsonFragment(['title' => 'Vacuum floors']);

        $this->assertDatabaseHas('chores', [
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Vacuum floors',
        ]);
    }

    public function test_chore_store_requires_title(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.chores.store'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('title');
    }

    public function test_chore_store_accepts_optional_due_date(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.chores.store'), [
                'title' => 'Clean gutters',
                'next_due_date' => '2025-12-31',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('chores', [
            'title' => 'Clean gutters',
        ]);
    }

    // ── update ─────────────────────────────────────────────────────────────────

    public function test_user_can_update_own_family_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Original chore',
        ]);

        $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.chores.update', $chore), ['title' => 'Updated chore'])
            ->assertOk()
            ->assertJsonFragment(['title' => 'Updated chore']);

        $this->assertDatabaseHas('chores', ['id' => $chore->id, 'title' => 'Updated chore']);
    }

    public function test_user_cannot_update_another_familys_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.chores.update', $chore), ['title' => 'Hacked'])
            ->assertForbidden();
    }

    // ── complete ───────────────────────────────────────────────────────────────

    public function test_user_can_complete_a_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.chores.complete', $chore))
            ->assertOk();

        $this->assertDatabaseHas('chore_completions', [
            'chore_id' => $chore->id,
            'completed_by' => $user->id,
        ]);
    }

    public function test_user_cannot_complete_another_familys_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.chores.complete', $chore))
            ->assertForbidden();
    }

    // ── destroy ────────────────────────────────────────────────────────────────

    public function test_user_can_delete_own_family_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson(route('mobile.chores.destroy', $chore))
            ->assertNoContent();

        $this->assertDatabaseMissing('chores', ['id' => $chore->id]);
    }

    public function test_user_cannot_delete_another_familys_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson(route('mobile.chores.destroy', $chore))
            ->assertForbidden();

        $this->assertDatabaseHas('chores', ['id' => $chore->id]);
    }
}
