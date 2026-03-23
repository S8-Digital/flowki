<?php

declare(strict_types=1);

namespace App\Observers;

use App\Jobs\SyncModelToRtdb;
use App\Models\ShoppingList;

class ShoppingListObserver
{
    /**
     * Mirror the shopping list to Firebase Realtime Database after a create or update.
     */
    public function saved(ShoppingList $list): void
    {
        if (! config('firebase.projects.app.database.url')) {
            return;
        }

        SyncModelToRtdb::dispatch(
            "families/{$list->family_id}/shopping_lists/{$list->id}",
            $list->toSyncArray(),
        );
    }

    /**
     * Remove the shopping list node from Firebase Realtime Database after deletion.
     */
    public function deleted(ShoppingList $list): void
    {
        if (! config('firebase.projects.app.database.url')) {
            return;
        }

        SyncModelToRtdb::dispatch(
            "families/{$list->family_id}/shopping_lists/{$list->id}",
            null,
        );
    }
}
