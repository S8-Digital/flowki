<?php

namespace App\Ai\Tools;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class EditTodo implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Edit an existing todo item. Call this when the user asks to update or change a todo. Use list_todos to find the todo ID first.';
    }

    public function handle(Request $request): string
    {
        $todo = Todo::query()
            ->forFamily($this->user->family_id)
            ->find($request['todo_id']);

        if (! $todo) {
            return 'Error: todo not found. Use list_todos to find the correct todo ID.';
        }

        $fields = array_filter([
            'title' => $request['title'] ?? null,
            'description' => $request['description'] ?? null,
            'category' => $request['category'] ?? null,
            'priority' => $request['priority'] ?? null,
            'status' => $request['status'] ?? null,
            'due_date' => $request['due_date'] ?? null,
            'assigned_to' => $request['assigned_to'] ?? null,
            'reminder_enabled' => isset($request['reminder_enabled']) ? (bool) $request['reminder_enabled'] : null,
            'reminder_lead_time' => $request['reminder_lead_time'] ?? null,
        ], fn ($v) => $v !== null);

        if (! empty($fields)) {
            $todo->update($fields);
        }

        return "✓ Todo updated: \"{$todo->title}\" (ID: {$todo->id})";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'todo_id' => $schema->integer()->description('ID of the todo to edit')->required(),
            'title' => $schema->string()->description('New title'),
            'description' => $schema->string()->description('New description'),
            'category' => $schema->string()->description('New category: home, work, school, or personal'),
            'priority' => $schema->string()->description('New priority: low, medium, or high'),
            'status' => $schema->string()->description('New status: pending, in_progress, or completed'),
            'due_date' => $schema->string()->description('New due date as YYYY-MM-DD'),
            'assigned_to' => $schema->integer()->description('User ID to assign this todo to'),
            'reminder_enabled' => $schema->boolean()->description('Whether to enable reminders'),
            'reminder_lead_time' => $schema->integer()->description('Minutes before due date to send reminder'),
        ];
    }
}
