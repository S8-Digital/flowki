<?php

namespace App\Mcp\Tools;

use App\Models\Chore;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Auth;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('List chores for the authenticated user\'s family, with optional filters.')]
class ListChoresTool extends Tool
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

        $chores = Chore::query()
            ->forFamily($user->family_id)
            ->when(! empty($input['frequency']), fn ($q) => $q->where('frequency', $input['frequency']))
            ->when(! empty($input['due_today']), fn ($q) => $q->dueToday())
            ->orderBy('next_due_date')
            ->limit(20)
            ->get();

        if ($chores->isEmpty()) {
            return Response::text('No chores found matching those criteria.');
        }

        $lines = $chores->map(function (Chore $chore) {
            $due = $chore->next_due_date ? " (due {$chore->next_due_date->toDateString()})" : '';

            return "• [{$chore->frequency->value}] {$chore->title}{$due}";
        });

        return Response::text("Chores ({$chores->count()}):\n".$lines->implode("\n"));
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'frequency' => $schema->string()->description('Filter by frequency: daily, weekly, biweekly, monthly, or as_needed'),
            'due_today' => $schema->boolean()->description('Only show chores due today'),
        ];
    }
}
