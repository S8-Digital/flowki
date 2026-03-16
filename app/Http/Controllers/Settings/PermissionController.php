<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
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

        $allPermissions = collect(RolePermissionSeeder::PERMISSIONS)
            ->map(fn (array $perms, string $group) => [
                'group' => $group,
                'permissions' => collect($perms)->map(fn (string $name) => [
                    'name' => $name,
                    'granted' => $user->hasPermissionTo($name),
                ])->values()->all(),
            ])
            ->values()
            ->all();

        return Inertia::render('settings/MemberPermissions', [
            'member' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->getRoleNames()->first(),
            ],
            'permissionGroups' => $allPermissions,
        ]);
    }

    /**
     * Update the direct user-level permissions for the given family member.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $family = $request->user()->family()->firstOrFail();

        $this->authorize('manageMembers', $family);

        abort_unless($family->members()->where('user_id', $user->id)->exists(), 404);

        $allPermissionNames = collect(RolePermissionSeeder::PERMISSIONS)->flatten()->all();

        $validated = $request->validate([
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string', 'in:' . implode(',', $allPermissionNames)],
        ]);

        $allPermissions = Permission::whereIn('name', $allPermissionNames)->get();
        $grantedNames = $validated['permissions'];

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
