<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'manage-todos',
            'manage-chores',
            'manage-events',
            'manage-shopping',
            'manage-recipes',
            'manage-members',
            'manage-family',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $admin = Role::firstOrCreate(['name' => 'Admin']);
        $member = Role::firstOrCreate(['name' => 'Member']);
        Role::firstOrCreate(['name' => 'Guest']);
        Role::firstOrCreate(['name' => 'Child']);

        $admin->syncPermissions($permissions);

        $member->syncPermissions([
            'manage-todos',
            'manage-chores',
            'manage-events',
            'manage-shopping',
            'manage-recipes',
        ]);
    }
}
