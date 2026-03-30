<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * All granular permissions grouped by feature.
     *
     * @var array<string, list<string>>
     */
    public const PERMISSIONS = [
        'todos' => ['view-todos', 'create-todos', 'edit-todos', 'delete-todos'],
        'chores' => ['view-chores', 'create-chores', 'edit-chores', 'delete-chores', 'complete-chores'],
        'events' => ['view-events', 'create-events', 'edit-events', 'delete-events'],
        'shopping' => ['view-shopping', 'create-shopping', 'edit-shopping', 'delete-shopping', 'create-shopping-items'],
        'recipes' => ['view-recipes', 'create-recipes', 'edit-recipes', 'delete-recipes'],
        'meals' => ['view-meals', 'create-meals', 'edit-meals', 'delete-meals'],
        'members' => ['view-members', 'manage-members'],
        'family' => ['manage-family'],
        'dashboard' => ['manage-dashboard'],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $allPermissions = collect(self::PERMISSIONS)->flatten()->all();

        foreach ($allPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $admin = Role::firstOrCreate(['name' => 'Admin']);
        $member = Role::firstOrCreate(['name' => 'Member']);
        $guest = Role::firstOrCreate(['name' => 'Guest']);
        Role::firstOrCreate(['name' => 'Child']);

        $admin->syncPermissions($allPermissions);

        $member->syncPermissions([
            'view-todos', 'create-todos', 'edit-todos', 'delete-todos',
            'view-chores', 'create-chores', 'edit-chores', 'delete-chores', 'complete-chores',
            'view-events', 'create-events', 'edit-events', 'delete-events',
            'view-shopping', 'create-shopping', 'edit-shopping', 'delete-shopping', 'create-shopping-items',
            'view-recipes', 'create-recipes', 'edit-recipes', 'delete-recipes',
            'view-meals', 'create-meals', 'edit-meals', 'delete-meals',
            'view-members',
            'manage-dashboard',
        ]);

        $guest->syncPermissions([
            'view-todos',
            'view-chores',
            'view-events',
            'view-shopping',
            'view-recipes',
            'view-meals',
            'view-members',
        ]);
    }
}
