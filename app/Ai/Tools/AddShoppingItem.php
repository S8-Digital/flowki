<?php

namespace App\Ai\Tools;

use App\Enums\ShoppingItemCategory;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;

class AddShoppingItem implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): string
    {
        return 'Add an item to the family shopping list. Call this when the user asks to add groceries or shopping items.';
    }

    public function handle(Request $request): string
    {
        $list = ShoppingList::query()
            ->forFamily($this->user->family_id)
            ->when(
                $request['list_name'] ?? null,
                fn ($q) => $q->where('name', 'like', '%'.($request['list_name']).'%')
            )
            ->latest()
            ->first();

        if (! $list) {
            $list = ShoppingList::create([
                'family_id' => $this->user->family_id,
                'created_by' => $this->user->id,
                'name' => $request['list_name'] ?? 'Shopping List',
                'is_shared' => true,
            ]);
        }

        $item = $list->items()->create([
            'added_by' => $this->user->id,
            'name' => $request['name'],
            'quantity' => $request['quantity'] ?? null,
            'category' => $request['category'] ?? ShoppingItemCategory::Groceries->value,
            'is_checked' => false,
        ]);

        return "✓ Added \"{$item->name}\" to \"{$list->name}\"";
    }

    /** @return array<string, JsonSchema> */
    public function schema(JsonSchema $schema): array
    {
        return [
            'name' => $schema->string()->description('Item name')->required(),
            'quantity' => $schema->string()->description('Quantity, e.g. "2 litres"'),
            'category' => $schema->string()->description('groceries, household, personal, or other'),
            'list_name' => $schema->string()->description('Shopping list name (uses latest if not specified)'),
        ];
    }
}
