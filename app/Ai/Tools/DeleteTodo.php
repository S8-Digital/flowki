<?php

namespace App\Ai\Tools;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class DeleteTodo implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Delete a todo item. Call this when the user asks to remove or delete a todo. Use list_todos to find the todo ID first.';
    }

    public function handle(Request $request): string
    {
        $todo = Todo::query()
            ->forFamily($this->user->family_id)
            ->find($request['todo_id']);

        if (! $todo) {
            return 'Error: todo not found. Use list_todos to find the correct todo ID.';
        }

        $title = $todo->title;
        $todo->delete();

        return "✓ Todo deleted: \"{$title}\"";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'todo_id' => $schema->integer()->description('ID of the todo to delete')->required(),
        ];
    }
}
