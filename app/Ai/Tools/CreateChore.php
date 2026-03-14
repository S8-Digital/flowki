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
        ]);

        return "✓ Chore created: \"{$chore->title}\" ({$chore->frequency->value})";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->description('Chore title')->required(),
            'description' => $schema->string()->description('Optional description'),
            'frequency' => $schema->string()->description('daily, weekly, biweekly, monthly, or as_needed'),
            'next_due_date' => $schema->string()->description('Next due date as YYYY-MM-DD'),
        ];
    }
}

