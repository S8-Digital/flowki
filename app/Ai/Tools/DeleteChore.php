<?php

namespace App\Ai\Tools;

use App\Models\Chore;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class DeleteChore implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Delete a chore. Call this when the user asks to remove or delete a chore. Use list_chores to find the chore ID first.';
    }

    public function handle(Request $request): string
    {
        $chore = Chore::query()
            ->forFamily($this->user->family_id)
            ->find($request['chore_id']);

        if (! $chore) {
            return 'Error: chore not found. Use list_chores to find the correct chore ID.';
        }

        $title = $chore->title;
        $chore->delete();

        return "✓ Chore deleted: \"{$title}\"";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'chore_id' => $schema->integer()->description('ID of the chore to delete')->required(),
        ];
    }
}
