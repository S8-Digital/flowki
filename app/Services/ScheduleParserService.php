<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\AnonymousAgent;
use Laravel\Ai\Messages\UserMessage;

class ScheduleParserService
{
    /**
     * Parse an uploaded schedule file and return an array of parsed shifts.
     *
     * Each shift has: title, start_at (ISO 8601), end_at (ISO 8601|null), is_all_day (bool).
     *
     * @return list<array{title: string, start_at: string, end_at: string|null, is_all_day: bool}>
     */
    public function parseFile(UploadedFile $file): array
    {
        $mime = $file->getMimeType() ?? '';
        $ext = strtolower($file->getClientOriginalExtension());

        if (str_starts_with($mime, 'text/') || $ext === 'txt' || $ext === 'csv') {
            return $this->parseText((string) file_get_contents($file->getRealPath()));
        }

        if (in_array($mime, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) ||
            in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
            return $this->parseImageWithAi($file);
        }

        if ($mime === 'application/pdf' || $ext === 'pdf') {
            return $this->parsePdfWithAi($file);
        }

        // Attempt plain-text fallback for unknown types
        return $this->parseText((string) file_get_contents($file->getRealPath()));
    }

    /**
     * Parse a plain-text schedule string and return normalised shift records.
     *
     * Supported formats (examples):
     *   Mon 17/03  07:00-15:00  Morning Shift
     *   2026-03-18  Night Shift  22:00 - 06:00
     *   03/20 09:00-17:00
     *   March 21, 2026 - Day Off
     *   Tuesday 22 Mar: REST DAY
     *
     * @return list<array{title: string, start_at: string, end_at: string|null, is_all_day: bool}>
     */
    public function parseText(string $content): array
    {
        $shifts = [];

        foreach (preg_split('/\r?\n/', $content) as $line) {
            $line = trim($line);

            if ($line === '' || str_starts_with($line, '#') || str_starts_with($line, '//')) {
                continue;
            }

            $shift = $this->parseLine($line);

            if ($shift !== null) {
                $shifts[] = $shift;
            }
        }

        return $shifts;
    }

