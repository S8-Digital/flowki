<?php

namespace App\Ai\Tools;

use App\Enums\ChoreFrequency;
use App\Models\Chore;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class CreateChore implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Add a recurring chore to the family chore list. Call this when the user asks to track a household task or chore.';
    }

    public function handle(Request $request): string
    {
        $chore = Chore::create([
            'family_id' => $this->user->family_id,
            'created_by' => $this->user->id,
            'title' => $request['title'],
            'description' => $request['description'] ?? null,
            'frequency' => $request['frequency'] ?? ChoreFrequency::Weekly->value,
            'next_due_date' => $request['next_due_date'] ?? null,
            'reminder_enabled' => (bool) ($request['reminder_enabled'] ?? false),
            'reminder_lead_time' => $request['reminder_lead_time'] ?? 60,
        ]);

        if (! empty($request['assignee_ids'])) {
            $assigneeIds = array_values(array_unique(array_map('intval', (array) $request['assignee_ids'])));

            $validAssigneeIds = User::query()
                ->where('family_id', $this->user->family_id)
                ->whereIn('id', $assigneeIds)
                ->pluck('id')
                ->all();

            sort($assigneeIds);
            sort($validAssigneeIds);

            if ($assigneeIds !== $validAssigneeIds) {
                $invalidIds = array_values(array_diff($assigneeIds, $validAssigneeIds));

                return 'Error: One or more assignee IDs are invalid or do not belong to this family: '.implode(', ', $invalidIds);
            }

            $chore->assignees()->sync($validAssigneeIds);
        }

        return "✓ Chore created: \"{$chore->title}\" ({$chore->frequency->value}) (ID: {$chore->id})";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->description('Chore title')->required(),
            'description' => $schema->string()->description('Optional description'),
            'frequency' => $schema->string()->description('Recurrence: once, daily, weekly, or monthly'),
            'next_due_date' => $schema->string()->description('Next due date as YYYY-MM-DD'),
            'reminder_enabled' => $schema->boolean()->description('Whether to send a reminder'),
            'reminder_lead_time' => $schema->integer()->description('How many minutes before the due date to send the reminder'),
            'assignee_ids' => $schema->array()->description('List of family member user IDs to assign this chore to'),
        ];
    }
}
