<?php

namespace App\Mcp\Tools;

use App\Enums\TodoStatus;
use App\Models\Todo;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Auth;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Mark a todo item as completed for the authenticated user\'s family.')]
class CompleteTodo extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $user = Auth::user();

        if (! $user?->family_id) {
            return Response::text('Error: User is not part of a family.');
        }

        $input = $request->all();

        if (empty($input['todo_id'])) {
            return Response::text('Error: todo_id is required. Use list_todos to find the correct ID.');
        }

        $todo = Todo::query()
            ->forFamily($user->family_id)
            ->find($input['todo_id']);

        if (! $todo) {
            return Response::text('Error: todo not found. Use list_todos to find the correct todo ID.');
        }

        $todo->update(['status' => TodoStatus::Completed->value]);

        return Response::text("✓ Todo marked as complete: \"{$todo->title}\" (ID: {$todo->id})");
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'todo_id' => $schema->integer()->description('ID of the todo to mark as complete')->required(),
        ];
    }
}
