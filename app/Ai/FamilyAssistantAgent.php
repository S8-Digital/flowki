<?php

namespace App\Ai;

use App\Ai\Tools\AcceptMealSuggestions;
use App\Ai\Tools\AddShoppingItem;
use App\Ai\Tools\CompleteChore;
use App\Ai\Tools\CompleteTodo;
use App\Ai\Tools\CreateChore;
use App\Ai\Tools\CreateEvent;
use App\Ai\Tools\CreateTodo;
use App\Ai\Tools\DeleteChore;
use App\Ai\Tools\DeleteEvent;
use App\Ai\Tools\DeleteTodo;
use App\Ai\Tools\EditChore;
use App\Ai\Tools\EditEvent;
use App\Ai\Tools\EditTodo;
use App\Ai\Tools\FetchUrlContent;
use App\Ai\Tools\ImportRecipe;
use App\Ai\Tools\ListChores;
use App\Ai\Tools\ListEvents;
use App\Ai\Tools\ListRecipes;
use App\Ai\Tools\ListSchedule;
use App\Ai\Tools\ListShoppingItems;
use App\Ai\Tools\ListTodos;
use App\Ai\Tools\SuggestWeeklyMeals;
use App\Models\User;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Messages\AssistantMessage;
use Laravel\Ai\Messages\UserMessage;
use Laravel\Ai\Promptable;

class FamilyAssistantAgent implements Agent, Conversational, HasTools
{
    use Promptable;

    /** @var array<object> */
    private array $conversationMessages = [];

    /**
     * @param  array<array{role: string, content: string}>  $history
     */
    public function __construct(protected User $user, array $history = [])
    {
        $this->conversationMessages = collect($history)->map(fn (array $msg) => match ($msg['role']) {
            'assistant' => new AssistantMessage($msg['content']),
            default => new UserMessage($msg['content']),
        })->all();
    }

    public function instructions(): string
    {
        if (! $this->user->family_id) {
            return "You are a helpful family assistant. The user ({$this->user->name}) has not joined or created a family yet. Politely let them know they need to create or join a family before you can help manage todos, events, chores, and shopping lists.";
        }

        return <<<MARKDOWN
        You are a helpful family assistant for the Family Organizer app. Today's date is {$this->today()}.
        The user's name is {$this->user->name}. Their family has the following members: {$this->familyMemberNames()}.

        You can help with:
        - Creating, editing, and deleting todos; marking them as complete (use create_todo, list_todos, edit_todo, delete_todo, complete_todo)
        - Scheduling, editing, and deleting calendar events (use create_event, list_events, edit_event, delete_event)
        - Listing the user's personal schedule / roster shifts (use list_schedule)
        - Adding, editing, and deleting chores; marking them as complete (use create_chore, list_chores, edit_chore, delete_chore, complete_chore)
        - Adding items to shopping lists and reading shopping lists (use add_shopping_item, list_shopping_items)
        - Importing and editing recipes; listing and filtering the recipe collection (use import_recipe, list_recipes, edit_recipe, delete_recipe)
        - Planning weekly meals: suggest a meal plan (use suggest_weekly_meals) and create it once accepted (use accept_meal_suggestions)

        When the user asks to create something, use the appropriate tool and confirm what was created.
        When the user asks to edit or update something, use the appropriate edit tool. If you do not have the item ID, list items first to find it.
        When the user asks to delete something, confirm the item with the user before deleting if you are not certain which item they mean.
        When the user asks to see or list something, use the appropriate listing tool.
        When the user asks about their work schedule, roster, or shifts, use list_schedule.
        When the user pastes a recipe or asks to import one from text, use import_recipe to extract and save it.
        When the user provides a recipe URL to import, ALWAYS follow these steps:
        1. Call fetch_url_content with the URL to retrieve the recipe data.
        2. The response will contain structured recipe fields (title, description, servings, prep/cook times, ingredients, instructions) and, if available, a "Recipe Image URL:" line at the top.
        3. Call import_recipe with ALL extracted fields:
           - Pass image_url if "Recipe Image URL: ..." is present at the start of the fetched content.
           - Break each ingredient into its own object with "name", "quantity", and "unit" — do not lump everything into the name (e.g. "2 cups flour" → {name:"flour", quantity:"2", unit:"cups"}).
           - Pass instructions exactly as formatted in the fetched content.
        4. Confirm what was imported.
        When the user asks to plan meals for the week, call suggest_weekly_meals to retrieve available recipes and the current schedule, then propose a plan. Once the user accepts, call accept_meal_suggestions to create the meals.
        Keep responses concise and friendly.
        MARKDOWN;
    }

    public function messages(): iterable
    {
        return $this->conversationMessages;
    }

    public function tools(): iterable
    {
        if (! $this->user->family_id) {
            return [];
        }

        return [
            new CreateTodo($this->user),
            new ListTodos($this->user),
            new EditTodo($this->user),
            new DeleteTodo($this->user),
            new CompleteTodo($this->user),
            new CreateEvent($this->user),
            new ListEvents($this->user),
            new EditEvent($this->user),
            new DeleteEvent($this->user),
            new ListSchedule($this->user),
            new CreateChore($this->user),
            new ListChores($this->user),
            new EditChore($this->user),
            new DeleteChore($this->user),
            new CompleteChore($this->user),
            new AddShoppingItem($this->user),
            new ListShoppingItems($this->user),
            new ImportRecipe($this->user),
            new ListRecipes($this->user),
            new FetchUrlContent($this->user),
            new SuggestWeeklyMeals($this->user),
            new AcceptMealSuggestions($this->user),
        ];
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
