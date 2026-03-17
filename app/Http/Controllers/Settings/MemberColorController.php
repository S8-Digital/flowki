<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MemberColorController extends Controller
{
    /**
     * Update the profile colour for a family member (admin-only).
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $family = $request->user()->family()->firstOrFail();

        $this->authorize('manageMembers', $family);

        abort_unless($family->members()->where('user_id', $user->id)->exists(), 404);

        $validated = $request->validate([
            'profile_color' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        $user->update(['profile_color' => $validated['profile_color'] ?? null]);

        return back()->with('status', 'color-updated');
    }
}
