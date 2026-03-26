<?php

namespace Tests\Feature\Mobile;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileControllerTest extends TestCase
{
    use RefreshDatabase;

    // ── update ─────────────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_update_profile(): void
    {
        $this->patchJson(route('mobile.profile.update'), ['name' => 'New Name'])->assertUnauthorized();
    }

    public function test_user_can_update_their_name(): void
    {
        $user = User::factory()->withFamily()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.profile.update'), ['name' => 'New Name']);

        $response->assertOk()
            ->assertJsonFragment(['name' => 'New Name']);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'New Name']);
    }

    public function test_user_can_update_their_email(): void
    {
        $user = User::factory()->withFamily()->create(['email' => 'old@example.com']);

        $response = $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.profile.update'), ['email' => 'new@example.com']);

        $response->assertOk()
            ->assertJsonFragment(['email' => 'new@example.com']);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => 'new@example.com']);
    }

    public function test_changing_email_clears_email_verified_at(): void
    {
        $user = User::factory()->withFamily()->create([
            'email' => 'verified@example.com',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.profile.update'), ['email' => 'new@example.com'])
            ->assertOk();

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_keeping_same_email_does_not_clear_verified_at(): void
    {
        $verifiedAt = now();
        $user = User::factory()->withFamily()->create([
            'email' => 'same@example.com',
            'email_verified_at' => $verifiedAt,
        ]);

        $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.profile.update'), ['email' => 'same@example.com'])
            ->assertOk();

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_user_can_update_profile_color(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.profile.update'), ['profile_color' => '#FF5733'])
            ->assertOk()
            ->assertJsonFragment(['profile_color' => '#FF5733']);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'profile_color' => '#FF5733']);
    }

    public function test_email_must_be_unique_when_updating(): void
    {
        $existing = User::factory()->create(['email' => 'taken@example.com']);
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.profile.update'), ['email' => 'taken@example.com'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_profile_response_includes_expected_fields(): void
    {
        $user = User::factory()->withFamily()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.profile.update'), ['name' => $user->name]);

        $response->assertOk()
            ->assertJsonStructure(['id', 'name', 'email', 'profile_color', 'family_id']);
    }

    // ── updatePassword ─────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_update_password(): void
    {
        $this->putJson(route('mobile.profile.password'), [
            'password' => 'NewPassword1!',
            'password_confirmation' => 'NewPassword1!',
        ])->assertUnauthorized();
    }

    public function test_user_can_change_password_with_correct_current_password(): void
    {
        $user = User::factory()->withFamily()->create([
            'password' => Hash::make('CurrentPass1!'),
        ]);

        $this->actingAs($user, 'sanctum')
            ->putJson(route('mobile.profile.password'), [
                'current_password' => 'CurrentPass1!',
                'password' => 'NewPassword1!',
                'password_confirmation' => 'NewPassword1!',
            ])
            ->assertOk()
            ->assertJsonFragment(['message' => 'Password updated.']);

        $this->assertTrue(Hash::check('NewPassword1!', $user->fresh()->password));
    }

    public function test_wrong_current_password_returns_422(): void
    {
        $user = User::factory()->withFamily()->create([
            'password' => Hash::make('CorrectPass1!'),
        ]);

        $this->actingAs($user, 'sanctum')
            ->putJson(route('mobile.profile.password'), [
                'current_password' => 'WrongPass1!',
                'password' => 'NewPassword1!',
                'password_confirmation' => 'NewPassword1!',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('current_password');
    }

    public function test_password_confirmation_must_match(): void
    {
        $user = User::factory()->withFamily()->create([
            'password' => Hash::make('CurrentPass1!'),
        ]);

        $this->actingAs($user, 'sanctum')
            ->putJson(route('mobile.profile.password'), [
                'current_password' => 'CurrentPass1!',
                'password' => 'NewPassword1!',
                'password_confirmation' => 'DifferentPass1!',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    }

    public function test_oauth_user_without_password_can_set_password_without_current(): void
    {
        $user = User::factory()->withFamily()->create(['password' => null]);

        $this->actingAs($user, 'sanctum')
            ->putJson(route('mobile.profile.password'), [
                'password' => 'BrandNew1!',
                'password_confirmation' => 'BrandNew1!',
            ])
            ->assertOk()
            ->assertJsonFragment(['message' => 'Password updated.']);

        $this->assertTrue(Hash::check('BrandNew1!', $user->fresh()->password));
    }

    public function test_password_update_requires_password_field(): void
    {
        $user = User::factory()->withFamily()->create(['password' => null]);

        $this->actingAs($user, 'sanctum')
            ->putJson(route('mobile.profile.password'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    }
}
