<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\EditTodo;
use App\Enums\Priority;
use App\Enums\TodoStatus;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class EditTodoToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_updates_todo_title(): void
    {
        $user = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Old task',
        ]);

        $tool = new EditTodo($user);
        $result = $tool->handle(new Request([
            'todo_id' => $todo->id,
            'title' => 'Updated task',
        ]));

        $this->assertStringContainsString('✓', $result);
        $this->assertDatabaseHas('todos', ['id' => $todo->id, 'title' => 'Updated task']);
    }

    public function test_handle_updates_priority_and_status(): void
    {
        $user = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Task',
            'priority' => Priority::Low,
            'status' => TodoStatus::Pending,
        ]);

        $tool = new EditTodo($user);
        $tool->handle(new Request([
            'todo_id' => $todo->id,
            'priority' => 'high',
            'status' => 'in_progress',
        ]));

        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'priority' => 'high',
            'status' => 'in_progress',
        ]);
    }

    public function test_handle_updates_assigned_to(): void
    {
        $user = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $user->family_id]);
        $todo = Todo::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Task',
        ]);

        $tool = new EditTodo($user);
        $tool->handle(new Request([
            'todo_id' => $todo->id,
            'assigned_to' => $member->id,
        ]));

        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'assigned_to' => $member->id,
        ]);
    }

    public function test_handle_returns_error_for_unknown_todo(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new EditTodo($user);

        $result = $tool->handle(new Request(['todo_id' => 99999, 'title' => 'X']));

        $this->assertStringContainsString('Error', $result);
    }

    public function test_handle_cannot_edit_other_family_todo(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Other todo',
        ]);

        $tool = new EditTodo($user);
        $result = $tool->handle(new Request(['todo_id' => $todo->id, 'title' => 'Hacked']));

        $this->assertStringContainsString('Error', $result);
        $this->assertDatabaseHas('todos', ['id' => $todo->id, 'title' => 'Other todo']);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertNotEmpty((new EditTodo($user))->description());
    }
}
