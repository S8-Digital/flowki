<?php

namespace App\Ai\Tools;

use App\Models\Chore;
use App\Models\ChoreCompletion;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class CompleteChore implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Mark a chore as completed. Call this when the user says they have done or finished a chore. Use list_chores to find the chore ID first.';
    }

    public function handle(Request $request): string
    {
        $chore = Chore::query()
            ->forFamily($this->user->family_id)
            ->find($request['chore_id']);

        if (! $chore) {
            return 'Error: chore not found. Use list_chores to find the correct chore ID.';
        }

        ChoreCompletion::create([
            'chore_id' => $chore->id,
            'completed_by' => $this->user->id,
            'completed_at' => now(),
            'notes' => $request['notes'] ?? null,
        ]);

        return "✓ Chore marked as complete: \"{$chore->title}\"";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'chore_id' => $schema->integer()->description('ID of the chore to mark as complete')->required(),
            'notes' => $schema->string()->description('Optional completion notes'),
        ];
    }
}
