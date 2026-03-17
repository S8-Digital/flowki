<?php

namespace App\Http\Controllers;

use App\Http\Requests\Chore\StoreChoreRequest;
use App\Http\Requests\Chore\UpdateChoreRequest;
use App\Http\Resources\ChoreResource;
use App\Http\Resources\UserResource;
use App\Jobs\SyncItemToGoogleCalendar;
use App\Models\Chore;
use App\Models\ChoreCompletion;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChoreController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Chore::class);

        $family = $request->user()->family;
        $members = UserResource::collection($family->getOrderedMembers())->resolve();

        $chores = Inertia::defer(fn () => ChoreResource::collection(
            Chore::query()
                ->forFamily($family->id)
                ->with(['assignees:id,name', 'creator:id,name'])
                ->when($request->search, fn ($q) => $q->search($request->search))
                ->when($request->assigned_to, fn ($q) => $q->whereHas('assignees', fn ($q) => $q->where('users.id', $request->assigned_to)))
                ->orderBy($request->sort_by ?? 'next_due_date', $request->sort_dir ?? 'asc')
                ->get()
        ));

        return Inertia::render('Chores/Index', [
            'chores' => $chores,
            'members' => $members,
        ]);
    }

    public function store(StoreChoreRequest $request): RedirectResponse
    {
        $this->authorize('create', Chore::class);

        $chore = Chore::create(array_merge(
            $request->safe()->except('assignee_ids'),
            [
                'family_id' => $request->user()->family_id,
                'created_by' => $request->user()->id,
            ]
        ));

        if ($request->filled('assignee_ids')) {
            $chore->assignees()->sync($request->assignee_ids);
        }

        $this->syncAssigneesToGoogleCalendar($chore);

        return back();
    }

    public function update(UpdateChoreRequest $request, Chore $chore): RedirectResponse
    {
        $this->authorize('update', $chore);

        $chore->update($request->safe()->except('assignee_ids'));

        if ($request->has('assignee_ids')) {
            $chore->assignees()->sync($request->assignee_ids ?? []);
        }

        $chore->load('assignees');
        $this->syncAssigneesToGoogleCalendar($chore);

        return back();
    }

    public function destroy(Request $request, Chore $chore): RedirectResponse
    {
        $this->authorize('delete', $chore);

        $chore->delete();

        return back();
    }

    public function complete(Request $request, Chore $chore): RedirectResponse
    {
        $this->authorize('complete', $chore);

        ChoreCompletion::create([
            'chore_id' => $chore->id,
            'completed_by' => $request->user()->id,
            'completed_at' => now(),
        ]);

        return back();
    }

    private function syncAssigneesToGoogleCalendar(Chore $chore): void
    {
        if (! $chore->next_due_date) {
            return;
        }

        $assignees = $chore->relationLoaded('assignees')
            ? $chore->assignees
            : $chore->assignees()->get();

        foreach ($assignees as $assignee) {
            /** @var User $assignee */
            if (! $assignee->hasGoogleCalendarConnected()) {
                continue;
            }

            $start = $chore->next_due_date->toIso8601String();
            $end = $chore->next_due_date->addHour()->toIso8601String();

            SyncItemToGoogleCalendar::dispatch($assignee, [
                'summary' => $chore->title,
                'description' => $chore->description ?? '',
                'start' => $start,
                'end' => $end,
            ]);
        }
    }
}
