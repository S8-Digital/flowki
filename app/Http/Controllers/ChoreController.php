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
use App\Notifications\ChoreAssigned;
use App\Notifications\ChoreCompleted;
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
        $members = UserResource::collection($family->members()->get())->resolve();

        $chores = Inertia::defer(fn () => ChoreResource::collection(
            Chore::query()
                ->forFamily($family->id)
                ->with(['assignees:id,name,profile_color', 'creator:id,name'])
                ->when($request->search, fn ($q) => $q->search($request->search))
                ->when($request->assigned_to, fn ($q) => $q->whereHas('assignees', fn ($q) => $q->where('users.id', $request->assigned_to)))
                ->orderBy($request->sort_by ?? 'next_due_date', $request->sort_dir ?? 'asc')
                ->paginate(20)
                ->withQueryString()
        ));

        return Inertia::render('Chores/Index', [
            'chores' => $chores,
            'members' => $members,
            'filters' => $request->only(['search', 'assigned_to', 'sort_by', 'sort_dir']),
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
            $this->notifyNewAssignees($chore, $request->assignee_ids, [], $request->user()->id);
        }

        $this->syncAssigneesToGoogleCalendar($chore);

        return back();
    }

    public function update(UpdateChoreRequest $request, Chore $chore): RedirectResponse
    {
        $this->authorize('update', $chore);

        $previousAssigneeIds = $chore->assignees()->pluck('users.id')->toArray();

        $chore->update($request->safe()->except('assignee_ids'));

        if ($request->has('assignee_ids')) {
            $newAssigneeIds = $request->assignee_ids ?? [];
            $chore->assignees()->sync($newAssigneeIds);
            $this->notifyNewAssignees($chore, $newAssigneeIds, $previousAssigneeIds, $request->user()->id);
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

        // Notify creator if completed by someone else
        /** @var User $completedBy */
        $completedBy = $request->user();

        /** @var User|null $creator */
        $creator = User::find($chore->created_by);
        if ($creator && $creator->id !== $completedBy->id) {
            $creator->notify(new ChoreCompleted($chore, $completedBy));
        }

        return back();
    }

    /**
     * @param  int[]  $newIds
     * @param  int[]  $previousIds
     */
    private function notifyNewAssignees(Chore $chore, array $newIds, array $previousIds, int $actorId): void
    {
        $addedIds = array_diff(array_map('intval', $newIds), $previousIds);

        foreach ($addedIds as $userId) {
            if ($userId === $actorId) {
                continue;
            }

            /** @var User|null $user */
            $user = User::find($userId);
            $user?->notify(new ChoreAssigned($chore));
        }
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
