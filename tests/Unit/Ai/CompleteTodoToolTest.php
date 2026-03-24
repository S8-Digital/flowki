<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\CompleteTodo;
use App\Enums\TodoStatus;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class CompleteTodoToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_marks_todo_as_completed(): void
    {
        $user = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Book dentist',
            'status' => TodoStatus::Pending,
        ]);

        $tool = new CompleteTodo($user);
        $result = $tool->handle(new Request(['todo_id' => $todo->id]));

        $this->assertStringContainsString('✓', $result);
        $this->assertStringContainsString('Book dentist', $result);
        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'status' => TodoStatus::Completed->value,
        ]);
    }

    public function test_handle_returns_error_for_unknown_todo(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CompleteTodo($user);

        $result = $tool->handle(new Request(['todo_id' => 99999]));

        $this->assertStringContainsString('Error', $result);
    }

    public function test_handle_cannot_complete_other_family_todo(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Other todo',
            'status' => TodoStatus::Pending,
        ]);

        $tool = new CompleteTodo($user);
        $result = $tool->handle(new Request(['todo_id' => $todo->id]));

        $this->assertStringContainsString('Error', $result);
        $this->assertDatabaseHas('todos', ['id' => $todo->id, 'status' => 'pending']);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertNotEmpty((new CompleteTodo($user))->description());
    }
}
