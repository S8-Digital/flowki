<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\RecipeResource;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RecipeController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Recipe::class);

        $recipes = Recipe::query()
            ->forFamily($request->user()->family_id)
            ->with(['ingredients', 'creator:id,name'])
            ->orderBy('title')
            ->get();

        return RecipeResource::collection($recipes);
    }
}
