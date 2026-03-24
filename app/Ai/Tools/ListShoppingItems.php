<?php

namespace App\Ai\Tools;

use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class ListShoppingItems implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'List shopping lists and their items for the family. Call this when the user asks what is on the shopping list or what needs to be bought.';
    }

    public function handle(Request $request): string
    {
        $lists = ShoppingList::query()
            ->forFamily($this->user->family_id)
            ->with(['items' => function ($q) use ($request) {
                $q->when($request['category'] ?? null, fn ($q) => $q->where('category', $request['category']))
                    ->when(isset($request['checked']) && $request['checked'] !== null, fn ($q) => $q->where('is_checked', (bool) $request['checked']))
                    ->orderBy('is_checked')
                    ->orderBy('name');
            }])
            ->when($request['list_name'] ?? null, fn ($q) => $q->where('name', 'like', '%'.($request['list_name']).'%'))
            ->latest()
            ->limit(5)
            ->get();

        if ($lists->isEmpty()) {
            return 'No shopping lists found.';
        }

        return $lists->map(function (ShoppingList $list) {
            $header = "📋 {$list->name} [ID:{$list->id}]";

            if ($list->items->isEmpty()) {
                return $header."\n  (empty)";
            }

            $items = $list->items->map(function (ShoppingItem $item) {
                $checked = $item->is_checked ? '✓' : '○';
                $qty = $item->quantity ? " ({$item->quantity})" : '';

                return "  {$checked} [ID:{$item->id}] {$item->name}{$qty}";
            })->implode("\n");

            return $header."\n".$items;
        })->implode("\n\n");
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'list_name' => $schema->string()->description('Filter by shopping list name'),
            'category' => $schema->string()->description('Filter items by category: groceries, household, personal, or other'),
            'checked' => $schema->boolean()->description('Filter by checked status: true for checked items, false for unchecked'),
        ];
    }
}
