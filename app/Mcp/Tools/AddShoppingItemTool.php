<?php

namespace App\Mcp\Tools;

use App\Enums\ShoppingItemCategory;
use App\Models\ShoppingList;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Auth;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Add an item to a family shopping list. If no list is specified, adds to the most recently created list.')]
class AddShoppingItemTool extends Tool
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

        $input = $request->all();

        if (empty($input['name'])) {
            return Response::text('Error: item name is required.');
        }

        $list = ShoppingList::query()
            ->forFamily($user->family_id)
            ->when(! empty($input['list_name']), fn ($q) => $q->where('name', 'like', '%'.$input['list_name'].'%'))
            ->latest()
            ->first();

        if (! $list) {
            $list = ShoppingList::create([
                'family_id' => $user->family_id,
                'created_by' => $user->id,
                'name' => $input['list_name'] ?? 'Shopping List',
                'is_shared' => true,
            ]);
        }

        $item = $list->items()->create([
            'added_by' => $user->id,
            'name' => $input['name'],
            'quantity' => $input['quantity'] ?? null,
            'category' => $input['category'] ?? ShoppingItemCategory::Groceries->value,
            'is_checked' => false,
        ]);

        return Response::text("Added \"{$item->name}\" to the \"{$list->name}\" shopping list.");
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'name' => $schema->string()->description('The name of the item to add')->required(),
            'quantity' => $schema->string()->description('Optional quantity, e.g. "2 litres" or "x3"'),
            'category' => $schema->string()->description('Category: groceries, household, personal_care, or other'),
            'list_name' => $schema->string()->description('Name of the shopping list to add to (uses the latest list if not specified)'),
        ];
    }
}
