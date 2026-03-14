<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\CreateTodo;
use App\Enums\Priority;
use App\Enums\TodoCategory;
use App\Enums\TodoStatus;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Mockery\MockInterface;
use Tests\TestCase;

class CreateTodoToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_creates_todo_and_returns_confirmation(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateTodo($user);

        $result = $tool->handle(new Request([
            'title' => 'Book dentist',
            'priority' => Priority::High->value,
        ]));

        $this->assertStringContainsString('Book dentist', $result);
        $this->assertDatabaseHas('todos', [
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Book dentist',
            'status' => TodoStatus::Pending->value,
        ]);
    }

    public function test_handle_uses_default_category_and_priority_when_not_provided(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateTodo($user);

        $tool->handle(new Request(['title' => 'Test todo']));

        $this->assertDatabaseHas('todos', [
            'title' => 'Test todo',
            'category' => TodoCategory::Personal->value,
            'priority' => Priority::Medium->value,
        ]);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateTodo($user);

        $this->assertNotEmpty($tool->description());
    }

    public function test_schema_contains_expected_fields(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateTodo($user);

        /** @var JsonSchema&MockInterface $schema */
        $schema = \Mockery::mock(JsonSchema::class);
        $schema->shouldReceive('string')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('boolean')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('description')->andReturnSelf()->zeroOrMoreTimes();
        $schema->shouldReceive('required')->andReturnSelf()->zeroOrMoreTimes();

        $fields = $tool->schema($schema);

        $this->assertArrayHasKey('title', $fields);
        $this->assertArrayHasKey('description', $fields);
        $this->assertArrayHasKey('priority', $fields);
        $this->assertArrayHasKey('due_date', $fields);
    }
}
