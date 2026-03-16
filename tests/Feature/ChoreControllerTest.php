<?php

namespace Tests\Feature;

use App\Enums\ChoreFrequency;
use App\Enums\FamilyRole;
use App\Models\Chore;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChoreControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_chores(): void
    {
        $this->get(route('chores.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_chores(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)->get(route('chores.index'))->assertOk();
    }

    public function test_user_can_create_chore(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('chores.store'), $this->validChoreData())
            ->assertRedirect();

        $this->assertDatabaseHas('chores', [
            'family_id' => $user->family_id,
            'title' => 'Vacuum living room',
        ]);
    }

    public function test_chore_store_validates_required_fields(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('chores.store'), [])
            ->assertSessionHasErrors(['title', 'frequency']);
    }

    public function test_chore_store_syncs_assignees(): void
    {
        $user = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $user->family_id]);
        $user->family->members()->attach($member->id, ['role' => FamilyRole::Member->value]);

        $this->actingAs($user)
            ->post(route('chores.store'), array_merge($this->validChoreData(), ['assignee_ids' => [$member->id]]))
            ->assertRedirect();

        $chore = Chore::where('family_id', $user->family_id)->first();
        $this->assertTrue($chore->assignees()->where('users.id', $member->id)->exists());
    }

    public function test_user_can_update_own_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->patch(route('chores.update', $chore), array_merge($this->validChoreData(), ['title' => 'Updated chore']))
            ->assertRedirect();

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

        $this->actingAs($user)
            ->patch(route('chores.update', $chore), $this->validChoreData())
            ->assertForbidden();
    }

    public function test_user_can_delete_own_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)->delete(route('chores.destroy', $chore))->assertRedirect();
        $this->assertDatabaseMissing('chores', ['id' => $chore->id]);
    }

    public function test_user_can_complete_family_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)->post(route('chores.complete', $chore))->assertRedirect();

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

        $this->actingAs($user)->post(route('chores.complete', $chore))->assertForbidden();
    }

    /** @return array<string, mixed> */
    private function validChoreData(): array
    {
        return [
            'title' => 'Vacuum living room',
            'description' => null,
            'frequency' => ChoreFrequency::Weekly->value,
            'next_due_date' => now()->addWeek()->toDateString(),
        ];
    }
}
