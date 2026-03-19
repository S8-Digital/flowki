<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberProfileController extends Controller
{
    /**
     * Show the profile settings page for the given family member.
     */
    public function edit(Request $request, User $user): Response
    {
        $family = $request->user()->family()->firstOrFail();

        $this->authorize('manageMembers', $family);

        abort_unless($family->members()->where('user_id', $user->id)->exists(), 404);

        return Inertia::render('settings/MemberProfile', [
            'member' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->getRoleNames()->first(),
                'profile_color' => $user->profile_color,
            ],
        ]);
    }
}
