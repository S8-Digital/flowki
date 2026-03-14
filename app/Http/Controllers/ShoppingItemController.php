<?php

namespace App\Http\Controllers;

use App\Http\Requests\ShoppingItem\StoreShoppingItemRequest;
use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ShoppingItemController extends Controller
{
    public function store(StoreShoppingItemRequest $request, ShoppingList $shoppingList): RedirectResponse
    {
        $this->authorize('update', $shoppingList);

        $shoppingList->items()->create(array_merge($request->validated(), [
            'added_by' => $request->user()->id,
        ]));

        return back();
    }

    public function update(Request $request, ShoppingList $shoppingList, ShoppingItem $shoppingItem): RedirectResponse
    {
        $this->authorize('update', $shoppingList);

        $shoppingItem->update($request->only(['name', 'quantity', 'category', 'is_checked']));

        return back();
    }

    public function toggle(Request $request, ShoppingList $shoppingList, ShoppingItem $shoppingItem): RedirectResponse
    {
        $this->authorize('update', $shoppingList);

        $shoppingItem->update(['is_checked' => ! $shoppingItem->is_checked]);

        return back();
    }

    public function destroy(Request $request, ShoppingList $shoppingList, ShoppingItem $shoppingItem): RedirectResponse
    {
        $this->authorize('update', $shoppingList);

        $shoppingItem->delete();

        return back();
    }
}
