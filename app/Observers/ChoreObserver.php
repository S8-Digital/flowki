<?php

declare(strict_types=1);

namespace App\Observers;

use App\Jobs\SyncModelToRtdb;
use App\Models\Chore;

class ChoreObserver
{
    /**
     * Mirror the chore to Firebase Realtime Database after a create or update.
     */
    public function saved(Chore $chore): void
    {
        if (! config('firebase.projects.app.database.url')) {
            return;
        }

        SyncModelToRtdb::dispatch(
            "families/{$chore->family_id}/chores/{$chore->id}",
            $chore->toSyncArray(),
        );
    }

    /**
     * Remove the chore node from Firebase Realtime Database after deletion.
     */
    public function deleted(Chore $chore): void
    {
        if (! config('firebase.projects.app.database.url')) {
            return;
        }

        SyncModelToRtdb::dispatch(
            "families/{$chore->family_id}/chores/{$chore->id}",
            null,
        );
    }
}
