<?php

namespace App\Notifications;

use App\Channels\FirebaseNotificationChannel;
use App\Models\Todo;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
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
        $channels = ['database'];

        if ($notifiable->wantsEmailNotifications() && $notifiable->email) {
            $channels[] = 'mail';
        }

        if ($notifiable->wantsPushNotifications()) {
            $channels[] = FirebaseNotificationChannel::class;
        }

        return $channels;
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New task assigned: '.$this->todo->title)
            ->greeting('Hi '.$notifiable->name.'!')
            ->line('You have been assigned a new task: **'.$this->todo->title.'**')
            ->when($this->todo->due_date, fn ($mail) => $mail->line('Due: '.$this->todo->due_date->format('D, M j Y g:i A')))
            ->action('View Todos', url('/todos'))
            ->line('Thanks for keeping the family organised!');
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
