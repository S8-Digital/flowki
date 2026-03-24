<?php

declare(strict_types=1);

namespace App\Observers;

use App\Jobs\SyncModelToRtdb;
use App\Models\Todo;

class TodoObserver
{
    /**
     * Mirror the todo to Firebase Realtime Database after a create or update.
     */
    public function saved(Todo $todo): void
    {
        if (! config('firebase.projects.app.database.url')) {
            return;
        }

        SyncModelToRtdb::dispatch(
            "families/{$todo->family_id}/todos/{$todo->id}",
            $todo->toSyncArray(),
        );
    }

    /**
     * Remove the todo node from Firebase Realtime Database after deletion.
     */
    public function deleted(Todo $todo): void
    {
        if (! config('firebase.projects.app.database.url')) {
            return;
        }

        SyncModelToRtdb::dispatch(
            "families/{$todo->family_id}/todos/{$todo->id}",
            null,
        );
    }
}
