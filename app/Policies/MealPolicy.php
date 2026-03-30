<?php

namespace App\Policies;

use App\Models\Meal;
use App\Models\User;

class MealPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return (bool) $user->family_id && $user->hasPermissionTo('view-meals');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Meal $meal): bool
    {
        return $user->family_id === $meal->family_id && $user->hasPermissionTo('view-meals');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return (bool) $user->family_id && $user->hasPermissionTo('create-meals');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Meal $meal): bool
    {
        if ($user->family_id !== $meal->family_id) {
            return false;
        }

        return $user->hasPermissionTo('edit-meals');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Meal $meal): bool
    {
        if ($user->family_id !== $meal->family_id) {
            return false;
        }

        return $user->hasPermissionTo('delete-meals');
    }
}
