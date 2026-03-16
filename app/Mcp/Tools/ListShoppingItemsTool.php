<?php

namespace App\Mcp\Tools;

use App\Models\ShoppingList;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Auth;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('List items in the family shopping lists, optionally filtering by list name or unchecked status.')]
class ListShoppingItemsTool extends Tool
{
    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $user = Auth::user();

        if (! $user?->family_id) {
            return Response::text('Error: User is not part of a family.');
        }

        $input = $request->input();

        $list = ShoppingList::query()
            ->forFamily($user->family_id)
            ->when(
                ! empty($input['list_name']),
                fn ($q) => $q->where('name', 'like', '%'.$input['list_name'].'%')
            )
            ->latest()
            ->first();

        if (! $list) {
            return Response::text('No shopping list found.');
        }

        $items = $list->items()
            ->when(! empty($input['unchecked_only']), fn ($q) => $q->where('is_checked', false))
            ->orderBy('category')
            ->orderBy('name')
            ->limit(50)
            ->get();

        if ($items->isEmpty()) {
            return Response::text("The \"{$list->name}\" shopping list is empty.");
        }

        $lines = $items->map(function ($item) {
            $checked = $item->is_checked ? '[x]' : '[ ]';
            $qty = $item->quantity ? " ({$item->quantity})" : '';

            return "• {$checked} {$item->name}{$qty}";
        });

        return Response::text("\"{$list->name}\" ({$items->count()} items):\n".$lines->implode("\n"));
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'list_name' => $schema->string()->description('Name of the shopping list to view (uses the latest list if not specified)'),
            'unchecked_only' => $schema->boolean()->description('Only show items that have not been checked off'),
        ];
    }
}
