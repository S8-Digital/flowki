<?php

namespace App\Ai\Tools;

use App\Enums\TodoStatus;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class CompleteTodo implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Mark a todo as completed. Call this when the user says they have finished or done a todo. Use list_todos to find the todo ID first.';
    }

    public function handle(Request $request): string
    {
        $todo = Todo::query()
            ->forFamily($this->user->family_id)
            ->find($request['todo_id']);

        if (! $todo) {
            return 'Error: todo not found. Use list_todos to find the correct todo ID.';
        }

        $todo->update(['status' => TodoStatus::Completed->value]);

        return "✓ Todo marked as complete: \"{$todo->title}\"";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'todo_id' => $schema->integer()->description('ID of the todo to mark as complete')->required(),
        ];
    }
}
