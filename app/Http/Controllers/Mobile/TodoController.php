<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\TodoResource;
use App\Models\Todo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class TodoController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Todo::class);

        $todos = Todo::query()
            ->forFamily($request->user()->family_id)
            ->with(['assignee:id,name,profile_color', 'creator:id,name'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderBy('due_date', 'asc')
            ->get();

        return TodoResource::collection($todos);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Todo::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'status' => ['nullable', 'string'],
            'priority' => ['nullable', 'string'],
            'category' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'assigned_to' => [
                'nullable', 'integer',
                Rule::exists('users', 'id')->where('family_id', $request->user()->family_id),
            ],
        ]);

        $todo = Todo::create(array_merge($validated, [
            'family_id' => $request->user()->family_id,
            'created_by' => $request->user()->id,
            'status' => $validated['status'] ?? 'pending',
        ]));

        return (new TodoResource($todo->load(['assignee', 'creator'])))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, Todo $todo): JsonResponse
    {
        $this->authorize('update', $todo);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'status' => ['sometimes', 'string'],
            'priority' => ['nullable', 'string'],
            'category' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'assigned_to' => [
                'nullable', 'integer',
                Rule::exists('users', 'id')->where('family_id', $request->user()->family_id),
            ],
        ]);

        $todo->update($validated);

        return (new TodoResource($todo->fresh(['assignee', 'creator'])))->response();
    }

    public function destroy(Todo $todo): JsonResponse
    {
        $this->authorize('delete', $todo);

        $todo->delete();

        return response()->json(null, 204);
    }
}
