<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\ListChores;
use App\Enums\ChoreFrequency;
use App\Models\Chore;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class ListChoresToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_returns_no_chores_message_when_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ListChores($user);

        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('No chores found', $result);
    }

    public function test_handle_lists_family_chores(): void
    {
        $user = User::factory()->withFamily()->create();
        Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Vacuum living room',
            'frequency' => ChoreFrequency::Weekly,
        ]);

        $tool = new ListChores($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('Vacuum living room', $result);
    }

    public function test_handle_filters_by_frequency(): void
    {
        $user = User::factory()->withFamily()->create();
        Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Weekly task',
            'frequency' => ChoreFrequency::Weekly,
        ]);
        Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Daily task',
            'frequency' => ChoreFrequency::Daily,
        ]);

        $tool = new ListChores($user);
        $result = $tool->handle(new Request(['frequency' => ChoreFrequency::Weekly->value]));

        $this->assertStringContainsString('Weekly task', $result);
        $this->assertStringNotContainsString('Daily task', $result);
    }

    public function test_handle_does_not_return_other_family_chores(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        Chore::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Other family chore',
        ]);

        $tool = new ListChores($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('No chores found', $result);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ListChores($user);

        $this->assertNotEmpty($tool->description());
    }

    public function test_handle_filters_by_due_today(): void
    {
        $user = User::factory()->withFamily()->create();
        Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Due today chore',
            'next_due_date' => now(),
        ]);
        Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Future chore',
            'next_due_date' => now()->addDays(3),
        ]);

        $tool = new ListChores($user);
        $result = $tool->handle(new Request(['due_today' => true]));

        $this->assertStringContainsString('Due today chore', $result);
        $this->assertStringNotContainsString('Future chore', $result);
    }
}
