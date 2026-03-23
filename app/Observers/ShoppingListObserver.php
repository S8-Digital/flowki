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
     * Remove the shopping list node and all its items from Firebase Realtime Database.
     *
     * Because shopping_items.shopping_list_id is cascadeOnDelete, the DB-level
     * cascade removes the rows without firing Eloquent model events — so the
     * ShoppingItemObserver will not run for each child. We therefore eagerly
     * fetch the item IDs before the list is deleted and dispatch individual
     * remove jobs so RTDB stays clean.
     */
    public function deleting(ShoppingList $list): void
    {
        if (! config('firebase.projects.app.database.url')) {
            return;
        }

        // Dispatch a remove job for every child item so RTDB doesn't keep orphans.
        $list->items()->pluck('id')->each(function (int $itemId) use ($list) {
            SyncModelToRtdb::dispatch(
                "families/{$list->family_id}/shopping_items/{$itemId}",
                null,
            );
        });
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
