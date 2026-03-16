<?php

namespace App\Notifications;

use App\Channels\FirebaseNotificationChannel;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TodoCompleted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Todo $todo,
        private readonly User $completedBy,
    ) {}

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
            ->subject('Task completed: '.$this->todo->title)
            ->greeting('Hi '.$notifiable->name.'!')
            ->line('**'.$this->completedBy->name.'** has completed the task: **'.$this->todo->title.'**')
            ->action('View Todos', url('/todos'))
            ->line('Great work keeping the family on track!');
    }

    /**
     * @return array{title: string, body: string, data: array<string, string>}
     */
    public function toFcm(mixed $notifiable): array
    {
        return [
            'title' => 'Task completed',
            'body' => "{$this->completedBy->name} completed: {$this->todo->title}",
            'data' => [
                'type' => 'todo_completed',
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
            'type' => 'todo_completed',
            'todo_id' => $this->todo->id,
            'todo_title' => $this->todo->title,
            'completed_by_id' => $this->completedBy->id,
            'completed_by_name' => $this->completedBy->name,
        ];
    }
}
