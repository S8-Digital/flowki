<?php

namespace Tests\Feature;

use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RolePermissionSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_creates_all_expected_permissions(): void
    {
        $allPermissions = collect(RolePermissionSeeder::PERMISSIONS)->flatten()->all();

        foreach ($allPermissions as $permission) {
            $this->assertDatabaseHas('permissions', ['name' => $permission]);
        }
    }

    public function test_seeder_creates_all_four_roles(): void
    {
        foreach (['Admin', 'Member', 'Guest', 'Child'] as $role) {
            $this->assertDatabaseHas('roles', ['name' => $role]);
        }
    }

    public function test_admin_role_has_all_permissions(): void
    {
        $admin = Role::findByName('Admin');
        $allPermissions = collect(RolePermissionSeeder::PERMISSIONS)->flatten()->all();

        foreach ($allPermissions as $permission) {
            $this->assertTrue(
                $admin->hasPermissionTo($permission),
                "Admin role is missing permission: {$permission}"
            );
        }
    }

    public function test_member_role_has_content_permissions_but_not_admin_permissions(): void
    {
        $member = Role::findByName('Member');

        $shouldHave = [
            'view-todos', 'create-todos', 'edit-todos', 'delete-todos',
            'view-chores', 'create-chores', 'edit-chores', 'delete-chores', 'complete-chores',
            'view-events', 'create-events', 'edit-events', 'delete-events',
            'view-shopping', 'create-shopping', 'edit-shopping', 'delete-shopping', 'create-shopping-items',
            'view-recipes', 'create-recipes', 'edit-recipes', 'delete-recipes',
            'view-members',
            'manage-dashboard',
        ];

        $shouldNotHave = ['manage-members', 'manage-family'];

        foreach ($shouldHave as $permission) {
            $this->assertTrue(
                $member->hasPermissionTo($permission),
                "Member role is missing expected permission: {$permission}"
            );
        }

        foreach ($shouldNotHave as $permission) {
            $this->assertFalse(
                $member->hasPermissionTo($permission),
                "Member role should not have permission: {$permission}"
            );
        }
    }

    public function test_guest_role_has_only_view_permissions(): void
    {
        $guest = Role::findByName('Guest');

        $viewPermissions = ['view-todos', 'view-chores', 'view-events', 'view-shopping', 'view-recipes', 'view-members'];

        foreach ($viewPermissions as $permission) {
            $this->assertTrue(
                $guest->hasPermissionTo($permission),
                "Guest role is missing view permission: {$permission}"
            );
        }

        $disallowed = ['create-todos', 'edit-todos', 'delete-todos', 'manage-members', 'manage-family'];

        foreach ($disallowed as $permission) {
            $this->assertFalse(
                $guest->hasPermissionTo($permission),
                "Guest role should not have permission: {$permission}"
            );
        }
    }

    public function test_child_role_has_no_permissions(): void
    {
        $child = Role::findByName('Child');

        $allPermissions = collect(RolePermissionSeeder::PERMISSIONS)->flatten()->all();

        foreach ($allPermissions as $permission) {
            $this->assertFalse(
                $child->hasPermissionTo($permission),
                "Child role should not have permission: {$permission}"
            );
        }
    }

    public function test_seeder_is_idempotent(): void
    {
        // Run the seeder a second time (first run is in TestCase::setUp)
        $this->seed(RolePermissionSeeder::class);

        $permissionCount = Permission::count();
        $roleCount = Role::count();

        $allPermissions = collect(RolePermissionSeeder::PERMISSIONS)->flatten()->all();

        $this->assertEquals(count($allPermissions), $permissionCount);
        $this->assertEquals(4, $roleCount);
    }
}
