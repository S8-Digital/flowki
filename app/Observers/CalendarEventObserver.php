<?php

declare(strict_types=1);

namespace App\Observers;

use App\Jobs\SyncModelToRtdb;
use App\Models\CalendarEvent;

class CalendarEventObserver
{
    /**
     * Mirror the calendar event to Firebase Realtime Database after a create or update.
     */
    public function saved(CalendarEvent $event): void
    {
        if (! config('firebase.projects.app.database.url')) {
            return;
        }

        SyncModelToRtdb::dispatch(
            "families/{$event->family_id}/events/{$event->id}",
            $event->toSyncArray(),
        );
    }

    /**
     * Remove the calendar event node from Firebase Realtime Database after deletion.
     */
    public function deleted(CalendarEvent $event): void
    {
        if (! config('firebase.projects.app.database.url')) {
            return;
        }

        SyncModelToRtdb::dispatch(
            "families/{$event->family_id}/events/{$event->id}",
            null,
        );
    }
}
