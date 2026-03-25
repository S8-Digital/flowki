<?php

namespace App\Mcp\Tools;

use App\Models\Chore;
use App\Models\ChoreCompletion;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Auth;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Mark a chore as completed for the authenticated user\'s family.')]
class CompleteChore extends Tool
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

        if (empty($input['chore_id'])) {
            return Response::text('Error: chore_id is required. Use list_chores to find the correct ID.');
        }

        $chore = Chore::query()
            ->forFamily($user->family_id)
            ->find($input['chore_id']);

        if (! $chore) {
            return Response::text('Error: chore not found. Use list_chores to find the correct chore ID.');
        }

        ChoreCompletion::create([
            'chore_id' => $chore->id,
            'completed_by' => $user->id,
            'completed_at' => now(),
            'notes' => $input['notes'] ?? null,
        ]);

        return Response::text("✓ Chore marked as complete: \"{$chore->title}\" (ID: {$chore->id})");
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'chore_id' => $schema->integer()->description('ID of the chore to mark as complete')->required(),
            'notes' => $schema->string()->description('Optional completion notes'),
        ];
    }
}
