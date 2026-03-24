<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\EditChore;
use App\Enums\ChoreFrequency;
use App\Models\Chore;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class EditChoreToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_updates_chore_title(): void
    {
        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Old chore',
            'frequency' => ChoreFrequency::Weekly,
        ]);

        $tool = new EditChore($user);
        $result = $tool->handle(new Request([
            'chore_id' => $chore->id,
            'title' => 'Updated chore',
        ]));

        $this->assertStringContainsString('✓', $result);
        $this->assertDatabaseHas('chores', ['id' => $chore->id, 'title' => 'Updated chore']);
    }

    public function test_handle_updates_frequency(): void
    {
        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Vacuum',
            'frequency' => ChoreFrequency::Weekly,
        ]);

        $tool = new EditChore($user);
        $tool->handle(new Request([
            'chore_id' => $chore->id,
            'frequency' => ChoreFrequency::Daily->value,
        ]));

        $this->assertDatabaseHas('chores', ['id' => $chore->id, 'frequency' => 'daily']);
    }

    public function test_handle_syncs_assignees(): void
    {
        $user = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $user->family_id]);
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Dishes',
            'frequency' => ChoreFrequency::Daily,
        ]);

        $tool = new EditChore($user);
        $tool->handle(new Request([
            'chore_id' => $chore->id,
            'assignee_ids' => [$member->id],
        ]));

        $this->assertDatabaseHas('chore_user', [
            'chore_id' => $chore->id,
            'user_id' => $member->id,
        ]);
    }

    public function test_handle_returns_error_for_unknown_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new EditChore($user);

        $result = $tool->handle(new Request(['chore_id' => 99999, 'title' => 'X']));

        $this->assertStringContainsString('Error', $result);
    }

    public function test_handle_cannot_edit_other_family_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Other chore',
            'frequency' => ChoreFrequency::Weekly,
        ]);

        $tool = new EditChore($user);
        $result = $tool->handle(new Request(['chore_id' => $chore->id, 'title' => 'Hacked']));

        $this->assertStringContainsString('Error', $result);
        $this->assertDatabaseHas('chores', ['id' => $chore->id, 'title' => 'Other chore']);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertNotEmpty((new EditChore($user))->description());
    }
}
