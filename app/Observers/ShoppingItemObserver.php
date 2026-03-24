<?php

declare(strict_types=1);

namespace App\Observers;

use App\Jobs\SyncModelToRtdb;
use App\Models\ShoppingItem;

class ShoppingItemObserver
{
    /**
     * Mirror the shopping item to Firebase Realtime Database after a create or update.
     *
     * Items are nested under their parent list's family so clients can subscribe
     * per-family: `families/{family_id}/shopping_items/{item_id}`.
     */
    public function saved(ShoppingItem $item): void
    {
        if (! config('firebase.projects.app.database.url')) {
            return;
        }

        // ShoppingItem has no direct family_id column; resolve it via the
        // parent list. Using ->value() issues a single-column SELECT which is
        // more efficient than loading the full relationship.
        $familyId = $item->shoppingList()->value('family_id');

        if (! $familyId) {
            return;
        }

        SyncModelToRtdb::dispatch(
            "families/{$familyId}/shopping_items/{$item->id}",
            $item->toSyncArray(),
        );
    }

    /**
     * Remove the shopping item node from Firebase Realtime Database after deletion.
     */
    public function deleted(ShoppingItem $item): void
    {
        if (! config('firebase.projects.app.database.url')) {
            return;
        }

        // Same single-column lookup as in saved() — avoids loading the full
        // shoppingList relationship just to get the family_id.
        $familyId = $item->shoppingList()->value('family_id');

        if (! $familyId) {
            return;
        }

        SyncModelToRtdb::dispatch(
            "families/{$familyId}/shopping_items/{$item->id}",
            null,
        );
    }
}
