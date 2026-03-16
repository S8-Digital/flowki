<?php

namespace Tests\Unit;

use App\Channels\FirebaseNotificationChannel;
use App\Models\Chore;
use App\Models\FcmToken;
use App\Models\Todo;
use App\Models\User;
use App\Notifications\ChoreAssigned;
use App\Notifications\TodoAssigned;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Exception\Messaging\ApiConnectionFailed;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\MessageTarget;
use Kreait\Firebase\Messaging\MulticastSendReport;
use Kreait\Firebase\Messaging\SendReport;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class FirebaseNotificationChannelTest extends TestCase
{
    use RefreshDatabase;

    private FirebaseNotificationChannel $channel;

    private MockInterface $messaging;

    protected function setUp(): void
    {
        parent::setUp();

        $this->messaging = Mockery::mock(Messaging::class);
        $this->channel = new FirebaseNotificationChannel($this->messaging);
    }

    public function test_send_dispatches_multicast_to_all_user_tokens(): void
    {
        $user = User::factory()->create();
        FcmToken::factory()->create(['user_id' => $user->id, 'token' => 'token-a']);
        FcmToken::factory()->create(['user_id' => $user->id, 'token' => 'token-b']);

        $report = $this->makeMulticastReport([], 'token-a', 'token-b');

        $this->messaging
            ->shouldReceive('sendMulticast')
            ->once()
            ->with(Mockery::type(CloudMessage::class), Mockery::type('array'))
            ->andReturn($report);

        $notification = $this->makeFcmNotification(['title' => 'Hello', 'body' => 'World']);

        $this->channel->send($user, $notification);
    }

    public function test_send_skips_sdk_when_user_has_no_tokens(): void
    {
        $user = User::factory()->create();

        $this->messaging->shouldNotReceive('sendMulticast');

        $notification = $this->makeFcmNotification(['title' => 'Hello', 'body' => 'World']);

        $this->channel->send($user, $notification);
    }

    public function test_send_prunes_invalid_tokens_reported_by_fcm(): void
    {
        $user = User::factory()->create();
        FcmToken::factory()->create(['user_id' => $user->id, 'token' => 'valid-token']);
        $stale = FcmToken::factory()->create(['user_id' => $user->id, 'token' => 'stale-token']);

        $report = $this->makeMulticastReport(['stale-token'], 'valid-token');

        $this->messaging
            ->shouldReceive('sendMulticast')
            ->once()
            ->andReturn($report);

        $notification = $this->makeFcmNotification(['title' => 'Hello', 'body' => 'World']);

        $this->channel->send($user, $notification);

        $this->assertDatabaseMissing('fcm_tokens', ['id' => $stale->id]);
        $this->assertDatabaseCount('fcm_tokens', 1);
    }

    public function test_send_with_data_payload_includes_data_in_message(): void
    {
        $user = User::factory()->create();
        FcmToken::factory()->create(['user_id' => $user->id, 'token' => 'token-x']);

        $report = $this->makeMulticastReport([], 'token-x');

        $this->messaging
            ->shouldReceive('sendMulticast')
            ->once()
            ->with(
                Mockery::on(fn (CloudMessage $msg) => true),
                Mockery::type('array'),
            )
            ->andReturn($report);

        $notification = $this->makeFcmNotification([
            'title' => 'Task assigned',
            'body' => 'A task was assigned to you',
            'data' => ['type' => 'todo_assigned', 'todo_id' => '42'],
        ]);

        $this->channel->send($user, $notification);
    }

    public function test_send_logs_warning_and_does_not_throw_on_exception(): void
    {
        $user = User::factory()->create();
        FcmToken::factory()->create(['user_id' => $user->id, 'token' => 'token-y']);

        $this->messaging
            ->shouldReceive('sendMulticast')
            ->once()
            ->andThrow(new ApiConnectionFailed('Connection refused'));

        Log::shouldReceive('warning')
            ->once()
            ->withArgs(fn (string $msg) => str_contains($msg, 'FirebaseNotificationChannel'));

        $notification = $this->makeFcmNotification(['title' => 'Hi', 'body' => 'There']);

        // Should not throw
        $this->channel->send($user, $notification);
    }

    public function test_todo_assigned_notification_uses_firebase_channel(): void
    {
        $todo = Todo::factory()->create(['title' => 'Clean room']);
        $notification = new TodoAssigned($todo);
        $user = User::factory()->create();

        $channels = $notification->via($user);

        $this->assertContains(FirebaseNotificationChannel::class, $channels);
    }

    public function test_chore_assigned_notification_uses_firebase_channel(): void
    {
        $chore = Chore::factory()->create(['title' => 'Wash dishes']);
        $notification = new ChoreAssigned($chore);
        $user = User::factory()->create();

        $channels = $notification->via($user);

        $this->assertContains(FirebaseNotificationChannel::class, $channels);
    }

    public function test_todo_assigned_to_fcm_returns_correct_payload(): void
    {
        $todo = Todo::factory()->create(['title' => 'Buy groceries']);
        $notification = new TodoAssigned($todo);
        $user = User::factory()->create();

        $payload = $notification->toFcm($user);

        $this->assertEquals('New task assigned', $payload['title']);
        $this->assertStringContainsString('Buy groceries', $payload['body']);
        $this->assertEquals('todo_assigned', $payload['data']['type']);
        $this->assertEquals((string) $todo->id, $payload['data']['todo_id']);
    }

    public function test_chore_assigned_to_fcm_returns_correct_payload(): void
    {
        $chore = Chore::factory()->create(['title' => 'Vacuum floors']);
        $notification = new ChoreAssigned($chore);
        $user = User::factory()->create();

        $payload = $notification->toFcm($user);

        $this->assertEquals('New chore assigned', $payload['title']);
        $this->assertStringContainsString('Vacuum floors', $payload['body']);
        $this->assertEquals('chore_assigned', $payload['data']['type']);
        $this->assertEquals((string) $chore->id, $payload['data']['chore_id']);
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    /** @param array{title: string, body: string, data?: array<string, string>} $payload */
    private function makeFcmNotification(array $payload): Notification
    {
        return new class($payload) extends Notification
        {
            public function __construct(private readonly array $payload) {}

            /** @return list<string> */
            public function via(mixed $notifiable): array
            {
                return [FirebaseNotificationChannel::class];
            }

            /** @return array{title: string, body: string, data?: array<string, string>} */
            public function toFcm(mixed $notifiable): array
            {
                return $this->payload;
            }
        };
    }

    /** @param list<string> $invalidTokens */
    private function makeMulticastReport(array $invalidTokens, string ...$successTokens): MulticastSendReport
    {
        $items = [];

        foreach ($successTokens as $token) {
            $items[] = SendReport::success(
                MessageTarget::with(MessageTarget::TOKEN, $token),
                ['name' => 'projects/test/messages/ok'],
            );
        }

        foreach ($invalidTokens as $token) {
            $items[] = SendReport::failure(
                MessageTarget::with(MessageTarget::TOKEN, $token),
                new ApiConnectionFailed('invalid registration token'),
            );
        }

        return MulticastSendReport::withItems($items);
    }
}
