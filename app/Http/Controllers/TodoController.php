<?php

namespace App\Http\Controllers;

use App\Http\Requests\Todo\StoreTodoRequest;
use App\Http\Requests\Todo\UpdateTodoRequest;
use App\Http\Resources\TodoResource;
use App\Http\Resources\UserResource;
use App\Jobs\SyncItemToGoogleCalendar;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TodoController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Todo::class);

        $family = $request->user()->family;
        $members = UserResource::collection($family->members()->get())->resolve();

        $todos = Inertia::defer(fn () => TodoResource::collection(
            Todo::query()
                ->forFamily($family->id)
                ->with(['assignee:id,name', 'creator:id,name'])
                ->when($request->search, fn ($q) => $q->search($request->search))
                ->when($request->status, fn ($q) => $q->where('status', $request->status))
                ->when($request->priority, fn ($q) => $q->where('priority', $request->priority))
                ->when($request->category, fn ($q) => $q->where('category', $request->category))
                ->when($request->assigned_to, fn ($q) => $q->where('assigned_to', $request->assigned_to))
                ->orderBy($request->sort_by ?? 'due_date', $request->sort_dir ?? 'asc')
                ->paginate(20)
                ->withQueryString()
        ));

        return Inertia::render('Todos/Index', [
            'todos' => $todos,
            'members' => $members,
            'categories' => $family->getTodoCategories(),
            'filters' => $request->only(['search', 'status', 'priority', 'category', 'assigned_to', 'sort_by', 'sort_dir']),
        ]);
    }

    public function store(StoreTodoRequest $request): RedirectResponse
    {
        $this->authorize('create', Todo::class);

        $todo = Todo::create(array_merge($request->validated(), [
            'family_id' => $request->user()->family_id,
            'created_by' => $request->user()->id,
        ]));

        $this->syncToGoogleCalendar($todo);

        return back();
    }

    public function update(UpdateTodoRequest $request, Todo $todo): RedirectResponse
    {
        $this->authorize('update', $todo);

        $todo->update($request->validated());
        $todo->refresh();

        $this->syncToGoogleCalendar($todo);

        return back();
    }

    public function destroy(Request $request, Todo $todo): RedirectResponse
    {
        $this->authorize('delete', $todo);

        $todo->delete();

        return back();
    }

    private function syncToGoogleCalendar(Todo $todo): void
    {
        if (! $todo->assigned_to || ! $todo->due_date) {
            return;
        }

        /** @var User|null $assignee */
        $assignee = User::find($todo->assigned_to);

        if (! $assignee?->hasGoogleCalendarConnected()) {
            return;
        }

        $start = $todo->due_date->toIso8601String();
        $end = $todo->due_date->addHour()->toIso8601String();

        SyncItemToGoogleCalendar::dispatch($assignee, [
            'summary' => $todo->title,
            'description' => $todo->description ?? '',
            'start' => $start,
            'end' => $end,
        ]);
    }
}
