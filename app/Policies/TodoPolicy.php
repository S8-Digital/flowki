<?php

namespace App\Policies;

use App\Models\Todo;
use App\Models\User;

class TodoPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return (bool) $user->family_id && $user->hasPermissionTo('view-todos');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Todo $todo): bool
    {
        return $user->family_id === $todo->family_id && $user->hasPermissionTo('view-todos');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->family_id && $user->hasPermissionTo('create-todos');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Todo $todo): bool
    {
        if ($user->family_id !== $todo->family_id) {
            return false;
        }

        return $user->hasPermissionTo('edit-todos');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Todo $todo): bool
    {
        if ($user->family_id !== $todo->family_id) {
            return false;
        }

        return $user->hasPermissionTo('delete-todos');
    }
}
