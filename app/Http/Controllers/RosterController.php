<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConfirmScheduleRequest;
use App\Http\Requests\UploadScheduleRequest;
use App\Models\CalendarEvent;
use App\Services\RosterParserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class RosterController extends Controller
{
    public function __construct(private RosterParserService $parser) {}

    /**
     * Upload a schedule file and return parsed shifts as JSON for preview.
     */
    public function upload(UploadScheduleRequest $request): JsonResponse
    {
        $file = $request->file('file');

        $shifts = $this->parser->parseFile($file);

        if (empty($shifts)) {
            return response()->json([
                'message' => 'No shifts could be parsed from the uploaded file. '
                    .'Please check the file format. Plain-text files (e.g. work rosters in .txt or .csv) '
                    .'are supported directly. Images and PDFs require AI vision to be configured.',
                'shifts' => [],
            ], 422);
        }

        return response()->json(['shifts' => $shifts]);
    }

    /**
     * Confirm selected parsed shifts and create CalendarEvent records.
     *
     * Skips duplicates (same family, date, and title already exist).
     */
    public function confirm(ConfirmScheduleRequest $request): RedirectResponse
    {
        $user = $request->user();
        $familyId = $user->family_id;

        $created = 0;
        $skipped = 0;

        foreach ($request->validated('shifts') as $shift) {
            $startDate = date('Y-m-d', strtotime($shift['start_at']));

            $exists = CalendarEvent::query()
                ->where('family_id', $familyId)
                ->where('created_by', $user->id)
                ->where('title', $shift['title'])
                ->whereDate('start_at', $startDate)
                ->exists();

            if ($exists) {
                $skipped++;

                continue;
            }

            $event = CalendarEvent::create([
                'family_id' => $familyId,
                'created_by' => $user->id,
                'title' => $shift['title'],
                'start_at' => $shift['start_at'],
                'end_at' => $shift['end_at'] ?? null,
                'is_all_day' => (bool) ($shift['is_all_day'] ?? false),
            ]);

            // Auto-assign the uploading user as an attendee
            $event->attendees()->sync([$user->id]);

            $created++;
        }

        $message = "{$created} schedule event(s) imported to your calendar.";

        if ($skipped > 0) {
            $message .= " {$skipped} duplicate(s) skipped.";
        }

        return back()->with('success', $message);
    }
}
