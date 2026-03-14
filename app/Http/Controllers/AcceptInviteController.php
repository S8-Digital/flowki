<?php

namespace App\Http\Controllers;

use App\Http\Requests\AcceptInviteRequest;
use App\Models\Invitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
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
        $invitation = Invitation::where('token', $token)
            ->whereNull('accepted_at')
            ->with('user', 'family')
            ->first();

        if (! $invitation) {
            return redirect()->route('home')->with('error', 'This invitation link is invalid or has already been used.');
        }

        $user = $invitation->user;

        $user->update([
            'name' => $request->name,
            'password' => Hash::make($request->password),
            'email_verified_at' => now(),
        ]);

        $invitation->update(['accepted_at' => now()]);

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
