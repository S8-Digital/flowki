<?php

namespace App\Http\Controllers;

use App\Http\Resources\CalendarEventResource;
use App\Http\Resources\ChoreResource;
use App\Http\Resources\RecipeResource;
use App\Http\Resources\ShoppingItemResource;
use App\Http\Resources\TodoResource;
use App\Models\CalendarEvent;
use App\Models\Chore;
use App\Models\Recipe;
use App\Models\ShoppingItem;
use App\Models\Todo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate(['q' => ['required', 'string', 'min:2', 'max:100']]);

        $familyId = $request->user()->family_id;
        $term = $request->q;

        return response()->json([
            'todos' => TodoResource::collection(
                Todo::query()->forFamily($familyId)->search($term)->with(['assignee:id,name'])->limit(5)->get()
            ),
            'chores' => ChoreResource::collection(
                Chore::query()->forFamily($familyId)->search($term)->with(['assignees:id,name'])->limit(5)->get()
            ),
            'events' => CalendarEventResource::collection(
                CalendarEvent::query()->forFamily($familyId)->search($term)->with(['attendees:id,name'])->limit(5)->get()
            ),
            'recipes' => RecipeResource::collection(
                Recipe::query()->forFamily($familyId)->search($term)->limit(5)->get()
            ),
            'shopping_items' => ShoppingItemResource::collection(
                ShoppingItem::query()
                    ->whereHas('shoppingList', fn ($q) => $q->where('family_id', $familyId))
                    ->where('name', 'like', "%{$term}%")
                    ->limit(5)
                    ->get()
            ),
        ]);
    }
}
