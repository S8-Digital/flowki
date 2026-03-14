<?php

namespace App\Http\Controllers;

use App\Http\Requests\ShoppingList\StoreShoppingListRequest;
use App\Http\Resources\ShoppingListResource;
use App\Models\ShoppingList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShoppingListController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ShoppingList::class);

        $family = $request->user()->family;

        $lists = Inertia::defer(fn () => ShoppingListResource::collection(
            ShoppingList::query()
                ->forFamily($family->id)
                ->with(['creator:id,name'])
                ->withCount('items')
                ->orderBy('created_at', 'desc')
                ->get()
        ));

        return Inertia::render('Shopping/Index', [
            'lists' => $lists,
        ]);
    }

    public function show(Request $request, ShoppingList $shoppingList): Response
    {
        $this->authorize('view', $shoppingList);

        return Inertia::render('Shopping/Show', [
            'list' => new ShoppingListResource($shoppingList->load(['items.addedBy', 'creator:id,name'])),
        ]);
    }

    public function store(StoreShoppingListRequest $request): RedirectResponse
    {
        $this->authorize('create', ShoppingList::class);

        ShoppingList::create(array_merge($request->validated(), [
            'family_id' => $request->user()->family_id,
            'created_by' => $request->user()->id,
        ]));

        return back();
    }

    public function destroy(Request $request, ShoppingList $shoppingList): RedirectResponse
    {
        $this->authorize('delete', $shoppingList);

        $shoppingList->delete();

        return back();
    }
}
