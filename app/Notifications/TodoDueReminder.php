<?php

namespace App\Notifications;

use App\Channels\FirebaseNotificationChannel;
use App\Models\Todo;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TodoDueReminder extends Notification implements ShouldQueue
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
            ->subject('Reminder: '.$this->todo->title.' is due soon')
            ->greeting('Hi '.$notifiable->name.'!')
            ->line('Just a reminder that your task **'.$this->todo->title.'** is due soon.')
            ->when($this->todo->due_date, fn ($mail) => $mail->line('Due: '.$this->todo->due_date->format('D, M j Y g:i A')))
            ->action('View Todos', url('/todos'));
    }

    /**
     * @return array{title: string, body: string, data: array<string, string>}
     */
    public function toFcm(mixed $notifiable): array
    {
        return [
            'title' => 'Task due soon',
            'body' => "Don't forget: {$this->todo->title}",
            'data' => [
                'type' => 'todo_reminder',
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
            'type' => 'todo_reminder',
            'todo_id' => $this->todo->id,
            'todo_title' => $this->todo->title,
        ];
    }
}
