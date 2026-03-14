<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\AddShoppingItemTool;
use App\Mcp\Tools\CreateChoreTool;
use App\Mcp\Tools\CreateEventTool;
use App\Mcp\Tools\CreateTodoTool;
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
    - create_event: Schedule a calendar event
    - create_chore: Add a recurring chore
    - add_shopping_item: Add an item to a shopping list
    MARKDOWN)]
class FamilyOrganizerServer extends Server
{
    protected array $tools = [
        CreateTodoTool::class,
        ListTodosTool::class,
        CreateEventTool::class,
        CreateChoreTool::class,
        AddShoppingItemTool::class,
    ];

    protected array $resources = [];

    protected array $prompts = [];
}
