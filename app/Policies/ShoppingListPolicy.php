<?php

namespace App\Policies;

use App\Models\ShoppingList;
use App\Models\User;

class ShoppingListPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return (bool) $user->family_id;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ShoppingList $shoppingList): bool
    {
        return $user->family_id === $shoppingList->family_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->family_id && $user->hasPermissionTo('manage-shopping');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ShoppingList $shoppingList): bool
    {
        if ($user->family_id !== $shoppingList->family_id) {
            return false;
        }

        return $user->hasPermissionTo('manage-shopping');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ShoppingList $shoppingList): bool
    {
        if ($user->family_id !== $shoppingList->family_id) {
            return false;
        }

        return $user->hasPermissionTo('manage-shopping');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ShoppingList $shoppingList): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ShoppingList $shoppingList): bool
    {
        return false;
    }

    /**
     * Determine whether the user can add an item to the model.
     */
    public function addItem(User $user, ShoppingList $shoppingList): bool
    {
        return $user->family_id === $shoppingList->family_id;
    }
}
