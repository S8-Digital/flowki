<?php

namespace App\Jobs;

use App\Ai\InboundEmailAnalysisAgent;
use App\Models\InboundEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AnalyseInboundEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    public function __construct(public readonly int $inboundEmailId) {}

    public function handle(): void
    {
        $inboundEmail = InboundEmail::with('user')->find($this->inboundEmailId);

        if (! $inboundEmail || ! $inboundEmail->user) {
            Log::warning('AnalyseInboundEmail: inbound email or user not found.', [
                'inbound_email_id' => $this->inboundEmailId,
            ]);

            return;
        }

        $user = $inboundEmail->user;

        if (! config('ai.providers.anthropic.key') && ! config('ai.providers.gemini.key')) {
            Log::warning('AnalyseInboundEmail: no AI provider configured; skipping analysis.', [
                'inbound_email_id' => $this->inboundEmailId,
            ]);

            return;
        }

        app(InboundEmailAnalysisAgent::class, ['user' => $user])->prompt($this->buildEmailContent($inboundEmail));

        $inboundEmail->update(['processed_at' => now()]);
    }

    private function buildEmailContent(InboundEmail $inboundEmail): string
    {
        $parts = [];

        $parts[] = 'From: '.$inboundEmail->from;

        if ($inboundEmail->subject) {
            $parts[] = 'Subject: '.$inboundEmail->subject;
        }

        if ($inboundEmail->body_text) {
            $parts[] = "Body:\n".$inboundEmail->body_text;
        } elseif ($inboundEmail->body_html) {
            $parts[] = "Body (HTML):\n".strip_tags((string) $inboundEmail->body_html);
        }

        if (! empty($inboundEmail->attachments)) {
            $attachmentDescriptions = collect($inboundEmail->attachments)
                ->map(fn (array $a) => sprintf(
                    '- %s (%s%s)',
                    $a['filename'] ?? 'unknown',
                    $a['content_type'] ?? 'unknown',
                    ($a['is_calendar'] ?? false) ? ', calendar file' : ''
                ))
                ->implode("\n");

            $parts[] = "Attachments:\n".$attachmentDescriptions;
        }

        return implode("\n\n", $parts);
    }
}
