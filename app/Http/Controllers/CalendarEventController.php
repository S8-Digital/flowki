<?php

namespace App\Http\Controllers;

use App\Http\Requests\CalendarEvent\MoveCalendarEventRequest;
use App\Http\Requests\CalendarEvent\StoreCalendarEventRequest;
use App\Http\Requests\CalendarEvent\UpdateCalendarEventRequest;
use App\Http\Resources\CalendarEventResource;
use App\Http\Resources\ChoreResource;
use App\Http\Resources\TodoResource;
use App\Http\Resources\UserResource;
use App\Models\CalendarEvent;
use App\Models\Chore;
use App\Models\Todo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarEventController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CalendarEvent::class);

        $family = $request->user()->family;
        $members = UserResource::collection($family->members()->get())->resolve();

        $events = CalendarEventResource::collection(
            CalendarEvent::query()
                ->forFamily($family->id)
                ->with(['attendees:id,name,email,email_verified_at', 'creator:id,name'])
                ->orderBy('start_at', 'asc')
                ->get()
        )->resolve();

        $todos = TodoResource::collection(
            Todo::query()
                ->forFamily($family->id)
                ->whereNotNull('due_date')
                ->with(['assignee:id,name,email,email_verified_at'])
                ->get()
        )->resolve();

        $chores = ChoreResource::collection(
            Chore::query()
                ->forFamily($family->id)
                ->whereNotNull('next_due_date')
                ->with(['assignees:id,name,email,email_verified_at'])
                ->get()
        )->resolve();

        return Inertia::render('Calendar/Index', [
            'events' => $events,
            'todos' => $todos,
            'chores' => $chores,
            'members' => $members,
        ]);
    }

    public function familySchedule(Request $request): Response
    {
        $this->authorize('viewAny', CalendarEvent::class);

        $family = $request->user()->family;
        $date = $request->query('date', now()->toDateString());
        $members = UserResource::collection($family->members()->get())->resolve();

        $events = CalendarEventResource::collection(
            CalendarEvent::query()
                ->forFamily($family->id)
                ->with(['attendees:id,name,email,email_verified_at', 'creator:id,name'])
                ->orderBy('start_at', 'asc')
                ->get()
        )->resolve();

        $todos = TodoResource::collection(
            Todo::query()
                ->forFamily($family->id)
                ->whereNotNull('due_date')
                ->with(['assignee:id,name,email,email_verified_at'])
                ->get()
        )->resolve();

        $chores = ChoreResource::collection(
            Chore::query()
                ->forFamily($family->id)
                ->whereNotNull('next_due_date')
                ->with(['assignees:id,name,email,email_verified_at'])
                ->get()
        )->resolve();

        return Inertia::render('Calendar/Index', [
            'events' => $events,
            'todos' => $todos,
            'chores' => $chores,
            'members' => $members,
            'initialView' => 'family',
            'initialDate' => $date,
        ]);
    }

    public function store(StoreCalendarEventRequest $request): RedirectResponse
    {
        $this->authorize('create', CalendarEvent::class);

        $event = CalendarEvent::create(array_merge(
            $request->safe()->except('attendee_ids'),
            [
                'family_id' => $request->user()->family_id,
                'created_by' => $request->user()->id,
            ]
        ));

        if ($request->filled('attendee_ids')) {
            $event->attendees()->sync($request->attendee_ids);
        }

        return back();
    }

    public function update(UpdateCalendarEventRequest $request, CalendarEvent $calendarEvent): RedirectResponse
    {
        $this->authorize('update', $calendarEvent);

        $calendarEvent->update($request->safe()->except('attendee_ids'));

        if ($request->has('attendee_ids')) {
            $calendarEvent->attendees()->sync($request->attendee_ids ?? []);
        }

        return back();
    }

    public function move(MoveCalendarEventRequest $request, CalendarEvent $calendarEvent): RedirectResponse
    {
        $this->authorize('update', $calendarEvent);

        $calendarEvent->update($request->validated());

        return back();
    }

    public function destroy(Request $request, CalendarEvent $calendarEvent): RedirectResponse
    {
        $this->authorize('delete', $calendarEvent);

        $calendarEvent->delete();

        return back();
    }
}
