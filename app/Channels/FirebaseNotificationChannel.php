<?php

namespace App\Channels;

use App\Models\FcmToken;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Exception\MessagingException;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification as FcmNotification;

class FirebaseNotificationChannel
{
    public function __construct(private readonly Messaging $messaging) {}

    /**
     * Send the given notification.
     */
    public function send(mixed $notifiable, Notification $notification): void
    {
        /** @var array{title: string, body: string, data?: array<string, string>} $message */
        $message = $notification->toFcm($notifiable);

        $tokens = FcmToken::query()
            ->where('user_id', $notifiable->getKey())
            ->pluck('token')
            ->all();

        if (empty($tokens)) {
            return;
        }

        $cloudMessage = CloudMessage::new()
            ->withNotification(FcmNotification::create($message['title'], $message['body']));

        if (! empty($message['data'])) {
            $cloudMessage = $cloudMessage->withData($message['data']);
        }

        try {
            $report = $this->messaging->sendMulticast($cloudMessage, $tokens);

            $invalidTokens = $report->invalidTokens();

            if (! empty($invalidTokens)) {
                FcmToken::query()
                    ->where('user_id', $notifiable->getKey())
                    ->whereIn('token', $invalidTokens)
                    ->delete();
            }
        } catch (MessagingException $e) {
            Log::warning('FirebaseNotificationChannel: failed to send notification.', [
                'notifiable' => $notifiable->getKey(),
                'notification' => get_class($notification),
                'error' => $e->getMessage(),
            ]);
        }
    }
}
