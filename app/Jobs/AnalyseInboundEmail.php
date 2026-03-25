<?php

namespace App\Jobs;

use App\Ai\Tools\AddShoppingItem;
use App\Ai\Tools\CreateChore;
use App\Ai\Tools\CreateEvent;
use App\Ai\Tools\CreateTodo;
use App\Models\InboundEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\AnonymousAgent;

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

        $emailContent = $this->buildEmailContent($inboundEmail);

        $instructions = $this->buildInstructions($user, $inboundEmail);

        AnonymousAgent::make(
            instructions: $instructions,
            messages: [],
            tools: [
                new CreateEvent($user),
                new CreateTodo($user),
                new CreateChore($user),
                new AddShoppingItem($user),
            ]
        )->prompt($emailContent);
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

    private function buildInstructions(mixed $user, InboundEmail $inboundEmail): string
    {
        $today = now()->toFormattedDayDateString();
        $userName = $user->name;
        $defaultAssignee = $user->id;

        $calendarNote = $inboundEmail->has_calendar
            ? 'This email contains a calendar file (.ics). Extract any events from it and add them as calendar events.'
            : '';

        return <<<MARKDOWN
        You are an intelligent family organiser assistant. Today's date is {$today}.

        An email has been received by {$userName}. Analyse the email content below and take the appropriate actions:

        - If the email describes an appointment, event, shift, or meeting — create a calendar event using create_event.
        - If the email describes a task or reminder — create a todo using create_todo.
        - If the email describes a recurring household duty — create a chore using create_chore.
        - If the email describes items to buy — add them to the shopping list using add_shopping_item.
        - If you are unsure whether something should be a todo, chore, or calendar item — default to creating a calendar event.
        - Assign items to user ID {$defaultAssignee} by default.
        - You may create multiple items if the email contains multiple actionable items.
        - If the email does not contain any actionable items (e.g. it is purely informational or spam), do nothing.

        {$calendarNote}

        Always prefer action over inaction. If in doubt, create a calendar event.
        MARKDOWN;
    }
}
