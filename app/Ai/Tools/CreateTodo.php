<?php

namespace App\Ai\Tools;

use App\Enums\Priority;
use App\Enums\TodoCategory;
use App\Enums\TodoStatus;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class CreateTodo implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Create a new todo item for the family. Call this when the user asks to add a task, reminder, or todo.';
    }

    public function handle(Request $request): string
    {
        $todo = Todo::create([
            'family_id' => $this->user->family_id,
            'created_by' => $this->user->id,
            'title' => $request['title'],
            'description' => $request['description'] ?? null,
            'category' => $request['category'] ?? TodoCategory::Personal->value,
            'priority' => $request['priority'] ?? Priority::Medium->value,
            'status' => TodoStatus::Pending->value,
            'due_date' => $request['due_date'] ?? null,
        ]);

        return "✓ Todo created: \"{$todo->title}\"";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->description('The todo title')->required(),
            'description' => $schema->string()->description('Optional description'),
            'category' => $schema->string()->description('home, work, school, personal, or other'),
            'priority' => $schema->string()->description('low, medium, or high'),
            'due_date' => $schema->string()->description('Due date as YYYY-MM-DD'),
        ];
    }
}

