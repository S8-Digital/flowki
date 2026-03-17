<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('profile.edit'));

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete(route('profile.destroy'), [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('home'));

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from(route('profile.edit'))
            ->delete(route('profile.destroy'), [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect(route('profile.edit'));

        $this->assertNotNull($user->fresh());
    }

    public function test_profile_color_can_be_updated()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => $user->name,
                'email' => $user->email,
                'profile_color' => '#ff6600',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $this->assertSame('#ff6600', $user->refresh()->profile_color);
    }

    public function test_profile_color_must_be_valid_hex()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from(route('profile.edit'))
            ->patch(route('profile.update'), [
                'name' => $user->name,
                'email' => $user->email,
                'profile_color' => 'not-a-color',
            ]);

        $response->assertSessionHasErrors('profile_color');
    }

    public function test_profile_color_can_be_cleared()
    {
        $user = User::factory()->create(['profile_color' => '#ff6600']);

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'name' => $user->name,
                'email' => $user->email,
                'profile_color' => null,
            ]);

        $response->assertSessionHasNoErrors();
        $this->assertNull($user->refresh()->profile_color);
    }

    public function test_admin_can_update_another_members_color()
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->asMemberOf($family)->create();

        $response = $this
            ->actingAs($admin)
            ->patch(route('settings.members.color.update', $member), [
                'profile_color' => '#3b82f6',
            ]);

        $response->assertRedirect();
        $this->assertSame('#3b82f6', $member->refresh()->profile_color);
    }

    public function test_non_admin_cannot_update_another_members_color()
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->asMemberOf($family)->create();

        $response = $this
            ->actingAs($member)
            ->patch(route('settings.members.color.update', $admin), [
                'profile_color' => '#3b82f6',
            ]);

        $response->assertForbidden();
    }

    public function test_admin_color_update_rejects_invalid_hex()
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->asMemberOf($family)->create();

        $response = $this
            ->actingAs($admin)
            ->from(route('settings.permissions.edit', $member))
            ->patch(route('settings.members.color.update', $member), [
                'profile_color' => 'red',
            ]);

        $response->assertSessionHasErrors('profile_color');
    }
}
