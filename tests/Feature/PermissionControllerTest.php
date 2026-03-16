<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionControllerTest extends TestCase
{
    use RefreshDatabase;

    // ── edit (GET) ─────────────────────────────────────────────────────────────

    public function test_guests_cannot_view_permissions_page(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->get(route('settings.permissions.edit', $user))->assertRedirect(route('login'));
    }

    public function test_admin_can_view_permissions_page_for_family_member(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->asMemberOf($family)->create();

        $this->actingAs($admin)
            ->get(route('settings.permissions.edit', $member))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('settings/MemberPermissions')
                ->where('member.id', $member->id)
                ->has('member.permissionGroups')
            );
    }

    public function test_non_admin_cannot_view_permissions_page(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->asMemberOf($family)->create();

        $this->actingAs($member)
            ->get(route('settings.permissions.edit', $admin))
            ->assertForbidden();
    }

    // ── update (PUT) ───────────────────────────────────────────────────────────

    public function test_admin_can_grant_permission_to_family_member(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $child = User::factory()->asChildOf($family)->create(['name' => 'Emma']);

        $this->assertFalse($child->hasPermissionTo('create-todos'));

        $this->actingAs($admin)
            ->put(route('settings.permissions.update', $child), [
                'permissions' => ['create-todos'],
            ])
            ->assertRedirect();

        $this->assertTrue($child->fresh()->hasPermissionTo('create-todos'));
    }

    public function test_admin_can_revoke_permission_from_family_member(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->asMemberOf($family)->create();

        $member->givePermissionTo('create-todos');
        $this->assertTrue($member->hasPermissionTo('create-todos'));

        $this->actingAs($admin)
            ->put(route('settings.permissions.update', $member), [
                'permissions' => [],
            ])
            ->assertRedirect();

        $this->assertFalse($member->fresh()->hasDirectPermission('create-todos'));
    }

    public function test_non_admin_cannot_update_permissions(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->asMemberOf($family)->create();

        $this->actingAs($member)
            ->put(route('settings.permissions.update', $admin), [
                'permissions' => ['manage-family'],
            ])
            ->assertForbidden();
    }

    public function test_permissions_update_rejects_unknown_permission_names(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->asMemberOf($family)->create();

        $this->actingAs($admin)
            ->put(route('settings.permissions.update', $member), [
                'permissions' => ['nuke-everything'],
            ])
            ->assertSessionHasErrors('permissions.0');
    }

    // ── child permission override ──────────────────────────────────────────────

    public function test_child_without_create_todos_permission_cannot_create_todo(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $child = User::factory()->asChildOf($family)->create(['name' => 'Emma']);

        $this->actingAs($child)
            ->post(route('todos.store'), [
                'title' => 'My Todo',
                'category' => 'personal',
                'priority' => 'medium',
                'status' => 'pending',
            ])
            ->assertForbidden();
    }

    public function test_child_with_create_todos_permission_can_create_todo(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $child = User::factory()->asChildOf($family)->create(['name' => 'Emma']);
        $child->givePermissionTo('create-todos');

        $this->actingAs($child)
            ->post(route('todos.store'), [
                'title' => 'My Todo',
                'category' => 'personal',
                'priority' => 'medium',
                'status' => 'pending',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('todos', [
            'family_id' => $family->id,
            'title' => 'My Todo',
        ]);
    }

    public function test_permissions_update_sets_only_submitted_direct_permissions(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->asMemberOf($family)->create();

        $this->actingAs($admin)
            ->put(route('settings.permissions.update', $member), [
                'permissions' => ['view-todos', 'create-todos'],
            ])
            ->assertRedirect();

        $this->assertTrue($member->fresh()->hasDirectPermission('view-todos'));
        $this->assertTrue($member->fresh()->hasDirectPermission('create-todos'));
        $this->assertFalse($member->fresh()->hasDirectPermission('delete-todos'));
    }
}
