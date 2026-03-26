<?php

namespace Tests\Feature;

use App\Enums\FamilyRole;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcceptInviteControllerTest extends TestCase
{
    use RefreshDatabase;

    // ── show ────────────────────────────────────────────────────────────────────

    public function test_valid_invite_token_shows_accept_page(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;

        // Placeholder user created on invite — no family_id yet
        $invitedUser = User::factory()->create([
            'family_id' => null,
            'email_verified_at' => null,
            'password' => null,
            'name' => '',
        ]);

        $invitation = Invitation::factory()->forUser($invitedUser)->create([
            'family_id' => $family->id,
            'role' => FamilyRole::Member,
        ]);

        $this->get(route('invite.show', $invitation->token))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('auth/AcceptInvite')
                ->where('email', $invitedUser->email)
                ->where('familyName', $family->name)
            );
    }

    public function test_invalid_token_redirects_to_home(): void
    {
        $this->get(route('invite.show', 'invalid-token'))
            ->assertRedirect(route('home'));
    }

    public function test_already_accepted_token_redirects_to_home(): void
    {
        $admin = User::factory()->withFamily()->create();
        $invitation = Invitation::factory()->accepted()->create([
            'family_id' => $admin->family->id,
        ]);

        $this->get(route('invite.show', $invitation->token))
            ->assertRedirect(route('home'));
    }

    // ── store ────────────────────────────────────────────────────────────────────

    public function test_user_can_accept_invitation_and_is_logged_in(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;

        // Invited user: placeholder created on invite — no family_id, no pivot entry
        $invitedUser = User::factory()->create([
            'family_id' => null,
            'email_verified_at' => null,
            'password' => null,
            'name' => '',
        ]);

        $invitation = Invitation::factory()->forUser($invitedUser)->create([
            'family_id' => $family->id,
            'role' => FamilyRole::Member,
        ]);

        $this->post(route('invite.store', $invitation->token), [
            'name' => 'Jane Doe',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertRedirect(route('dashboard'));

        $fresh = $invitedUser->fresh();
        $this->assertEquals('Jane Doe', $fresh->name);
        $this->assertNotNull($fresh->email_verified_at);
        $this->assertNotNull($fresh->password);
        // family_id and pivot entry now set on acceptance
        $this->assertEquals($family->id, $fresh->family_id);
        $this->assertDatabaseHas('family_user', ['user_id' => $invitedUser->id, 'family_id' => $family->id]);
        $this->assertNotNull(Invitation::find($invitation->id)->accepted_at);
        $this->assertAuthenticatedAs($fresh);
    }

    public function test_accept_requires_name(): void
    {
        $admin = User::factory()->withFamily()->create();
        $invitedUser = User::factory()->create([
            'family_id' => null,
            'email_verified_at' => null,
            'password' => null,
        ]);
        $invitation = Invitation::factory()->forUser($invitedUser)->create([
            'family_id' => $admin->family->id,
        ]);

        $this->post(route('invite.store', $invitation->token), [
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertSessionHasErrors('name');
    }

    public function test_accept_requires_matching_passwords(): void
    {
        $admin = User::factory()->withFamily()->create();
        $invitedUser = User::factory()->create([
            'family_id' => null,
            'email_verified_at' => null,
            'password' => null,
        ]);
        $invitation = Invitation::factory()->forUser($invitedUser)->create([
            'family_id' => $admin->family->id,
        ]);

        $this->post(route('invite.store', $invitation->token), [
            'name' => 'Jane',
            'password' => 'Password123!',
            'password_confirmation' => 'Different456!',
        ])->assertSessionHasErrors('password');
    }

    public function test_expired_token_redirects_to_home_on_store(): void
    {
        $this->post(route('invite.store', 'bad-token'), [
            'name' => 'Jane',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertRedirect(route('home'));
    }
}
