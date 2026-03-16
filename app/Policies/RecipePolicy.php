<?php

namespace App\Policies;

use App\Models\Recipe;
use App\Models\User;

class RecipePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return (bool) $user->family_id && $user->hasPermissionTo('view-recipes');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Recipe $recipe): bool
    {
        return $user->family_id === $recipe->family_id && $user->hasPermissionTo('view-recipes');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->family_id && $user->hasPermissionTo('create-recipes');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Recipe $recipe): bool
    {
        if ($user->family_id !== $recipe->family_id) {
            return false;
        }

        return $user->hasPermissionTo('edit-recipes');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Recipe $recipe): bool
    {
        if ($user->family_id !== $recipe->family_id) {
            return false;
        }

        return $user->hasPermissionTo('delete-recipes');
    }
}
