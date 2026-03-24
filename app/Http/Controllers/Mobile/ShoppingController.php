<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShoppingItemResource;
use App\Http\Resources\ShoppingListResource;
use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ShoppingController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', ShoppingList::class);

        $lists = ShoppingList::query()
            ->where('family_id', $request->user()->family_id)
            ->with(['items', 'creator'])
            ->orderBy('created_at', 'asc')
            ->get();

        return ShoppingListResource::collection($lists);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', ShoppingList::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $list = ShoppingList::create([
            'name' => $validated['name'],
            'family_id' => $request->user()->family_id,
            'created_by' => $request->user()->id,
        ]);

        return (new ShoppingListResource($list->load(['items', 'creator'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(ShoppingList $shoppingList): JsonResponse
    {
        $this->authorize('view', $shoppingList);

        return (new ShoppingListResource($shoppingList->load(['items', 'creator'])))->response();
    }

    public function destroy(ShoppingList $shoppingList): JsonResponse
    {
        $this->authorize('delete', $shoppingList);

        $shoppingList->delete();

        return response()->json(null, 204);
    }

    public function storeItem(Request $request, ShoppingList $shoppingList): JsonResponse
    {
        $this->authorize('update', $shoppingList);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'quantity' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string'],
        ]);

        $item = ShoppingItem::create(array_merge($validated, [
            'shopping_list_id' => $shoppingList->id,
            'added_by' => $request->user()->id,
        ]));

        return (new ShoppingItemResource($item->load('addedBy')))
            ->response()
            ->setStatusCode(201);
    }

    public function updateItem(Request $request, ShoppingList $shoppingList, ShoppingItem $shoppingItem): JsonResponse
    {
        $this->authorize('update', $shoppingList);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'quantity' => ['nullable', 'string', 'max:100'],
            'is_checked' => ['sometimes', 'boolean'],
        ]);

        $shoppingItem->update($validated);

        return (new ShoppingItemResource($shoppingItem->fresh('addedBy')))->response();
    }

    public function toggleItem(ShoppingList $shoppingList, ShoppingItem $shoppingItem): JsonResponse
    {
        $this->authorize('update', $shoppingList);

        $shoppingItem->update(['is_checked' => ! $shoppingItem->is_checked]);

        return (new ShoppingItemResource($shoppingItem->fresh('addedBy')))->response();
    }

    public function destroyItem(ShoppingList $shoppingList, ShoppingItem $shoppingItem): JsonResponse
    {
        $this->authorize('update', $shoppingList);

        $shoppingItem->delete();

        return response()->json(null, 204);
    }
}
