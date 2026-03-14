<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\ListTodos;
use App\Enums\TodoStatus;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class ListTodosToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_returns_no_todos_message_when_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ListTodos($user);

        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('No todos found', $result);
    }

    public function test_handle_lists_family_todos(): void
    {
        $user = User::factory()->withFamily()->create();
        Todo::factory()->pending()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Buy groceries',
        ]);

        $tool = new ListTodos($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('Buy groceries', $result);
    }

    public function test_handle_filters_by_status(): void
    {
        $user = User::factory()->withFamily()->create();
        Todo::factory()->pending()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Pending task',
        ]);
        Todo::factory()->completed()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Completed task',
        ]);

        $tool = new ListTodos($user);
        $result = $tool->handle(new Request(['status' => TodoStatus::Pending->value]));

        $this->assertStringContainsString('Pending task', $result);
        $this->assertStringNotContainsString('Completed task', $result);
    }

    public function test_handle_does_not_return_other_family_todos(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        Todo::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Other family task',
        ]);

        $tool = new ListTodos($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('No todos found', $result);
    }
}
