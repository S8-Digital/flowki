<?php

namespace App\Http\Controllers;

use App\Http\Requests\AcceptInviteRequest;
use App\Models\Invitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AcceptInviteController extends Controller
{
    public function show(string $token): Response|RedirectResponse
    {
        $invitation = Invitation::where('token', $token)
            ->whereNull('accepted_at')
            ->with('family')
            ->first();

        if (! $invitation) {
            return redirect()->route('home')->with('error', 'This invitation link is invalid or has already been used.');
        }

        return Inertia::render('auth/AcceptInvite', [
            'token' => $token,
            'email' => $invitation->email,
            'familyName' => $invitation->family->name,
            'role' => $invitation->role->label(),
        ]);
    }

    public function store(AcceptInviteRequest $request, string $token): RedirectResponse
    {
        return DB::transaction(function () use ($request, $token) {
            // Lock the invitation row inside the transaction to prevent concurrent double-submissions
            // from both reading the same pending invitation and applying the membership twice.
            $invitation = Invitation::where('token', $token)
                ->whereNull('accepted_at')
                ->lockForUpdate()
                ->first();

            if (! $invitation) {
                return redirect()->route('home')->with('error', 'This invitation link is invalid or has already been used.');
            }

            $invitation->load('user', 'family');

            $user = $invitation->user;

            $user->update([
                'name' => $request->name,
                'password' => Hash::make($request->password),
                'email_verified_at' => now(),
                'family_id' => $invitation->family_id,
            ]);

            // syncWithoutDetaching is idempotent — it won't throw a duplicate-key error if the
            // pivot row already exists (e.g. from a previous partial acceptance attempt).
            $invitation->family->members()->syncWithoutDetaching([$user->id => ['role' => $invitation->role->value]]);
            $user->syncRoles([ucfirst($invitation->role->value)]);

            $invitation->update(['accepted_at' => now()]);

            Auth::login($user);

            return redirect()->route('dashboard');
        });
    }
}