    /**
     * Parse a single line and return a shift record or null.
     *
     * @return array{title: string, start_at: string, end_at: string|null, is_all_day: bool}|null
     */
    public function parseLine(string $line): ?array
    {
        // Collapse multiple spaces but leave date/time separators intact so
        // extractDate() and extractTimeRange() can match them correctly.
        $line = preg_replace('/\s+/', ' ', trim($line)) ?? $line;

        $date = $this->extractDate($line);

        if ($date === null) {
            return null;
        }

        [$startTime, $endTime] = $this->extractTimeRange($line);

        $title = $this->extractTitle($line);

        if ($title === '') {
            return null;
        }

        $isAllDay = $startTime === null;

        $startAt = $isAllDay
            ? $date.'T00:00:00'
            : $date.'T'.$startTime.':00';

        $endAt = ($endTime !== null)
            ? $date.'T'.$endTime.':00'
            : null;

        // Overnight shift: if end time is earlier than start time, advance end by 1 day
        if ($endAt !== null && $endAt <= $startAt) {
            $endAt = date('Y-m-d', strtotime($date.' +1 day')).'T'.$endTime.':00';
        }

        return [
            'title' => $title,
            'start_at' => $startAt,
            'end_at' => $endAt,
            'is_all_day' => $isAllDay,
        ];
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /** Attempt to extract a YYYY-MM-DD date string from the line. */
    private function extractDate(string $line): ?string
    {
        // ISO format: 2026-03-17
        if (preg_match('/\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/', $line, $m)) {
            return $this->safeDate((int) $m[1], (int) $m[2], (int) $m[3]);
        }

        // DD/MM/YYYY or MM/DD/YYYY
        // Prefer DD/MM (common in AU/NZ/UK schedules). When both orderings yield
        // a valid date we return the DD/MM interpretation; when DD/MM is invalid
        // we fall back to MM/DD.
        if (preg_match('/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/', $line, $m)) {
            $a = (int) $m[1];
            $b = (int) $m[2];
            $y = (int) $m[3];

            // Try DD/MM first
            $ddMm = $this->safeDate($y, $b, $a);

            if ($ddMm !== null) {
                return $ddMm;
            }

            // Fall back to MM/DD
            return $this->safeDate($y, $a, $b);
        }

        // MM/DD short (no year) – e.g. 03/17
        if (preg_match('/\b(\d{1,2})\/(\d{1,2})\b/', $line, $m)) {
            $year = (int) date('Y');
            $a = (int) $m[1];
            $b = (int) $m[2];

            if ($b >= 1 && $b <= 31 && $a >= 1 && $a <= 12) {
                return $this->safeDate($year, $a, $b);
            }
        }

        // Named month: 17 Mar 2026 / Mar 17 2026 / March 17, 2026
        if (preg_match(
            '/\b(\d{1,2})\s+('.self::MONTH_NAMES.')\s+(\d{4})\b/i',
            $line, $m
        )) {
            $month = $this->monthNumber($m[2]);

            return $this->safeDate((int) $m[3], $month, (int) $m[1]);
        }

        if (preg_match(
            '/\b('.self::MONTH_NAMES.')\s+(\d{1,2})[,\s]+(\d{4})\b/i',
            $line, $m
        )) {
            $month = $this->monthNumber($m[1]);

            return $this->safeDate((int) $m[3], $month, (int) $m[2]);
        }

        // Day-of-week + DD Mon (no year): Mon 17 Mar
        if (preg_match(
            '/(?:'.self::DAY_NAMES.')[\s,]+(\d{1,2})\s+('.self::MONTH_NAMES.')/i',
            $line, $m
        )) {
            $month = $this->monthNumber($m[2]);
            $year = (int) date('Y');

            return $this->safeDate($year, $month, (int) $m[1]);
        }

        return null;
    }

    /**
     * Extract a time range from the line.
     *
     * @return array{0: string|null, 1: string|null} [startHH:MM, endHH:MM]
     */
    private function extractTimeRange(string $line): array
    {
        // HH:MM - HH:MM  or  HH.MM - HH.MM
        if (preg_match('/(\d{1,2})[:\.](\d{2})\s*[\-–—to]+\s*(\d{1,2})[:\.](\d{2})/i', $line, $m)) {
            $start = sprintf('%02d:%02d', (int) $m[1], (int) $m[2]);
            $end = sprintf('%02d:%02d', (int) $m[3], (int) $m[4]);

            return [$start, $end];
        }

        // Single time HH:MM
        if (preg_match('/\b(\d{1,2})[:\.](\d{2})\b/', $line, $m)) {
            $start = sprintf('%02d:%02d', (int) $m[1], (int) $m[2]);

            return [$start, null];
        }

        return [null, null];
    }

    /** Strip date/time tokens from the line and return whatever text remains as the title. */
    private function extractTitle(string $line): string
    {
        // Remove date parts
        $title = preg_replace('/\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/', '', $line) ?? $line;
        $title = preg_replace('/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}\b/', '', $title) ?? $title;
        $title = preg_replace('/\b\d{1,2}\/\d{1,2}\b/', '', $title) ?? $title;
        $title = preg_replace('/\b\d{1,2}\s+('.self::MONTH_NAMES.')\s+\d{4}\b/i', '', $title) ?? $title;
        $title = preg_replace('/\b('.self::MONTH_NAMES.')\s+\d{1,2}[,\s]+\d{4}\b/i', '', $title) ?? $title;
        $title = preg_replace('/(?:'.self::DAY_NAMES.')[\s,]+\d{1,2}\s+(?:'.self::MONTH_NAMES.')/i', '', $title) ?? $title;
        $title = preg_replace('/\b(?:'.self::DAY_NAMES.')\b/i', '', $title) ?? $title;

        // Remove time range
        $title = preg_replace('/\d{1,2}[:\.]?\d{2}\s*[\-–—to]+\s*\d{1,2}[:\.]?\d{2}/i', '', $title) ?? $title;

        // Remove standalone times
        $title = preg_replace('/\b\d{1,2}[:\.]?\d{2}\b/', '', $title) ?? $title;

        // Clean separators and whitespace
        $title = preg_replace('/[\-–—\/|,]+/', ' ', $title) ?? $title;
        $title = preg_replace('/\s+/', ' ', trim($title)) ?? trim($title);

        return $title;
    }

    /**
     * Validate the date components and return a YYYY-MM-DD string, or null if invalid.
     *
     * Uses checkdate() to reject impossible dates (e.g. Feb 31) instead of
     * silently rolling them over to the next valid date.
     */
    private function safeDate(int $year, int $month, int $day): ?string
    {
        if (! checkdate($month, $day, $year)) {
            return null;
        }

        return sprintf('%04d-%02d-%02d', $year, $month, $day);
    }

    private function monthNumber(string $name): int
    {
        return (int) date('n', strtotime("1 {$name} 2000"));
    }

    /**
     * Use laravel/ai vision model to parse a schedule image.
     *
     * @return list<array{title: string, start_at: string, end_at: string|null, is_all_day: bool}>
     */
    private function parseImageWithAi(UploadedFile $file): array
    {
        if (! $this->isAiConfigured()) {
            return [];
        }

        try {
            $base64 = base64_encode((string) file_get_contents($file->getRealPath()));
            $mime = $file->getMimeType() ?? 'image/jpeg';

            $prompt = <<<'PROMPT'
            You are extracting a work schedule from an image. Return ONLY a JSON array.
            Each element must have these exact keys: title (shift name/code), start_at (ISO 8601 datetime), end_at (ISO 8601 datetime or null), is_all_day (boolean).
            Example: [{"title":"Morning Shift","start_at":"2026-03-17T07:00:00","end_at":"2026-03-17T15:00:00","is_all_day":false}]
            If a shift has no time, set is_all_day to true and use midnight for start_at.
            Respond with ONLY the JSON array, no explanation.
            PROMPT;

            $response = AnonymousAgent::make(
                instructions: 'You extract structured schedule data from images. Return only valid JSON.',
                messages: [new UserMessage("data:{$mime};base64,{$base64}")],
                tools: []
            )->run($prompt);

            return $this->parseAiJsonResponse((string) $response);
        } catch (\Throwable $e) {
            Log::warning('ScheduleParserService: AI image parse failed', ['error' => $e->getMessage()]);

            return [];
        }
    }

    /**
     * Use laravel/ai to parse a schedule PDF.
     *
     * @return list<array{title: string, start_at: string, end_at: string|null, is_all_day: bool}>
     */
    private function parsePdfWithAi(UploadedFile $file): array
    {
        if (! $this->isAiConfigured()) {
            return [];
        }

        try {
            $base64 = base64_encode((string) file_get_contents($file->getRealPath()));

            $prompt = <<<'PROMPT'
            You are extracting a work schedule from a PDF document (provided as base64). Return ONLY a JSON array.
            Each element must have these exact keys: title (shift name/code), start_at (ISO 8601 datetime), end_at (ISO 8601 datetime or null), is_all_day (boolean).
            Example: [{"title":"Morning Shift","start_at":"2026-03-17T07:00:00","end_at":"2026-03-17T15:00:00","is_all_day":false}]
            Respond with ONLY the JSON array, no explanation.
            PROMPT;

            $response = AnonymousAgent::make(
                instructions: 'You extract structured schedule data from documents. Return only valid JSON.',
                messages: [new UserMessage("PDF document (base64): {$base64}")],
                tools: []
            )->run($prompt);

            return $this->parseAiJsonResponse((string) $response);
        } catch (\Throwable $e) {
            Log::warning('ScheduleParserService: AI PDF parse failed', ['error' => $e->getMessage()]);

            return [];
        }
    }

    /**
     * Parse the JSON response from an AI call.
     *
     * @return list<array{title: string, start_at: string, end_at: string|null, is_all_day: bool}>
     */
    private function parseAiJsonResponse(string $response): array
    {
        // Strip any markdown code fences
        $json = preg_replace('/^```(?:json)?\s*|\s*```$/m', '', trim($response));

        $decoded = json_decode($json ?? $response, true);

        if (! is_array($decoded)) {
            return [];
        }

        $shifts = [];

        foreach ($decoded as $item) {
            if (! isset($item['title'], $item['start_at'])) {
                continue;
            }

            $shifts[] = [
                'title' => (string) $item['title'],
                'start_at' => (string) $item['start_at'],
                'end_at' => isset($item['end_at']) ? (string) $item['end_at'] : null,
                'is_all_day' => (bool) ($item['is_all_day'] ?? false),
            ];
        }

        return $shifts;
    }

    private function isAiConfigured(): bool
    {
        return ! empty(config('ai.providers.openai.key'))
            || ! empty(config('ai.providers.anthropic.key'))
            || ! empty(config('ai.providers.gemini.key'));
    }

    private const MONTH_NAMES = 'Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?';

    private const DAY_NAMES = 'Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?';
}
