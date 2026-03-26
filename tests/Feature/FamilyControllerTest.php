<?php

namespace Tests\Feature;

use App\Enums\FamilyRole;
use App\Mail\FamilyInvitationMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class FamilyControllerTest extends TestCase
{
    use RefreshDatabase;

    // ── create / store ─────────────────────────────────────────────────────────

    public function test_guests_cannot_view_family_create(): void
    {
        $this->get(route('family.create'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_family_create(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user)->get(route('family.create'))->assertOk();
    }

    public function test_user_can_create_family(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user)
            ->post(route('family.store'), ['name' => 'The Smiths'])
            ->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('families', ['name' => 'The Smiths', 'created_by' => $user->id]);
        $this->assertNotNull($user->fresh()->family_id);
    }

    public function test_family_store_validates_required_name(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user)
            ->post(route('family.store'), [])
            ->assertSessionHasErrors('name');
    }

    public function test_family_store_validates_max_name_length(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user)
            ->post(route('family.store'), ['name' => str_repeat('x', 101)])
            ->assertSessionHasErrors('name');
    }

    // ── join ────────────────────────────────────────────────────────────────────

    public function test_user_can_join_family_with_valid_invite_code(): void
    {
        $owner = User::factory()->withFamily()->create();
        $family = $owner->family;

        $joiner = User::factory()->create(['family_id' => null]);

        $this->actingAs($joiner)
            ->post(route('family.join.store'), ['invite_code' => $family->invite_code])
            ->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('family_user', ['user_id' => $joiner->id, 'family_id' => $family->id]);
        $this->assertEquals($family->id, $joiner->fresh()->family_id);
    }

    public function test_join_family_requires_valid_invite_code(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user)
            ->post(route('family.join.store'), ['invite_code' => 'INVALID1'])
            ->assertSessionHasErrors('invite_code');
    }

    public function test_join_family_validates_code_length(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user)
            ->post(route('family.join.store'), ['invite_code' => 'SHORT'])
            ->assertSessionHasErrors('invite_code');
    }

    public function test_user_already_in_family_cannot_join_another(): void
    {
        $owner = User::factory()->withFamily()->create();
        $another = User::factory()->withFamily()->create();
        $family = $another->family;

        $this->actingAs($owner)
            ->post(route('family.join.store'), ['invite_code' => $family->invite_code])
            ->assertSessionHasErrors('invite_code');
    }

    // ── show ────────────────────────────────────────────────────────────────────

    public function test_family_member_can_view_family(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)->get(route('family.show'))->assertOk();
    }

    public function test_family_show_passes_roles_without_child_role(): void
    {
        $user = User::factory()->withFamily()->create();

        $response = $this->actingAs($user)->get(route('family.show'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Family/Show')
            ->has('roles', 3)
            ->where('roles.0.value', FamilyRole::Admin->value)
            ->where('roles.0.label', FamilyRole::Admin->label())
            ->where('roles.1.value', FamilyRole::Member->value)
            ->where('roles.2.value', FamilyRole::Guest->value)
            ->missing('roles.3')
        );
    }

    public function test_user_without_family_cannot_view_family(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user)->get(route('family.show'))->assertStatus(404);
    }

    // ── remove member ───────────────────────────────────────────────────────────

    public function test_admin_can_remove_member_from_family(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->create(['family_id' => $family->id]);
        $family->members()->attach($member->id, ['role' => FamilyRole::Member->value]);

        $this->actingAs($admin)
            ->delete(route('family.members.remove', [$family, $member->id]))
            ->assertRedirect();

        $this->assertDatabaseMissing('family_user', ['user_id' => $member->id, 'family_id' => $family->id]);
    }

    public function test_non_admin_cannot_remove_member(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->create(['family_id' => $family->id]);
        $family->members()->attach($member->id, ['role' => FamilyRole::Member->value]);

        $this->actingAs($member)
            ->delete(route('family.members.remove', [$family, $admin->id]))
            ->assertForbidden();
    }

    // ── update family name ──────────────────────────────────────────────────────

    public function test_admin_can_rename_family(): void
    {
        $admin = User::factory()->withFamily()->create();

        $this->actingAs($admin)
            ->patch(route('family.update'), ['name' => 'New Family Name'])
            ->assertRedirect();

        $this->assertDatabaseHas('families', ['id' => $admin->family->id, 'name' => 'New Family Name']);
    }

    public function test_non_admin_cannot_rename_family(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->create(['family_id' => $family->id]);
        $family->members()->attach($member->id, ['role' => FamilyRole::Member->value]);

        $this->actingAs($member)
            ->patch(route('family.update'), ['name' => 'Hijacked Name'])
            ->assertForbidden();
    }

    public function test_family_update_requires_name(): void
    {
        $admin = User::factory()->withFamily()->create();

        $this->actingAs($admin)
            ->patch(route('family.update'), ['name' => ''])
            ->assertSessionHasErrors('name');
    }

    // ── invite member ───────────────────────────────────────────────────────────

    public function test_admin_can_invite_new_user_by_email(): void
    {
        Mail::fake();

        $admin = User::factory()->withFamily()->create();

        $this->actingAs($admin)
            ->post(route('family.members.invite'), ['email' => 'newperson@example.com', 'role' => FamilyRole::Member->value])
            ->assertRedirect();

        $this->assertDatabaseHas('invitations', [
            'email' => 'newperson@example.com',
            'family_id' => $admin->family->id,
        ]);

        $this->assertDatabaseHas('users', ['email' => 'newperson@example.com']);

        Mail::assertQueued(FamilyInvitationMail::class, fn ($mail) => $mail->hasTo('newperson@example.com'));
    }

    public function test_admin_can_invite_existing_user_without_family(): void
    {
        Mail::fake();

        $admin = User::factory()->withFamily()->create();
        $existing = User::factory()->create(['family_id' => null]);

        $this->actingAs($admin)
            ->post(route('family.members.invite'), ['email' => $existing->email, 'role' => FamilyRole::Member->value])
            ->assertRedirect();

        $this->assertDatabaseHas('family_user', [
            'user_id' => $existing->id,
            'family_id' => $admin->family->id,
        ]);

        Mail::assertQueued(FamilyInvitationMail::class);
    }

    public function test_invite_rejects_user_already_in_another_family(): void
    {
        Mail::fake();

        $admin = User::factory()->withFamily()->create();
        $taken = User::factory()->withFamily()->create();

        $this->actingAs($admin)
            ->post(route('family.members.invite'), ['email' => $taken->email, 'role' => FamilyRole::Member->value])
            ->assertSessionHasErrors('email');

        Mail::assertNotQueued(FamilyInvitationMail::class);
    }

    public function test_invite_rejects_user_already_in_this_family(): void
    {
        Mail::fake();

        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $existing = User::factory()->create(['family_id' => $family->id]);
        $family->members()->attach($existing->id, ['role' => FamilyRole::Member->value]);

        $this->actingAs($admin)
            ->post(route('family.members.invite'), ['email' => $existing->email, 'role' => FamilyRole::Member->value])
            ->assertSessionHasErrors(['email' => 'This person is already a member of your family.']);

        $this->assertDatabaseMissing('invitations', ['email' => $existing->email, 'family_id' => $family->id]);
        Mail::assertNotQueued(FamilyInvitationMail::class);
    }

    public function test_invite_rejects_user_in_another_family_not_this_one(): void
    {
        Mail::fake();

        $admin = User::factory()->withFamily()->create();
        $otherAdmin = User::factory()->withFamily()->create();

        $this->actingAs($admin)
            ->post(route('family.members.invite'), ['email' => $otherAdmin->email, 'role' => FamilyRole::Member->value])
            ->assertSessionHasErrors(['email' => 'This person already belongs to a family. They must leave their current family first.']);

        $this->assertDatabaseMissing('invitations', ['email' => $otherAdmin->email, 'family_id' => $admin->family->id]);
        Mail::assertNotQueued(FamilyInvitationMail::class);
    }

    public function test_invite_rejects_child_role(): void
    {
        Mail::fake();

        $admin = User::factory()->withFamily()->create();

        $this->actingAs($admin)
            ->post(route('family.members.invite'), ['email' => 'child@example.com', 'role' => 'child'])
            ->assertSessionHasErrors('role');
    }

    public function test_non_admin_cannot_invite_member(): void
    {
        Mail::fake();

        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->create(['family_id' => $family->id]);
        $family->members()->attach($member->id, ['role' => FamilyRole::Member->value]);

        $this->actingAs($member)
            ->post(route('family.members.invite'), ['email' => 'outsider@example.com', 'role' => FamilyRole::Member->value])
            ->assertForbidden();
    }

    // ── add child ───────────────────────────────────────────────────────────────

    public function test_admin_can_add_child(): void
    {
        $admin = User::factory()->withFamily()->create();

        $this->actingAs($admin)
            ->post(route('family.children.add'), ['name' => 'Emma'])
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['name' => 'Emma', 'email' => null]);
        $this->assertDatabaseHas('family_user', [
            'family_id' => $admin->family->id,
            'role' => FamilyRole::Child->value,
        ]);
    }

    public function test_add_child_requires_name(): void
    {
        $admin = User::factory()->withFamily()->create();

        $this->actingAs($admin)
            ->post(route('family.children.add'), [])
            ->assertSessionHasErrors('name');
    }

    public function test_non_admin_cannot_add_child(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->create(['family_id' => $family->id]);
        $family->members()->attach($member->id, ['role' => FamilyRole::Member->value]);

        $this->actingAs($member)
            ->post(route('family.children.add'), ['name' => 'Emma'])
            ->assertForbidden();
    }
}
