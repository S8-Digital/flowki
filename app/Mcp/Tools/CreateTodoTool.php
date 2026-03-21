<?php

namespace App\Mcp\Tools;

use App\Enums\Priority;
use App\Enums\TodoCategory;
use App\Enums\TodoStatus;
use App\Models\Todo;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Auth;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Create a new todo item for the authenticated user\'s family.')]
class CreateTodoTool extends Tool
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

        $todo = Todo::create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => $input['title'],
            'description' => $input['description'] ?? null,
            'category' => $input['category'] ?? TodoCategory::Personal->value,
            'priority' => $input['priority'] ?? Priority::Medium->value,
            'status' => TodoStatus::Pending->value,
            'due_date' => $input['due_date'] ?? null,
        ]);

        return Response::text("Todo created: \"{$todo->title}\" (ID: {$todo->id})");
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->description('The title of the todo item')->required(),
            'description' => $schema->string()->description('Optional details or notes'),
            'category' => $schema->string()->description('Category: home, work, school, personal, or other'),
            'priority' => $schema->string()->description('Priority level: low, medium, or high'),
            'due_date' => $schema->string()->description('Optional due date in YYYY-MM-DD format'),
        ];
    }
}
