<?php

namespace Tests\Unit\Services;

use App\Jobs\AnalyseInboundEmail;
use App\Models\InboundEmail;
use App\Models\User;
use App\Services\InboundEmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class InboundEmailServiceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A minimal but syntactically valid raw MIME email with a plain-text body.
     */
    private function makeRawEmail(
        string $from = 'sender@example.com',
        string $subject = 'Hello',
        string $body = 'Please add milk to the shopping list.',
    ): string {
        return implode("\r\n", [
            "From: {$from}",
            'To: flowki@example.com',
            "Subject: {$subject}",
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            '',
            $body,
        ]);
    }

    public function test_handle_creates_inbound_email_record(): void
    {
        Queue::fake();

        $user = User::factory()->withFamily()->create();
        $raw = $this->makeRawEmail();

        $service = new InboundEmailService;
        $result = $service->handle($user, 'sender@example.com', 'Hello', $raw);

        $this->assertInstanceOf(InboundEmail::class, $result);
        $this->assertDatabaseHas('inbound_emails', [
            'user_id' => $user->id,
            'from' => 'sender@example.com',
            'subject' => 'Hello',
        ]);
    }

    public function test_handle_dispatches_analyse_job(): void
    {
        Queue::fake();

        $user = User::factory()->withFamily()->create();
        $service = new InboundEmailService;
        $result = $service->handle($user, 'sender@example.com', 'Test', $this->makeRawEmail());

        Queue::assertPushed(AnalyseInboundEmail::class, function ($job) use ($result) {
            return $job->inboundEmailId === $result->id;
        });
    }

    public function test_handle_extracts_plain_text_body(): void
    {
        Queue::fake();

        $user = User::factory()->withFamily()->create();
        $raw = $this->makeRawEmail(body: 'Please buy tomatoes.');
        $service = new InboundEmailService;
        $result = $service->handle($user, 'sender@example.com', 'Groceries', $raw);

        $this->assertStringContainsString('tomatoes', (string) $result->body_text);
    }

    public function test_handle_sets_processed_at_to_null(): void
    {
        Queue::fake();

        $user = User::factory()->withFamily()->create();
        $service = new InboundEmailService;
        $result = $service->handle($user, 'sender@example.com', 'Test', $this->makeRawEmail());

        $this->assertNull($result->processed_at);
    }

    public function test_handle_stores_null_subject_when_empty(): void
    {
        Queue::fake();

        $user = User::factory()->withFamily()->create();
        $service = new InboundEmailService;

        // Pass empty subject to simulate a blank subject line
        $result = $service->handle($user, 'sender@example.com', '', $this->makeRawEmail(subject: ''));

        $this->assertNull($result->subject);
    }

    public function test_handle_detects_no_calendar_attachment_in_plain_text_email(): void
    {
        Queue::fake();

        $user = User::factory()->withFamily()->create();
        $service = new InboundEmailService;
        $result = $service->handle($user, 'sender@example.com', 'Test', $this->makeRawEmail());

        $this->assertFalse($result->has_calendar);
    }
}
