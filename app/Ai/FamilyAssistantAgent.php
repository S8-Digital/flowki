<?php

namespace App\Ai;

use App\Ai\Tools\AddShoppingItem;
use App\Ai\Tools\CreateChore;
use App\Ai\Tools\CreateEvent;
use App\Ai\Tools\CreateTodo;
use App\Ai\Tools\ListTodos;
use App\Models\User;
use Laravel\Ai\AnonymousAgent;
use Laravel\Ai\Messages\AssistantMessage;
use Laravel\Ai\Messages\UserMessage;
use Laravel\Ai\Responses\StreamableAgentResponse;

class FamilyAssistantAgent
{
    public function __construct(protected User $user) {}

    /**
     * @param  array<array{role: string, content: string}>  $history
     */
    public function stream(string $prompt, array $history = []): StreamableAgentResponse
    {
        $messages = collect($history)->map(fn (array $msg) => match ($msg['role']) {
            'assistant' => new AssistantMessage($msg['content']),
            default => new UserMessage($msg['content']),
        })->all();

        $instructions = <<<MARKDOWN
        You are a helpful family assistant for the Family Organizer app. Today's date is {$this->today()}.
        The user's name is {$this->user->name}. Their family has the following members: {$this->familyMemberNames()}.

        You can help with:
        - Creating and listing todos (use the create_todo and list_todos tools)
        - Scheduling calendar events (use the create_event tool)
        - Adding chores (use the create_chore tool)
        - Adding items to shopping lists (use the add_shopping_item tool)

        When the user asks to create something, use the appropriate tool and confirm what was created.
        Keep responses concise and friendly.
        MARKDOWN;

        return AnonymousAgent::make(
            instructions: $instructions,
            messages: $messages,
            tools: [
                new CreateTodo($this->user),
                new ListTodos($this->user),
                new CreateEvent($this->user),
                new CreateChore($this->user),
                new AddShoppingItem($this->user),
            ]
        )->stream($prompt);
    }

    protected function today(): string
    {
        return now()->toFormattedDayDateString();
    }

    protected function familyMemberNames(): string
    {
        return $this->user->family?->members()
            ->pluck('name')
            ->implode(', ') ?? 'just you';
    }
}

