<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\GoogleCalendarService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SyncItemToGoogleCalendar implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array{summary: string, description?: string, start: string, end: string}  $eventData
     */
    public function __construct(
        public readonly User $user,
        public readonly array $eventData,
        public readonly ?string $googleEventId = null,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(GoogleCalendarService $googleCalendar): void
    {
        if (! $this->user->hasGoogleCalendarConnected()) {
            return;
        }

        $googleCalendar->createOrUpdateEvent($this->user, $this->googleEventId, $this->eventData);
    }
}
