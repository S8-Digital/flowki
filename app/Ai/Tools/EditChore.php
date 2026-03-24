<?php

namespace App\Ai\Tools;

use App\Models\Chore;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class EditChore implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Edit an existing chore. Call this when the user asks to update or change a chore. Use list_chores to find the chore ID first.';
    }

    public function handle(Request $request): string
    {
        $chore = Chore::query()
            ->forFamily($this->user->family_id)
            ->find($request['chore_id']);

        if (! $chore) {
            return 'Error: chore not found. Use list_chores to find the correct chore ID.';
        }

        $fields = array_filter([
            'title' => $request['title'] ?? null,
            'description' => $request['description'] ?? null,
            'frequency' => $request['frequency'] ?? null,
            'next_due_date' => $request['next_due_date'] ?? null,
            'reminder_enabled' => isset($request['reminder_enabled']) ? (bool) $request['reminder_enabled'] : null,
            'reminder_lead_time' => $request['reminder_lead_time'] ?? null,
        ], fn ($v) => $v !== null);

        if (! empty($fields)) {
            $chore->update($fields);
        }

        if (isset($request['assignee_ids'])) {
            $assigneeIds = is_array($request['assignee_ids'])
                ? $request['assignee_ids']
                : [$request['assignee_ids']];

            $assigneeIds = array_values(array_filter(
                array_map(static fn ($id): int => (int) $id, $assigneeIds),
                static fn (int $id): bool => $id > 0
            ));

            if ($assigneeIds === []) {
                $chore->assignees()->sync([]);
            } else {
                $validAssigneeIds = User::query()
                    ->where('family_id', $this->user->family_id)
                    ->whereIn('id', $assigneeIds)
                    ->pluck('id')
                    ->all();

                $invalidAssigneeIds = array_values(array_diff($assigneeIds, $validAssigneeIds));

                if (! empty($invalidAssigneeIds)) {
                    return 'Error: some assignee_ids do not belong to your family or are invalid: '
                        .implode(', ', $invalidAssigneeIds)
                        .'. Use list_family_members to find valid user IDs.';
                }

                $chore->assignees()->sync($validAssigneeIds);
            }
        }

        return "✓ Chore updated: \"{$chore->title}\" (ID: {$chore->id})";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'chore_id' => $schema->integer()->description('ID of the chore to edit')->required(),
            'title' => $schema->string()->description('New chore title'),
            'description' => $schema->string()->description('New description'),
            'frequency' => $schema->string()->description('New recurrence: once, daily, weekly, or monthly'),
            'next_due_date' => $schema->string()->description('New next due date as YYYY-MM-DD'),
            'reminder_enabled' => $schema->boolean()->description('Whether to enable reminders'),
            'reminder_lead_time' => $schema->integer()->description('Minutes before due date to send reminder'),
            'assignee_ids' => $schema->array()->description('List of family member user IDs to assign (replaces existing)'),
        ];
    }
}
