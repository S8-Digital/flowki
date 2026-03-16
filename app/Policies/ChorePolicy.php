<?php

namespace App\Policies;

use App\Models\Chore;
use App\Models\User;

class ChorePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return (bool) $user->family_id && $user->hasPermissionTo('view-chores');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Chore $chore): bool
    {
        return $user->family_id === $chore->family_id && $user->hasPermissionTo('view-chores');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->family_id && $user->hasPermissionTo('create-chores');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Chore $chore): bool
    {
        if ($user->family_id !== $chore->family_id) {
            return false;
        }

        return $user->hasPermissionTo('edit-chores');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Chore $chore): bool
    {
        if ($user->family_id !== $chore->family_id) {
            return false;
        }

        return $user->hasPermissionTo('delete-chores');
    }

    /**
     * Determine whether the user can complete the model.
     */
    public function complete(User $user, Chore $chore): bool
    {
        return $user->family_id === $chore->family_id && $user->hasPermissionTo('complete-chores');
    }
}
