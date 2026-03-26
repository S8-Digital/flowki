<?php

namespace App\Http\Controllers;

use App\Enums\FamilyRole;
use App\Http\Requests\Family\AddChildRequest;
use App\Http\Requests\Family\InviteMemberRequest;
use App\Http\Requests\Family\JoinFamilyRequest;
use App\Http\Requests\Family\StoreFamilyRequest;
use App\Http\Requests\Family\UpdateFamilyRequest;
use App\Http\Resources\FamilyResource;
use App\Mail\FamilyInvitationMail;
use App\Models\Family;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FamilyController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Family/Create');
    }

    public function store(StoreFamilyRequest $request): RedirectResponse
    {
        $family = Family::create([
            'name' => $request->name,
            'created_by' => $request->user()->id,
        ]);

        $family->members()->attach($request->user()->id, ['role' => FamilyRole::Admin->value]);
        $request->user()->update(['family_id' => $family->id]);
        $request->user()->syncRoles(['Admin']);

        return redirect()->route('dashboard');
    }

    public function join(): Response
    {
        return Inertia::render('Family/Join');
    }

    public function joinStore(JoinFamilyRequest $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->family_id !== null) {
            return back()->withErrors(['invite_code' => 'You already belong to a family. Leave your current family first.']);
        }

        $family = $request->family();

        $family->members()->attach($user->id, ['role' => FamilyRole::Member->value]);
        $user->update(['family_id' => $family->id]);
        $user->syncRoles(['Member']);

        return redirect()->route('dashboard');
    }

    public function show(Request $request): Response
    {
        $family = $request->user()->family()->with('members')->firstOrFail();

        $this->authorize('view', $family);

        // Backfill: ensure the authenticated user is in the pivot table
        if (! $family->members->contains('id', $request->user()->id)) {
            $family->members()->attach($request->user()->id, ['role' => FamilyRole::Admin->value]);
            $family->load('members');
        }

        // Backfill: generate invite code for families created before auto-generation was added
        if (empty($family->invite_code)) {
            $family->regenerateInviteCode();
        }

        $roles = collect(FamilyRole::cases())
            ->reject(fn (FamilyRole $role) => $role === FamilyRole::Child)
            ->map(fn (FamilyRole $role) => [
                'value' => $role->value,
                'label' => $role->label(),
            ])
            ->values()
            ->toArray();

        return Inertia::render('Family/Show', [
            'family' => (new FamilyResource($family))->resolve(),
            'roles' => $roles,
        ]);
    }

    public function update(UpdateFamilyRequest $request): RedirectResponse
    {
        $family = $request->user()->family()->firstOrFail();

        $this->authorize('update', $family);

        $family->update([
            'name' => $request->name,
            'location_name' => $request->location_name,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        return back();
    }

    public function inviteMember(InviteMemberRequest $request): RedirectResponse
    {
        $family = $request->user()->family()->firstOrFail();

        $this->authorize('manageMembers', $family);

        $existingUser = User::where('email', $request->email)->first();

        if ($existingUser && $family->members()->where('user_id', $existingUser->id)->exists()) {
            return back()->withErrors(['email' => 'This person is already a member of your family.']);
        }

        if ($existingUser && $existingUser->family_id !== null) {
            return back()->withErrors(['email' => 'This person already belongs to a family. They must leave their current family first.']);
        }

        $invitation = DB::transaction(function () use ($request, $family, $existingUser) {
            $invitedUser = $existingUser ?? User::create([
                'name' => '',
                'email' => $request->email,
                'family_id' => $family->id,
            ]);

            if ($existingUser) {
                $invitedUser->update(['family_id' => $family->id]);
            }

            $family->members()->attach($invitedUser->id, ['role' => $request->role]);
            $invitedUser->syncRoles([ucfirst($request->role)]);

            $invitation = Invitation::create([
                'family_id' => $family->id,
                'user_id' => $invitedUser->id,
                'email' => $request->email,
                'role' => $request->role,
                'token' => Str::random(32),
            ]);

            $invitation->load('family');
            Mail::to($request->email)->queue(new FamilyInvitationMail($invitation));

            return $invitation;
        });

        return back();
    }

    public function addChild(AddChildRequest $request): RedirectResponse
    {
        $family = $request->user()->family()->firstOrFail();

        $this->authorize('manageMembers', $family);

        $child = User::create([
            'name' => $request->name,
            'family_id' => $family->id,
            'email_verified_at' => now(),
        ]);

        $family->members()->attach($child->id, ['role' => FamilyRole::Child->value]);
        $child->syncRoles(['Child']);

        return back();
    }

    public function updateMemberRole(Request $request, Family $family, int $userId): RedirectResponse
    {
        $this->authorize('manageMembers', $family);

        $validated = $request->validate([
            'role' => ['required', Rule::enum(FamilyRole::class)],
        ]);

        $family->members()->updateExistingPivot($userId, ['role' => $validated['role']]);

        $member = User::findOrFail($userId);
        $member->syncRoles([ucfirst($validated['role'])]);

        return back();
    }

    public function removeMember(Request $request, Family $family, int $userId): RedirectResponse
    {
        $this->authorize('manageMembers', $family);

        $family->members()->detach($userId);

        return back();
    }
}
