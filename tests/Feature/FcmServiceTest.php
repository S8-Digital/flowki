<?php

namespace Tests\Feature;

use App\Models\FcmToken;
use App\Models\User;
use App\Services\FcmService;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

class FcmServiceTest extends TestCase
{
    use RefreshDatabase;

    private FcmService $fcmService;

    private MockInterface $messaging;

    protected function setUp(): void
    {
        parent::setUp();

        $this->messaging = Mockery::mock(Messaging::class);
        $this->fcmService = new FcmService($this->messaging);
    }

    // ── sendToToken ────────────────────────────────────────────────────────────

    public function test_send_to_token_returns_true_on_success(): void
    {
        $this->messaging
            ->shouldReceive('send')
            ->once()
            ->with(Mockery::on(fn (CloudMessage $msg) => true))
            ->andReturn([]);

        $result = $this->fcmService->sendToToken('device-token', ['title' => 'Hello', 'body' => 'World']);

        $this->assertTrue($result);
    }

    public function test_send_to_token_returns_false_and_logs_on_exception(): void
    {
        $this->messaging
            ->shouldReceive('send')
            ->once()
            ->andThrow(new ApiConnectionFailed('Connection failed'));

        Log::shouldReceive('warning')
            ->once()
            ->withArgs(fn (string $msg) => str_contains($msg, 'FCM: failed to send to token.'));

        $result = $this->fcmService->sendToToken('bad-token', ['title' => 'Hi', 'body' => 'There']);

        $this->assertFalse($result);
    }

    // ── sendToUser ─────────────────────────────────────────────────────────────

    public function test_send_to_user_sends_multicast_to_all_registered_tokens(): void
    {
        $user = User::factory()->create();
        FcmToken::factory()->create(['user_id' => $user->id, 'token' => 'token-one']);
        FcmToken::factory()->create(['user_id' => $user->id, 'token' => 'token-two']);

        $report = $this->makeMulticastReport([], 'token-one', 'token-two');

        $this->messaging
            ->shouldReceive('sendMulticast')
            ->once()
            ->with(Mockery::type(CloudMessage::class), Mockery::type('array'))
            ->andReturn($report);

        $this->fcmService->sendToUser($user, ['title' => 'Hi', 'body' => 'There']);
    }

    public function test_send_to_user_prunes_invalid_tokens_reported_by_fcm(): void
    {
        $user = User::factory()->create();
        FcmToken::factory()->create(['user_id' => $user->id, 'token' => 'valid-token']);
        $stale = FcmToken::factory()->create(['user_id' => $user->id, 'token' => 'stale-token']);

        $report = $this->makeMulticastReport(['stale-token'], 'valid-token');

        $this->messaging
            ->shouldReceive('sendMulticast')
            ->once()
            ->andReturn($report);

        $this->fcmService->sendToUser($user, ['title' => 'Hi', 'body' => 'There']);

        $this->assertDatabaseMissing('fcm_tokens', ['id' => $stale->id]);
        $this->assertDatabaseCount('fcm_tokens', 1);
    }

    public function test_send_to_user_with_no_tokens_skips_the_sdk_entirely(): void
    {
        $user = User::factory()->create();

        $this->messaging->shouldNotReceive('send');
        $this->messaging->shouldNotReceive('sendMulticast');

        $this->fcmService->sendToUser($user, ['title' => 'Hi', 'body' => 'There']);
    }

    public function test_send_to_user_logs_warning_on_multicast_exception(): void
    {
        $user = User::factory()->create();
        FcmToken::factory()->create(['user_id' => $user->id, 'token' => 'a-token']);

        $this->messaging
            ->shouldReceive('sendMulticast')
            ->once()
            ->andThrow(new ApiConnectionFailed('Connection failed'));

        Log::shouldReceive('warning')
            ->once()
            ->withArgs(fn (string $msg) => str_contains($msg, 'FCM: multicast send failed.'));

        $this->fcmService->sendToUser($user, ['title' => 'Hi', 'body' => 'There']);
    }

    // ── sendToUsers ────────────────────────────────────────────────────────────

    public function test_send_to_users_calls_send_to_user_for_each(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        FcmToken::factory()->create(['user_id' => $userA->id, 'token' => 'token-a']);
        FcmToken::factory()->create(['user_id' => $userB->id, 'token' => 'token-b']);

        $report = $this->makeMulticastReport([], 'token-a');

        $this->messaging
            ->shouldReceive('sendMulticast')
            ->twice()
            ->andReturn($report);

        $this->fcmService->sendToUsers([$userA, $userB], ['title' => 'Hi', 'body' => 'There']);
    }

    // ── helpers ────────────────────────────────────────────────────────────────

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
