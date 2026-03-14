<?php

namespace App\Ai\Tools;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class ListTodos implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'List todos for the family with optional filters. Call this when the user asks what tasks are pending, due, or assigned.';
    }

    public function handle(Request $request): string
    {
        $todos = Todo::query()
            ->forFamily($this->user->family_id)
            ->with(['assignee:id,name'])
            ->when($request['status'] ?? null, fn ($q) => $q->where('status', $request['status']))
            ->when($request['priority'] ?? null, fn ($q) => $q->where('priority', $request['priority']))
            ->when($request['assigned_to_me'] ?? false, fn ($q) => $q->where('assigned_to', $this->user->id))
            ->orderBy('due_date')
            ->limit(20)
            ->get();

        if ($todos->isEmpty()) {
            return 'No todos found matching that criteria.';
        }

        return $todos->map(function (Todo $todo) {
            $due = $todo->due_date ? " (due {$todo->due_date->toDateString()})" : '';
            $assignee = $todo->assignee ? " → {$todo->assignee->name}" : '';

            return "• [{$todo->status->value}] {$todo->title}{$due}{$assignee}";
        })->implode("\n");
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'status' => $schema->string()->description('Filter by: pending, in_progress, or completed'),
            'priority' => $schema->string()->description('Filter by: low, medium, or high'),
            'assigned_to_me' => $schema->boolean()->description('Only show todos assigned to the current user'),
        ];
    }
}

