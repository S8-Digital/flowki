<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoriesController extends Controller
{
    public function edit(Request $request): Response
    {
        $family = $request->user()->family()->firstOrFail();

        $this->authorize('update', $family);

        return Inertia::render('settings/Categories', [
            'todoCategories' => $family->getTodoCategories(),
            'recipeCategories' => $family->getRecipeCategories(),
            'shoppingCategories' => $family->getShoppingCategories(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'todo_categories' => ['nullable', 'array'],
            'todo_categories.*.value' => ['required', 'string', 'max:50'],
            'todo_categories.*.label' => ['required', 'string', 'max:100'],
            'recipe_categories' => ['nullable', 'array'],
            'recipe_categories.*.value' => ['required', 'string', 'max:50'],
            'recipe_categories.*.label' => ['required', 'string', 'max:100'],
            'shopping_categories' => ['nullable', 'array'],
            'shopping_categories.*.value' => ['required', 'string', 'max:50'],
            'shopping_categories.*.label' => ['required', 'string', 'max:100'],
        ]);

        $family = $request->user()->family()->firstOrFail();
        $this->authorize('update', $family);

        $settings = $family->settings ?? [];
        if (isset($validated['todo_categories'])) {
            $settings['todo_categories'] = $validated['todo_categories'];
        }
        if (isset($validated['recipe_categories'])) {
            $settings['recipe_categories'] = $validated['recipe_categories'];
        }
        if (isset($validated['shopping_categories'])) {
            $settings['shopping_categories'] = $validated['shopping_categories'];
        }

        $family->update(['settings' => $settings]);

        return back()->with('status', 'categories-updated');
    }
}
