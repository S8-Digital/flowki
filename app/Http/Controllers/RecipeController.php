<?php

namespace App\Http\Controllers;

use App\Http\Requests\Recipe\StoreRecipeRequest;
use App\Http\Requests\Recipe\UpdateRecipeRequest;
use App\Http\Resources\RecipeResource;
use App\Models\Recipe;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecipeController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Recipe::class);

        $family = $request->user()->family;

        $recipes = Inertia::defer(fn () => RecipeResource::collection(
            Recipe::query()
                ->forFamily($family->id)
                ->with(['creator:id,name'])
                ->when($request->search, fn ($q) => $q->search($request->search))
                ->when($request->category, fn ($q) => $q->where('category', $request->category))
                ->when($request->is_favorite, fn ($q) => $q->where('is_favorite', true))
                ->orderBy($request->sort_by ?? 'title', $request->sort_dir ?? 'asc')
                ->paginate(20)
                ->withQueryString()
        ));

        return Inertia::render('Recipes/Index', [
            'recipes' => $recipes,
            'filters' => $request->only(['search', 'category', 'is_favorite', 'sort_by', 'sort_dir']),
        ]);
    }

    public function show(Request $request, Recipe $recipe): Response
    {
        $this->authorize('view', $recipe);

        return Inertia::render('Recipes/Show', [
            'recipe' => new RecipeResource($recipe->load(['ingredients', 'creator:id,name'])),
        ]);
    }

    public function store(StoreRecipeRequest $request): RedirectResponse
    {
        $this->authorize('create', Recipe::class);

        $photoPath = $request->hasFile('photo')
            ? $request->file('photo')->store('recipes', 'public')
            : null;

        $recipe = Recipe::create(array_merge(
            $request->safe()->except(['photo', 'ingredients']),
            [
                'family_id' => $request->user()->family_id,
                'created_by' => $request->user()->id,
                'photo_path' => $photoPath,
            ]
        ));

        if ($request->filled('ingredients')) {
            foreach ($request->ingredients as $index => $ingredient) {
                $recipe->ingredients()->create(array_merge($ingredient, ['sort_order' => $index]));
            }
        }

        return back();
    }

    public function update(UpdateRecipeRequest $request, Recipe $recipe): RedirectResponse
    {
        $this->authorize('update', $recipe);

        $photoPath = $recipe->photo_path;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('recipes', 'public');
        }

        $recipe->update(array_merge(
            $request->safe()->except(['photo', 'ingredients']),
            ['photo_path' => $photoPath]
        ));

        if ($request->has('ingredients')) {
            $recipe->ingredients()->delete();
            foreach ($request->ingredients ?? [] as $index => $ingredient) {
                $recipe->ingredients()->create(array_merge($ingredient, ['sort_order' => $index]));
            }
        }

        return back();
    }

    public function destroy(Request $request, Recipe $recipe): RedirectResponse
    {
        $this->authorize('delete', $recipe);

        $recipe->delete();

        return back();
    }
}
