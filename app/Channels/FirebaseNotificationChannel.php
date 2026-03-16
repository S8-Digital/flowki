<?php

namespace App\Channels;

use App\Models\User;
use App\Services\FcmService;
use Illuminate\Notifications\Notification;

class FirebaseNotificationChannel
{
    public function __construct(private readonly FcmService $fcmService) {}

    /**
     * Send the given notification.
     */
    public function send(mixed $notifiable, Notification $notification): void
    {
        if (! $notifiable instanceof User) {
            return;
        }

        /** @var array{title: string, body: string, data?: array<string, string>} $message */
        $message = $notification->toFcm($notifiable);

        $this->fcmService->sendToUser(
            $notifiable,
            ['title' => $message['title'], 'body' => $message['body']],
            $message['data'] ?? [],
        );
    }
}
