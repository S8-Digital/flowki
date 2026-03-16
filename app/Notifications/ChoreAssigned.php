<?php

namespace App\Notifications;

use App\Channels\FirebaseNotificationChannel;
use App\Models\Chore;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ChoreAssigned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Chore $chore) {}

    /**
     * @return list<string>
     */
    public function via(mixed $notifiable): array
    {
        return ['database', FirebaseNotificationChannel::class];
    }

    /**
     * @return array{title: string, body: string, data: array<string, string>}
     */
    public function toFcm(mixed $notifiable): array
    {
        return [
            'title' => 'New chore assigned',
            'body' => "You have been assigned: {$this->chore->title}",
            'data' => [
                'type' => 'chore_assigned',
                'chore_id' => (string) $this->chore->id,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(mixed $notifiable): array
    {
        return [
            'type' => 'chore_assigned',
            'chore_id' => $this->chore->id,
            'chore_title' => $this->chore->title,
        ];
    }
}
