<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdatePermissionRequest;
use App\Http\Resources\Settings\MemberPermissionResource;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Show the permission management page for the given family member.
     */
    public function edit(Request $request, User $user): Response
    {
        $family = $request->user()->family()->firstOrFail();

        $this->authorize('manageMembers', $family);

        abort_unless($family->members()->where('user_id', $user->id)->exists(), 404);

        return Inertia::render('settings/MemberPermissions', [
            'member' => (new MemberPermissionResource($user))->resolve(),
        ]);
    }

    /**
     * Update the direct user-level permissions for the given family member.
     */
    public function update(UpdatePermissionRequest $request, User $user): RedirectResponse
    {
        $family = $request->user()->family()->firstOrFail();

        $this->authorize('manageMembers', $family);

        abort_unless($family->members()->where('user_id', $user->id)->exists(), 404);

        $allPermissionNames = collect(RolePermissionSeeder::PERMISSIONS)->flatten()->all();
        $allPermissions = Permission::whereIn('name', $allPermissionNames)->get();
        $grantedNames = $request->validated('permissions');

        foreach ($allPermissions as $permission) {
            if (in_array($permission->name, $grantedNames, true)) {
                $user->givePermissionTo($permission);
            } else {
                $user->revokePermissionTo($permission);
            }
        }

        return back()->with('status', 'permissions-updated');
    }
}
