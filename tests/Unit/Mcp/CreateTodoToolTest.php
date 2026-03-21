<?php

namespace Tests\Unit\Mcp;

use App\Enums\Priority;
use App\Enums\TodoCategory;
use App\Enums\TodoStatus;
use App\Mcp\Tools\CreateTodoTool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Mcp\Request;
use Tests\TestCase;

class CreateTodoToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_error_when_user_has_no_family(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $tool = new CreateTodoTool;
        $response = $tool->handle(new Request(['title' => 'Buy milk']));

        $this->assertStringContainsString('Error', (string) $response->content());
        $this->assertStringContainsString('family', (string) $response->content());
    }

    public function test_creates_todo_with_defaults(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new CreateTodoTool;
        $response = $tool->handle(new Request(['title' => 'Buy milk']));

        $this->assertStringContainsString('Buy milk', (string) $response->content());
        $this->assertDatabaseHas('todos', [
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Buy milk',
            'status' => TodoStatus::Pending->value,
            'category' => TodoCategory::Personal->value,
            'priority' => Priority::Medium->value,
        ]);
    }

    public function test_creates_todo_with_all_fields(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new CreateTodoTool;
        $response = $tool->handle(new Request([
            'title' => 'Submit tax return',
            'description' => 'Including all receipts',
            'category' => TodoCategory::Personal->value,
            'priority' => Priority::High->value,
            'due_date' => '2026-04-30',
        ]));

        $this->assertStringContainsString('Submit tax return', (string) $response->content());
        $this->assertDatabaseHas('todos', [
            'title' => 'Submit tax return',
            'priority' => Priority::High->value,
            'description' => 'Including all receipts',
        ]);
    }
}
