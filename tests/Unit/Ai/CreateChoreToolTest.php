<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\CreateChore;
use App\Enums\ChoreFrequency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class CreateChoreToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_creates_a_chore(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateChore($user);

        $result = $tool->handle(new Request(['title' => 'Vacuum living room']));

        $this->assertStringContainsString('Vacuum living room', $result);
        $this->assertDatabaseHas('chores', [
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Vacuum living room',
        ]);
    }

    public function test_handle_uses_default_weekly_frequency(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateChore($user);

        $tool->handle(new Request(['title' => 'Clean bathroom']));

        $this->assertDatabaseHas('chores', [
            'title' => 'Clean bathroom',
            'frequency' => ChoreFrequency::Weekly->value,
        ]);
    }

    public function test_handle_uses_provided_frequency(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateChore($user);

        $tool->handle(new Request([
            'title' => 'Water plants',
            'frequency' => ChoreFrequency::Daily->value,
        ]));

        $this->assertDatabaseHas('chores', [
            'title' => 'Water plants',
            'frequency' => ChoreFrequency::Daily->value,
        ]);
    }

    public function test_handle_stores_description_when_provided(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateChore($user);

        $tool->handle(new Request([
            'title' => 'Mow lawn',
            'description' => 'Front and back garden',
        ]));

        $this->assertDatabaseHas('chores', [
            'title' => 'Mow lawn',
            'description' => 'Front and back garden',
        ]);
    }

    public function test_handle_stores_next_due_date_when_provided(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateChore($user);

        $tool->handle(new Request([
            'title' => 'Bin day',
            'next_due_date' => '2025-07-01',
        ]));

        $this->assertDatabaseHas('chores', [
            'title' => 'Bin day',
        ]);
    }

    public function test_handle_returns_confirmation_message(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateChore($user);

        $result = $tool->handle(new Request(['title' => 'Do laundry']));

        $this->assertStringContainsString('✓', $result);
        $this->assertStringContainsString('Do laundry', $result);
    }

    public function test_description_is_non_empty_string(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateChore($user);

        $this->assertNotEmpty($tool->description());
    }
}
