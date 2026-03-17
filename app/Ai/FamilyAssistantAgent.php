<?php

namespace App\Ai;

use App\Ai\Tools\AddShoppingItem;
use App\Ai\Tools\CreateChore;
use App\Ai\Tools\CreateEvent;
use App\Ai\Tools\CreateTodo;
use App\Ai\Tools\ImportRecipe;
use App\Ai\Tools\ListChores;
use App\Ai\Tools\ListEvents;
use App\Ai\Tools\ListSchedule;
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

        if (! $this->user->family_id) {
            $instructions = "You are a helpful family assistant. The user ({$this->user->name}) has not joined or created a family yet. Politely let them know they need to create or join a family before you can help manage todos, events, chores, and shopping lists.";

            return AnonymousAgent::make(
                instructions: $instructions,
                messages: $messages,
                tools: []
            )->stream($prompt);
        }

        $instructions = <<<MARKDOWN
        You are a helpful family assistant for the Family Organizer app. Today's date is {$this->today()}.
        The user's name is {$this->user->name}. Their family has the following members: {$this->familyMemberNames()}.

        You can help with:
        - Creating and listing todos (use the create_todo and list_todos tools)
        - Scheduling and listing calendar events (use the create_event and list_events tools)
        - Listing the user's personal schedule / roster shifts (use the list_schedule tool)
        - Adding and listing chores (use the create_chore and list_chores tools)
        - Adding items to shopping lists (use the add_shopping_item tool)
        - Importing recipes from pasted text or URLs (use the import_recipe tool)

        When the user asks to create something, use the appropriate tool and confirm what was created.
        When the user asks to see or list something, use the appropriate listing tool.
        When the user asks about their work schedule, roster, or shifts, use the list_schedule tool.
        When the user pastes a recipe or asks to import one, use import_recipe to extract and save it.
        Keep responses concise and friendly.
        MARKDOWN;

        return AnonymousAgent::make(
            instructions: $instructions,
            messages: $messages,
            tools: [
                new CreateTodo($this->user),
                new ListTodos($this->user),
                new CreateEvent($this->user),
                new ListEvents($this->user),
                new ListSchedule($this->user),
                new CreateChore($this->user),
                new ListChores($this->user),
                new AddShoppingItem($this->user),
                new ImportRecipe($this->user),
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
