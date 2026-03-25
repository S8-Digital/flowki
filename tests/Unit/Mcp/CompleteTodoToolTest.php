<?php

namespace Tests\Unit\Mcp;

use App\Enums\TodoStatus;
use App\Mcp\Tools\CompleteTodo;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Mcp\Request;
use Tests\TestCase;

class CompleteTodoToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_error_when_user_has_no_family(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $tool = new CompleteTodo;
        $response = $tool->handle(new Request(['todo_id' => 1]));

        $this->assertStringContainsString('Error', (string) $response->content());
        $this->assertStringContainsString('family', (string) $response->content());
    }

    public function test_returns_error_when_todo_id_is_missing(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new CompleteTodo;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('Error', (string) $response->content());
        $this->assertStringContainsString('todo_id', (string) $response->content());
    }

    public function test_returns_error_when_todo_not_found(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new CompleteTodo;
        $response = $tool->handle(new Request(['todo_id' => 99999]));

        $this->assertStringContainsString('Error', (string) $response->content());
    }

    public function test_cannot_complete_todo_from_other_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Other family todo',
        ]);

        $this->actingAs($user);

        $tool = new CompleteTodo;
        $response = $tool->handle(new Request(['todo_id' => $todo->id]));

        $this->assertStringContainsString('Error', (string) $response->content());
        $this->assertDatabaseMissing('todos', [
            'id' => $todo->id,
            'status' => TodoStatus::Completed->value,
        ]);
    }

    public function test_marks_todo_as_complete(): void
    {
        $user = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Buy groceries',
        ]);

        $this->actingAs($user);

        $tool = new CompleteTodo;
        $response = $tool->handle(new Request(['todo_id' => $todo->id]));

        $this->assertStringContainsString('✓', (string) $response->content());
        $this->assertStringContainsString('Buy groceries', (string) $response->content());
        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'status' => TodoStatus::Completed->value,
        ]);
    }
}
