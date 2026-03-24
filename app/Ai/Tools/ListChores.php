<?php

namespace App\Ai\Tools;

use App\Models\Chore;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class ListChores implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'List chores for the family with optional filters. Call this when the user asks about household tasks, chores, or recurring duties.';
    }

    public function handle(Request $request): string
    {
        $chores = Chore::query()
            ->forFamily($this->user->family_id)
            ->when($request['frequency'] ?? null, fn ($q) => $q->where('frequency', $request['frequency']))
            ->when($request['due_today'] ?? false, fn ($q) => $q->dueToday())
            ->orderBy('next_due_date')
            ->limit(20)
            ->get();

        if ($chores->isEmpty()) {
            return 'No chores found matching that criteria.';
        }

        return $chores->map(function (Chore $chore) {
            $due = $chore->next_due_date ? " (due {$chore->next_due_date->toDateString()})" : '';

            return "• [ID:{$chore->id}] [{$chore->frequency->value}] {$chore->title}{$due}";
        })->implode("\n");
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'frequency' => $schema->string()->description('Filter by frequency: once, daily, weekly, or monthly'),
            'due_today' => $schema->boolean()->description('Only show chores due today'),
        ];
    }
}
