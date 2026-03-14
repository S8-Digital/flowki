<?php

namespace App\Mcp\Tools;

use App\Enums\ChoreFrequency;
use App\Models\Chore;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Auth;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Create a new chore for the authenticated user\'s family.')]
class CreateChoreTool extends Tool
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

        $input = $request->input();

        if (empty($input['title'])) {
            return Response::text('Error: title is required.');
        }

        $chore = Chore::create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => $input['title'],
            'description' => $input['description'] ?? null,
            'frequency' => $input['frequency'] ?? ChoreFrequency::Weekly->value,
            'next_due_date' => $input['next_due_date'] ?? null,
        ]);

        return Response::text("Chore created: \"{$chore->title}\" ({$chore->frequency->value})");
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, \Illuminate\Contracts\JsonSchema\JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->description('The chore title')->required(),
            'description' => $schema->string()->description('Optional description'),
            'frequency' => $schema->string()->description('Frequency: daily, weekly, biweekly, monthly, or as_needed'),
            'next_due_date' => $schema->string()->description('Next due date in YYYY-MM-DD format'),
        ];
    }
}
