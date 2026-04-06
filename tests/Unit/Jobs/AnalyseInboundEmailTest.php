<?php

namespace Tests\Unit\Jobs;

use App\Ai\InboundEmailAnalysisAgent;
use App\Jobs\AnalyseInboundEmail;
use App\Models\InboundEmail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Responses\AgentResponse;
use Tests\TestCase;

class AnalyseInboundEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_job_logs_warning_when_email_not_found(): void
    {
        Log::shouldReceive('warning')
            ->once()
            ->with('AnalyseInboundEmail: inbound email or user not found.', \Mockery::any());

        $job = new AnalyseInboundEmail(99999);
        $job->handle();
    }

    public function test_job_logs_warning_when_user_not_found(): void
    {
        $this->markTestSkipped('Foreign key constraints prevent persisting an inbound email without an existing user.');

        Log::shouldReceive('warning')
            ->once()
            ->with('AnalyseInboundEmail: inbound email or user not found.', \Mockery::any());

        $job = new AnalyseInboundEmail(1);
        $job->handle();
    }

    public function test_job_logs_warning_when_no_ai_provider_configured(): void
    {
        config(['ai.providers.anthropic.key' => null, 'ai.providers.gemini.key' => null]);

        $user = User::factory()->withFamily()->create();
        $email = InboundEmail::create([
            'user_id' => $user->id,
            'from' => 'sender@example.com',
            'subject' => 'Test email',
            'body_text' => 'Test body',
            'raw' => 'raw content',
            'has_calendar' => false,
            'processed_at' => null,
        ]);

        Log::shouldReceive('warning')
            ->once()
            ->with('AnalyseInboundEmail: no AI provider configured; skipping analysis.', \Mockery::any());

        $job = new AnalyseInboundEmail($email->id);
        $job->handle();

        // processed_at should remain null
        $this->assertNull($email->fresh()->processed_at);
    }

    public function test_job_marks_processed_at_on_success(): void
    {
        config(['ai.providers.anthropic.key' => 'test-key']);

        $user = User::factory()->withFamily()->create();
        $email = InboundEmail::create([
            'user_id' => $user->id,
            'from' => 'sender@example.com',
            'subject' => 'Test email',
            'body_text' => 'Please add milk to my shopping list.',
            'raw' => 'raw content',
            'has_calendar' => false,
            'processed_at' => null,
        ]);

        $mock = \Mockery::mock(InboundEmailAnalysisAgent::class);
        $mock->shouldReceive('prompt')->once()->andReturn(\Mockery::mock(AgentResponse::class));
        app()->bind(InboundEmailAnalysisAgent::class, fn () => $mock);

        $job = new AnalyseInboundEmail($email->id);
        $job->handle();

        $this->assertNotNull($email->fresh()->processed_at);
    }

    public function test_job_has_correct_retry_settings(): void
    {
        $job = new AnalyseInboundEmail(1);

        $this->assertEquals(3, $job->tries);
        $this->assertEquals(120, $job->timeout);
    }
}
