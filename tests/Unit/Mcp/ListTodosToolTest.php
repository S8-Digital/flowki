<?php

namespace Tests\Unit\Mcp;

use App\Enums\TodoStatus;
use App\Mcp\Tools\ListTodosTool;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Mcp\Request;
use Tests\TestCase;

class ListTodosToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_error_when_user_has_no_family(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $tool = new ListTodosTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('Error', (string) $response->content());
    }

    public function test_returns_no_todos_message_when_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new ListTodosTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('No todos found', (string) $response->content());
    }

    public function test_lists_family_todos(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        Todo::factory()->pending()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Fix the fence',
        ]);

        $tool = new ListTodosTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('Fix the fence', (string) $response->content());
    }

    public function test_filters_todos_by_status(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        Todo::factory()->pending()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Pending task',
        ]);
        Todo::factory()->completed()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Done task',
        ]);

        $tool = new ListTodosTool;
        $response = $tool->handle(new Request(['status' => TodoStatus::Pending->value]));

        $this->assertStringContainsString('Pending task', (string) $response->content());
        $this->assertStringNotContainsString('Done task', (string) $response->content());
    }

    public function test_filters_todos_assigned_to_me(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->create(['family_id' => $user->family_id]);
        $this->actingAs($user);

        Todo::factory()->pending()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'assigned_to' => $user->id,
            'title' => 'My task',
        ]);
        Todo::factory()->pending()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'assigned_to' => $other->id,
            'title' => 'Their task',
        ]);

        $tool = new ListTodosTool;
        $response = $tool->handle(new Request(['assigned_to_me' => true]));

        $this->assertStringContainsString('My task', (string) $response->content());
        $this->assertStringNotContainsString('Their task', (string) $response->content());
    }

    public function test_does_not_list_other_family_todos(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $this->actingAs($user);

        Todo::factory()->pending()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Other family task',
        ]);

        $tool = new ListTodosTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('No todos found', (string) $response->content());
    }
}
