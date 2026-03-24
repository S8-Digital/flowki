<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\CompleteChore;
use App\Enums\ChoreFrequency;
use App\Models\Chore;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class CompleteChoreToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_records_completion(): void
    {
        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Wash dishes',
            'frequency' => ChoreFrequency::Daily,
        ]);

        $tool = new CompleteChore($user);
        $result = $tool->handle(new Request(['chore_id' => $chore->id]));

        $this->assertStringContainsString('✓', $result);
        $this->assertStringContainsString('Wash dishes', $result);
        $this->assertDatabaseHas('chore_completions', [
            'chore_id' => $chore->id,
            'completed_by' => $user->id,
        ]);
    }

    public function test_handle_stores_optional_notes(): void
    {
        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Mow lawn',
            'frequency' => ChoreFrequency::Weekly,
        ]);

        $tool = new CompleteChore($user);
        $tool->handle(new Request(['chore_id' => $chore->id, 'notes' => 'Did front only']));

        $this->assertDatabaseHas('chore_completions', [
            'chore_id' => $chore->id,
            'notes' => 'Did front only',
        ]);
    }

    public function test_handle_returns_error_for_unknown_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CompleteChore($user);

        $result = $tool->handle(new Request(['chore_id' => 99999]));

        $this->assertStringContainsString('Error', $result);
    }

    public function test_handle_cannot_complete_other_family_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Other chore',
            'frequency' => ChoreFrequency::Weekly,
        ]);

        $tool = new CompleteChore($user);
        $result = $tool->handle(new Request(['chore_id' => $chore->id]));

        $this->assertStringContainsString('Error', $result);
        $this->assertDatabaseMissing('chore_completions', ['chore_id' => $chore->id]);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertNotEmpty((new CompleteChore($user))->description());
    }
}
