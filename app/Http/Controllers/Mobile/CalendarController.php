<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\CalendarEventResource;
use App\Models\CalendarEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CalendarController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', CalendarEvent::class);

        $events = CalendarEvent::query()
            ->forFamily($request->user()->family_id)
            ->with(['attendees:id,name,profile_color', 'creator:id,name'])
            ->when($request->start, fn ($q) => $q->where('start_at', '>=', $request->start))
            ->when($request->end, fn ($q) => $q->where('end_at', '<=', $request->end))
            ->orderBy('start_at', 'asc')
            ->get();

        return CalendarEventResource::collection($events);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', CalendarEvent::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'location' => ['nullable', 'string', 'max:255'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after_or_equal:start_at'],
            'is_all_day' => ['nullable', 'boolean'],
            'color' => ['nullable', 'string', 'max:50'],
        ]);

        $event = CalendarEvent::create(array_merge($validated, [
            'family_id' => $request->user()->family_id,
            'created_by' => $request->user()->id,
        ]));

        return (new CalendarEventResource($event->load(['attendees', 'creator'])))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, CalendarEvent $calendarEvent): JsonResponse
    {
        $this->authorize('update', $calendarEvent);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'location' => ['nullable', 'string', 'max:255'],
            'start_at' => ['sometimes', 'date'],
            'end_at' => ['sometimes', 'date', 'after_or_equal:start_at'],
            'is_all_day' => ['nullable', 'boolean'],
            'color' => ['nullable', 'string', 'max:50'],
        ]);

        $calendarEvent->update($validated);

        return (new CalendarEventResource($calendarEvent->fresh(['attendees', 'creator'])))->response();
    }

    public function destroy(CalendarEvent $calendarEvent): JsonResponse
    {
        $this->authorize('delete', $calendarEvent);

        $calendarEvent->delete();

        return response()->json(null, 204);
    }
}
