<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\AddShoppingItemTool;
use App\Mcp\Tools\CompleteChore;
use App\Mcp\Tools\CompleteTodo;
use App\Mcp\Tools\CreateChoreTool;
use App\Mcp\Tools\CreateEventTool;
use App\Mcp\Tools\CreateTodoTool;
use App\Mcp\Tools\ListChoresTool;
use App\Mcp\Tools\ListEventsTool;
use App\Mcp\Tools\ListScheduleTool;
use App\Mcp\Tools\ListShoppingItemsTool;
use App\Mcp\Tools\ListTodosTool;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;

#[Name('Family Organizer')]
#[Version('1.0.0')]
#[Instructions(<<<'MARKDOWN'
    You are a helpful assistant for a Family Organizer app. You can help family members manage their
    todos, chores, calendar events, and shopping lists. All actions are scoped to the authenticated
    user's family. Today's date is always in context from the user's messages.

    Available tools:
    - create_todo: Create a new todo item
    - list_todos: List todos with optional filters
    - complete_todo: Mark a todo as completed
    - create_event: Schedule a calendar event
    - list_events: List calendar events with optional date range filters
    - list_schedule: List the authenticated user's personal schedule shifts (imported from rosters or schedules), with optional date range filters
    - create_chore: Add a recurring chore
    - list_chores: List chores with optional filters
    - complete_chore: Mark a chore as completed
    - add_shopping_item: Add an item to a shopping list
    - list_shopping_items: List items in a shopping list
    MARKDOWN)]
class FamilyOrganizerServer extends Server
{
    protected array $tools = [
        CreateTodoTool::class,
        ListTodosTool::class,
        CompleteTodo::class,
        CreateEventTool::class,
        ListEventsTool::class,
        ListScheduleTool::class,
        CreateChoreTool::class,
        ListChoresTool::class,
        CompleteChore::class,
        AddShoppingItemTool::class,
        ListShoppingItemsTool::class,
    ];

    protected array $resources = [];

    protected array $prompts = [];
}
