<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/Profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'hasGoogleCalendarConnected' => $user->hasGoogleCalendarConnected(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     *
     * Users with a password must confirm it. OAuth-only users confirm by
     * typing their email address instead (Apple App Store requirement).
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasPasswordSet()) {
            $request->validate([
                'password' => ['required', 'current_password'],
            ]);
        } else {
            $request->validate([
                'email' => ['required', 'string', function ($attribute, $value, $fail) use ($user) {
                    if (strtolower(trim($value)) !== strtolower($user->email)) {
                        $fail('The email address does not match your account.');
                    }
                }],
            ]);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
