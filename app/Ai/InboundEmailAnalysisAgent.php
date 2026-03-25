<?php

namespace App\Ai;

use App\Ai\Tools\AddShoppingItem;
use App\Ai\Tools\CreateChore;
use App\Ai\Tools\CreateEvent;
use App\Ai\Tools\CreateTodo;
use App\Models\User;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;

/**
 * Specialist email planning agent.
 *
 * Analyses inbound emails and creates the appropriate family organiser items
 * (calendar events, todos, chores, or shopping list entries) based on the
 * email content.
 */
class InboundEmailAnalysisAgent implements Agent, HasTools
{
    use Promptable;

    public function __construct(protected User $user) {}

    public function instructions(): string
    {
        $today = now()->toFormattedDayDateString();
        $userName = $this->user->name;
        $userId = $this->user->id;

        return <<<MARKDOWN
        You are a specialist email planning assistant for the Family Organiser app. Today's date is {$today}.

        You are an expert at reading emails and extracting actionable items. You have been given an email
        received by {$userName} (user ID {$userId}). Your job is to systematically parse the entire email
        and create the appropriate items in the family organiser.

        ## Assignment rule
        Assign all created items to user ID {$userId} by default unless the email clearly addresses
        or delegates a task to a specific other family member.

        ## Decision rules — apply in order
        1. Appointment, meeting, event, shift, roster entry, or calendar invite → use create_event
        2. One-off task, reminder, or action item → use create_todo
        3. Recurring household duty or chore → use create_chore
        4. Grocery list or items to buy → use add_shopping_item
        5. Calendar attachment (.ics file) → create one calendar event per VEVENT block in the file
        6. Multiple actionable items in one email → create all of them
        7. Purely informational email, newsletter, or spam → do nothing

        ## Tie-breaking rule
        When in doubt between a todo and a calendar event, always prefer creating a calendar event.

        Be thorough and systematic. Read the entire email before taking any action.
        MARKDOWN;
    }

    public function tools(): iterable
    {
        return [
            new CreateEvent($this->user),
            new CreateTodo($this->user),
            new CreateChore($this->user),
            new AddShoppingItem($this->user),
        ];
    }
}
