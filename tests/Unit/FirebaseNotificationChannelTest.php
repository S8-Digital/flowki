<?php

namespace Tests\Unit;

use App\Channels\FirebaseNotificationChannel;
use App\Models\Chore;
use App\Models\Todo;
use App\Models\User;
use App\Notifications\ChoreAssigned;
use App\Notifications\TodoAssigned;
use App\Services\FcmService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\Notification;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class FirebaseNotificationChannelTest extends TestCase
{
    use RefreshDatabase;

    private FirebaseNotificationChannel $channel;

    private MockInterface $fcmService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->fcmService = Mockery::mock(FcmService::class);
        $this->channel = new FirebaseNotificationChannel($this->fcmService);
    }

    public function test_delegates_notification_payload_to_fcm_service(): void
    {
        $user = User::factory()->create();

        $this->fcmService
            ->shouldReceive('sendToUser')
            ->once()
            ->with(
                Mockery::on(fn (User $u) => $u->is($user)),
                ['title' => 'Hello', 'body' => 'World'],
                [],
            );

        $notification = $this->makeFcmNotification(['title' => 'Hello', 'body' => 'World']);

        $this->channel->send($user, $notification);
    }

    public function test_delegates_data_payload_to_fcm_service(): void
    {
        $user = User::factory()->create();

        $this->fcmService
            ->shouldReceive('sendToUser')
            ->once()
            ->with(
                Mockery::on(fn (User $u) => $u->is($user)),
                ['title' => 'Task assigned', 'body' => 'A task was assigned to you'],
                ['type' => 'todo_assigned', 'todo_id' => '42'],
            );

        $notification = $this->makeFcmNotification([
            'title' => 'Task assigned',
            'body' => 'A task was assigned to you',
            'data' => ['type' => 'todo_assigned', 'todo_id' => '42'],
        ]);

        $this->channel->send($user, $notification);
    }

    public function test_send_skips_non_user_notifiable(): void
    {
        $this->fcmService->shouldNotReceive('sendToUser');

        $notifiable = new class
        {
            public function getKey(): int
            {
                return 1;
            }
        };

        $notification = $this->makeFcmNotification(['title' => 'Hi', 'body' => 'There']);

        $this->channel->send($notifiable, $notification);
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
}
