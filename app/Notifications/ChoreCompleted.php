<?php

namespace App\Notifications;

use App\Channels\FirebaseNotificationChannel;
use App\Models\Chore;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ChoreCompleted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Chore $chore,
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
            ->subject('Chore completed: '.$this->chore->title)
            ->greeting('Hi '.$notifiable->name.'!')
            ->line('**'.$this->completedBy->name.'** has completed the chore: **'.$this->chore->title.'**')
            ->action('View Chores', url('/chores'))
            ->line('Great work keeping the home running smoothly!');
    }

    /**
     * @return array{title: string, body: string, data: array<string, string>}
     */
    public function toFcm(mixed $notifiable): array
    {
        return [
            'title' => 'Chore completed',
            'body' => "{$this->completedBy->name} completed: {$this->chore->title}",
            'data' => [
                'type' => 'chore_completed',
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
            'type' => 'chore_completed',
            'chore_id' => $this->chore->id,
            'chore_title' => $this->chore->title,
            'completed_by_id' => $this->completedBy->id,
            'completed_by_name' => $this->completedBy->name,
        ];
    }
}
