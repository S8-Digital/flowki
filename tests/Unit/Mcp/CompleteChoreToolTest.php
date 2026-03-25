<?php

namespace Tests\Unit\Mcp;

use App\Enums\ChoreFrequency;
use App\Mcp\Tools\CompleteChore;
use App\Models\Chore;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Mcp\Request;
use Tests\TestCase;

class CompleteChoreToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_error_when_user_has_no_family(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $tool = new CompleteChore;
        $response = $tool->handle(new Request(['chore_id' => 1]));

        $this->assertStringContainsString('Error', (string) $response->content());
        $this->assertStringContainsString('family', (string) $response->content());
    }

    public function test_returns_error_when_chore_id_is_missing(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new CompleteChore;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('Error', (string) $response->content());
        $this->assertStringContainsString('chore_id', (string) $response->content());
    }

    public function test_returns_error_when_chore_not_found(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new CompleteChore;
        $response = $tool->handle(new Request(['chore_id' => 99999]));

        $this->assertStringContainsString('Error', (string) $response->content());
    }

    public function test_cannot_complete_chore_from_other_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Other family chore',
            'frequency' => ChoreFrequency::Weekly,
        ]);

        $this->actingAs($user);

        $tool = new CompleteChore;
        $response = $tool->handle(new Request(['chore_id' => $chore->id]));

        $this->assertStringContainsString('Error', (string) $response->content());
        $this->assertDatabaseMissing('chore_completions', ['chore_id' => $chore->id]);
    }

    public function test_marks_chore_as_complete(): void
    {
        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Wash dishes',
            'frequency' => ChoreFrequency::Daily,
        ]);

        $this->actingAs($user);

        $tool = new CompleteChore;
        $response = $tool->handle(new Request(['chore_id' => $chore->id]));

        $this->assertStringContainsString('✓', (string) $response->content());
        $this->assertStringContainsString('Wash dishes', (string) $response->content());
        $this->assertDatabaseHas('chore_completions', [
            'chore_id' => $chore->id,
            'completed_by' => $user->id,
        ]);
    }

    public function test_stores_optional_notes_on_completion(): void
    {
        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Mow lawn',
            'frequency' => ChoreFrequency::Weekly,
        ]);

        $this->actingAs($user);

        $tool = new CompleteChore;
        $tool->handle(new Request(['chore_id' => $chore->id, 'notes' => 'Front yard only']));

        $this->assertDatabaseHas('chore_completions', [
            'chore_id' => $chore->id,
            'notes' => 'Front yard only',
        ]);
    }
}
