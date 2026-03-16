<?php

namespace App\Services;

use App\Models\FcmToken;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Exception\MessagingException;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class FcmService
{
    public function __construct(private readonly Messaging $messaging) {}

    /**
     * Send a notification to a single FCM token.
     *
     * @param  array{title: string, body: string, image?: string}  $notification
     * @param  array<string, string>  $data
     */
    public function sendToToken(string $token, array $notification, array $data = []): bool
    {
        $message = $this->buildMessage($notification, $data)->toToken($token);

        try {
            $this->messaging->send($message);

            return true;
        } catch (MessagingException $e) {
            Log::warning('FCM: failed to send to token.', [
                'token' => $token,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Send a notification to all FCM tokens registered for a user.
     * Stale tokens that FCM reports as invalid are automatically pruned.
     *
     * @param  array{title: string, body: string, image?: string}  $notification
     * @param  array<string, string>  $data
     */
    public function sendToUser(User $user, array $notification, array $data = []): void
    {
        $tokens = $user->fcmTokens()->pluck('token')->all();

        if (empty($tokens)) {
            return;
        }

        $this->sendToTokensAndPruneInvalid($user, $tokens, $notification, $data);
    }

    /**
     * Send a notification to all FCM tokens registered for a collection of users.
     *
     * @param  iterable<User>  $users
     * @param  array{title: string, body: string, image?: string}  $notification
     * @param  array<string, string>  $data
     */
    public function sendToUsers(iterable $users, array $notification, array $data = []): void
    {
        foreach ($users as $user) {
            $this->sendToUser($user, $notification, $data);
        }
    }

    /**
     * Send to a list of tokens for a user and prune any that FCM marks invalid.
     *
     * @param  list<string>  $tokens
     * @param  array{title: string, body: string, image?: string}  $notification
     * @param  array<string, string>  $data
     */
    private function sendToTokensAndPruneInvalid(User $user, array $tokens, array $notification, array $data): void
    {
        $message = $this->buildMessage($notification, $data);

        try {
            $report = $this->messaging->sendMulticast($message, $tokens);

            $invalidTokens = $report->invalidTokens();

            if (! empty($invalidTokens)) {
                FcmToken::query()
                    ->where('user_id', $user->id)
                    ->whereIn('token', $invalidTokens)
                    ->delete();
            }
        } catch (MessagingException $e) {
            Log::warning('FCM: multicast send failed.', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Build a base CloudMessage with a notification and optional data payload.
     *
     * @param  array{title: string, body: string, image?: string}  $notification
     * @param  array<string, string>  $data
     */
    private function buildMessage(array $notification, array $data): CloudMessage
    {
        $message = CloudMessage::new()
            ->withNotification(
                Notification::create(
                    $notification['title'],
                    $notification['body'],
                    $notification['image'] ?? null,
                ),
            );

        if (! empty($data)) {
            $message = $message->withData($data);
        }

        return $message;
    }
}
