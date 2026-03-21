<?php

namespace App\Mcp\Tools;

use App\Models\Todo;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Auth;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('List todos for the authenticated user\'s family, with optional filters.')]
class ListTodosTool extends Tool
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

        $todos = Todo::query()
            ->forFamily($user->family_id)
            ->with(['assignee:id,name', 'creator:id,name'])
            ->when(! empty($input['status']), fn ($q) => $q->where('status', $input['status']))
            ->when(! empty($input['priority']), fn ($q) => $q->where('priority', $input['priority']))
            ->when(! empty($input['assigned_to_me']), fn ($q) => $q->where('assigned_to', $user->id))
            ->orderBy('due_date')
            ->limit(20)
            ->get();

        if ($todos->isEmpty()) {
            return Response::text('No todos found matching those criteria.');
        }

        $lines = $todos->map(function (Todo $todo) {
            $due = $todo->due_date ? " (due {$todo->due_date->toDateString()})" : '';
            $assignee = $todo->assignee ? " → {$todo->assignee->name}" : '';

            return "• [{$todo->status->value}] {$todo->title}{$due}{$assignee}";
        });

        return Response::text("Todos ({$todos->count()}):\n".$lines->implode("\n"));
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'status' => $schema->string()->description('Filter by status: pending, in_progress, or completed'),
            'priority' => $schema->string()->description('Filter by priority: low, medium, or high'),
            'assigned_to_me' => $schema->boolean()->description('Only show todos assigned to the current user'),
        ];
    }
}
