<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile;

use App\Enums\FamilyRole;
use App\Http\Controllers\Controller;
use App\Models\Family;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FamilyController extends Controller
{
    /**
     * Return the authenticated user's family with members.
     */
    public function show(Request $request): JsonResponse
    {
        $family = $request->user()->family()->with('members')->first();

        if (! $family) {
            return response()->json(['message' => 'No family found.'], 404);
        }

        return response()->json($this->familyResource($family));
    }

    /**
     * Create a new family. The creating user becomes the admin.
     */
    public function store(Request $request): JsonResponse
    {
        if ($request->user()->family_id !== null) {
            return response()->json(['message' => 'You already belong to a family.'], 422);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $family = Family::create([
            'name' => $validated['name'],
            'created_by' => $request->user()->id,
        ]);

        $family->members()->attach($request->user()->id, ['role' => FamilyRole::Admin->value]);
        $request->user()->update(['family_id' => $family->id]);
        $request->user()->syncRoles(['Admin']);

        return response()->json($this->familyResource($family->load('members')), 201);
    }

    /**
     * Join an existing family using an invite code.
     */
    public function join(Request $request): JsonResponse
    {
        if ($request->user()->family_id !== null) {
            return response()->json(['message' => 'You already belong to a family.'], 422);
        }

        $validated = $request->validate([
            'invite_code' => ['required', 'string'],
        ]);

        $family = Family::where('invite_code', strtoupper($validated['invite_code']))->first();

        if (! $family) {
            return response()->json(['message' => 'Invalid invite code.'], 422);
        }

        $family->members()->attach($request->user()->id, ['role' => FamilyRole::Member->value]);
        $request->user()->update(['family_id' => $family->id]);
        $request->user()->syncRoles(['Member']);

        return response()->json($this->familyResource($family->load('members')));
    }

    /**
     * @return array<string, mixed>
     */
    private function familyResource(Family $family): array
    {
        return [
            'id' => $family->id,
            'name' => $family->name,
            'invite_code' => $family->invite_code,
            'location_name' => $family->location_name,
            'latitude' => $family->latitude,
            'longitude' => $family->longitude,
            'members' => $family->members->map(fn ($member) => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'profile_color' => $member->profile_color,
                'role' => $member->pivot->role ?? FamilyRole::Member->value,
            ])->values()->all(),
        ];
    }
}
