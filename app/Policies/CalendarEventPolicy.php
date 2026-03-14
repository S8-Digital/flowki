<?php

namespace App\Policies;

use App\Models\CalendarEvent;
use App\Models\User;

class CalendarEventPolicy
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
    public function view(User $user, CalendarEvent $calendarEvent): bool
    {
        return $user->family_id === $calendarEvent->family_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->family_id && $user->hasPermissionTo('manage-events');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, CalendarEvent $calendarEvent): bool
    {
        if ($user->family_id !== $calendarEvent->family_id) {
            return false;
        }

        return $user->hasPermissionTo('manage-events');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CalendarEvent $calendarEvent): bool
    {
        if ($user->family_id !== $calendarEvent->family_id) {
            return false;
        }

        return $user->hasPermissionTo('manage-events');
    }
}
