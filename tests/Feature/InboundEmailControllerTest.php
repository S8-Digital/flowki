<?php

namespace Tests\Feature;

use App\Jobs\AnalyseInboundEmail;
use App\Models\InboundEmail;
use App\Models\User;
use App\Services\InboundEmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class InboundEmailControllerTest extends TestCase
{
    use RefreshDatabase;

    private string $validRaw = "From: sender@example.com\r\nTo: token@in.flowki.family\r\nSubject: Test\r\n\r\nHello!";

    private function validPayload(string $token): array
    {
        return [
            'token' => $token,
            'to' => $token.'@in.flowki.family',
            'from' => 'sender@example.com',
            'subject' => 'Test email',
            'raw' => $this->validRaw,
        ];
    }

    private function withSecret(string $secret = 'test-secret'): array
    {
        return ['X-Worker-Secret' => $secret];
    }

    // -----------------------------------------------------------------------
    // Authentication / authorisation
    // -----------------------------------------------------------------------

    public function test_returns_403_when_secret_header_is_missing(): void
    {
        config(['services.cloudflare.worker_secret' => 'test-secret']);

        $user = User::factory()->create();

        $this->postJson('/api/inbound-email', $this->validPayload($user->inbound_email_token))
            ->assertForbidden();
    }

    public function test_returns_403_when_secret_header_is_wrong(): void
    {
        config(['services.cloudflare.worker_secret' => 'test-secret']);

        $user = User::factory()->create();

        $this->postJson(
            '/api/inbound-email',
            $this->validPayload($user->inbound_email_token),
            ['X-Worker-Secret' => 'wrong-secret']
        )->assertForbidden();
    }

    public function test_returns_403_when_no_secret_configured(): void
    {
        config(['services.cloudflare.worker_secret' => null]);

        $user = User::factory()->create();

        $this->postJson(
            '/api/inbound-email',
            $this->validPayload($user->inbound_email_token),
            $this->withSecret()
        )->assertForbidden();
    }

    // -----------------------------------------------------------------------
    // Token lookup
    // -----------------------------------------------------------------------

    public function test_returns_404_when_token_does_not_match_any_user(): void
    {
        config(['services.cloudflare.worker_secret' => 'test-secret']);

        $this->postJson(
            '/api/inbound-email',
            $this->validPayload('unknown-token'),
            $this->withSecret()
        )->assertNotFound();
    }

    // -----------------------------------------------------------------------
    // Success path
    // -----------------------------------------------------------------------

    public function test_stores_inbound_email_and_dispatches_job(): void
    {
        config(['services.cloudflare.worker_secret' => 'test-secret']);
        Queue::fake();

        $user = User::factory()->create();

        // Mock the service to avoid the mailparse PHP extension requirement in local PHP.
        // The mock simulates the real behaviour: store the record and dispatch the job.
        $this->mock(InboundEmailService::class, function ($mock) use ($user) {
            $mock->shouldReceive('handle')
                ->once()
                ->andReturnUsing(function () use ($user) {
                    $email = InboundEmail::create([
                        'user_id' => $user->id,
                        'from' => 'sender@example.com',
                        'subject' => 'Test email',
                        'raw' => "From: sender@example.com\r\n\r\nHello!",
                        'has_calendar' => false,
                    ]);

                    AnalyseInboundEmail::dispatch($email->id);

                    return $email;
                });
        });

        $this->postJson(
            '/api/inbound-email',
            $this->validPayload($user->inbound_email_token),
            $this->withSecret()
        )->assertOk()->assertJson(['message' => 'OK']);

        $this->assertDatabaseHas('inbound_emails', [
            'user_id' => $user->id,
            'from' => 'sender@example.com',
            'subject' => 'Test email',
        ]);

        Queue::assertPushed(AnalyseInboundEmail::class, function (AnalyseInboundEmail $job) {
            return InboundEmail::find($job->inboundEmailId) !== null;
        });
    }

    // -----------------------------------------------------------------------
    // Validation
    // -----------------------------------------------------------------------

    public function test_returns_422_when_required_fields_are_missing(): void
    {
        config(['services.cloudflare.worker_secret' => 'test-secret']);

        $this->postJson('/api/inbound-email', [], $this->withSecret())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['token', 'to', 'from', 'raw']);
    }
}
