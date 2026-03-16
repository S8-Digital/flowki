<?php

namespace App\Notifications;

use App\Channels\FirebaseNotificationChannel;
use App\Models\Todo;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class TodoAssigned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Todo $todo) {}

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
            'title' => 'New task assigned',
            'body' => "You have been assigned: {$this->todo->title}",
            'data' => [
                'type' => 'todo_assigned',
                'todo_id' => (string) $this->todo->id,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(mixed $notifiable): array
    {
        return [
            'type' => 'todo_assigned',
            'todo_id' => $this->todo->id,
            'todo_title' => $this->todo->title,
        ];
    }
}
