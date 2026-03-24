<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\DeleteChore;
use App\Enums\ChoreFrequency;
use App\Models\Chore;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class DeleteChoreToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_deletes_the_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Take out bins',
            'frequency' => ChoreFrequency::Weekly,
        ]);

        $tool = new DeleteChore($user);
        $result = $tool->handle(new Request(['chore_id' => $chore->id]));

        $this->assertStringContainsString('✓', $result);
        $this->assertStringContainsString('Take out bins', $result);
        $this->assertDatabaseMissing('chores', ['id' => $chore->id]);
    }

    public function test_handle_returns_error_for_unknown_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new DeleteChore($user);

        $result = $tool->handle(new Request(['chore_id' => 99999]));

        $this->assertStringContainsString('Error', $result);
    }

    public function test_handle_cannot_delete_other_family_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Other chore',
            'frequency' => ChoreFrequency::Weekly,
        ]);

        $tool = new DeleteChore($user);
        $result = $tool->handle(new Request(['chore_id' => $chore->id]));

        $this->assertStringContainsString('Error', $result);
        $this->assertDatabaseHas('chores', ['id' => $chore->id]);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertNotEmpty((new DeleteChore($user))->description());
    }
}
