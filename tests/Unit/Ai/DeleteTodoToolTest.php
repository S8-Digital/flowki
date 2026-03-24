<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\DeleteTodo;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class DeleteTodoToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_deletes_the_todo(): void
    {
        $user = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Buy milk',
        ]);

        $tool = new DeleteTodo($user);
        $result = $tool->handle(new Request(['todo_id' => $todo->id]));

        $this->assertStringContainsString('✓', $result);
        $this->assertStringContainsString('Buy milk', $result);
        $this->assertDatabaseMissing('todos', ['id' => $todo->id]);
    }

    public function test_handle_returns_error_for_unknown_todo(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new DeleteTodo($user);

        $result = $tool->handle(new Request(['todo_id' => 99999]));

        $this->assertStringContainsString('Error', $result);
    }

    public function test_handle_cannot_delete_other_family_todo(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Other todo',
        ]);

        $tool = new DeleteTodo($user);
        $result = $tool->handle(new Request(['todo_id' => $todo->id]));

        $this->assertStringContainsString('Error', $result);
        $this->assertDatabaseHas('todos', ['id' => $todo->id]);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertNotEmpty((new DeleteTodo($user))->description());
    }
}
