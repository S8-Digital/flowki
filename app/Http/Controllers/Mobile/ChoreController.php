<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChoreResource;
use App\Models\Chore;
use App\Models\ChoreCompletion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class ChoreController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Chore::class);

        $chores = Chore::query()
            ->forFamily($request->user()->family_id)
            ->with(['assignees:id,name,profile_color', 'creator:id,name'])
            ->orderBy('next_due_date', 'asc')
            ->get();

        return ChoreResource::collection($chores);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Chore::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'frequency' => ['nullable', 'string'],
            'next_due_date' => ['nullable', 'date'],
        ]);

        $chore = Chore::create(array_merge($validated, [
            'family_id' => $request->user()->family_id,
            'created_by' => $request->user()->id,
        ]));

        return (new ChoreResource($chore->load(['assignees', 'creator'])))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, Chore $chore): JsonResponse
    {
        $this->authorize('update', $chore);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'frequency' => ['nullable', 'string'],
            'next_due_date' => ['nullable', 'date'],
        ]);

        $chore->update($validated);

        return (new ChoreResource($chore->fresh(['assignees', 'creator'])))->response();
    }

    public function complete(Request $request, Chore $chore): JsonResponse
    {
        $this->authorize('complete', $chore);

        ChoreCompletion::create([
            'chore_id' => $chore->id,
            'completed_by' => $request->user()->id,
            'completed_at' => now(),
        ]);

        return (new ChoreResource($chore->fresh(['assignees', 'creator'])))->response();
    }

    public function destroy(Chore $chore): JsonResponse
    {
        $this->authorize('delete', $chore);

        $chore->delete();

        return response()->json(null, 204);
    }
}
