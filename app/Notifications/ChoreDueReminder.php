<?php

namespace App\Notifications;

use App\Channels\FirebaseNotificationChannel;
use App\Models\Chore;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ChoreDueReminder extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly Chore $chore) {}

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
            ->subject('Reminder: '.$this->chore->title.' is due soon')
            ->greeting('Hi '.$notifiable->name.'!')
            ->line('Just a reminder that the chore **'.$this->chore->title.'** is due soon.')
            ->when($this->chore->next_due_date, fn ($mail) => $mail->line('Due: '.$this->chore->next_due_date->format('D, M j Y g:i A')))
            ->action('View Chores', url('/chores'));
    }

    /**
     * @return array{title: string, body: string, data: array<string, string>}
     */
    public function toFcm(mixed $notifiable): array
    {
        return [
            'title' => 'Chore due soon',
            'body' => "Don't forget: {$this->chore->title}",
            'data' => [
                'type' => 'chore_reminder',
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
            'type' => 'chore_reminder',
            'chore_id' => $this->chore->id,
            'chore_title' => $this->chore->title,
        ];
    }
}
