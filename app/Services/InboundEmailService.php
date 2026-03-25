<?php

namespace App\Services;

use App\Jobs\AnalyseInboundEmail;
use App\Models\InboundEmail;
use App\Models\User;
use PhpMimeMailParser\Parser;

class InboundEmailService
{
    /**
     * Parse the raw MIME email, store the result, and dispatch the analysis job.
     */
    public function handle(User $user, string $from, string $subject, string $raw): InboundEmail
    {
        $parser = new Parser;
        $parser->setText($raw);

        $bodyText = $parser->getMessageBody('text') ?: null;
        $bodyHtml = $parser->getMessageBody('html') ?: null;

        $attachments = [];
        $hasCalendar = false;

        foreach ($parser->getAttachments() as $attachment) {
            $contentType = strtolower($attachment->getContentType());
            $filename = $attachment->getFilename();
            $isCalendar = $contentType === 'text/calendar'
                || str_ends_with(strtolower($filename ?? ''), '.ics');

            if ($isCalendar) {
                $hasCalendar = true;
            }

            $attachments[] = [
                'filename' => $filename,
                'content_type' => $contentType,
                'size' => strlen($attachment->getContent()),
                'is_calendar' => $isCalendar,
            ];
        }

        $inboundEmail = InboundEmail::create([
            'user_id' => $user->id,
            'from' => $from,
            'subject' => $subject ?: null,
            'body_text' => $bodyText,
            'body_html' => $bodyHtml,
            'raw' => $raw,
            'has_calendar' => $hasCalendar,
            'attachments' => empty($attachments) ? null : $attachments,
            'processed_at' => now(),
        ]);

        AnalyseInboundEmail::dispatch($inboundEmail->id);

        return $inboundEmail;
    }
}
