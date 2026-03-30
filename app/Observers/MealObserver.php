<?php

declare(strict_types=1);

namespace App\Observers;

use App\Jobs\SyncModelToRtdb;
use App\Models\Meal;

class MealObserver
{
    /**
     * Mirror the meal to Firebase Realtime Database after a create or update.
     */
    public function saved(Meal $meal): void
    {
        if (! config('firebase.projects.app.database.url')) {
            return;
        }

        SyncModelToRtdb::dispatch(
            "families/{$meal->family_id}/meals/{$meal->id}",
            $meal->toSyncArray(),
        );
    }

    /**
     * Remove the meal node from Firebase Realtime Database after deletion.
     */
    public function deleted(Meal $meal): void
    {
        if (! config('firebase.projects.app.database.url')) {
            return;
        }

        SyncModelToRtdb::dispatch(
            "families/{$meal->family_id}/meals/{$meal->id}",
            null,
        );
    }
}
