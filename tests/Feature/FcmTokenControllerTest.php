<?php

namespace Tests\Feature;

use App\Models\FcmToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FcmTokenControllerTest extends TestCase
{
    use RefreshDatabase;

    // ── store ──────────────────────────────────────────────────────────────────

    public function test_guests_cannot_register_fcm_tokens(): void
    {
        $this->postJson(route('fcm-tokens.store'), ['token' => 'some-token'])
            ->assertUnauthorized();
    }

    public function test_authenticated_user_can_register_an_fcm_token(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('fcm-tokens.store'), ['token' => 'fcm-token-abc123'])
            ->assertOk()
            ->assertJson(['message' => 'FCM token registered.']);

        $this->assertDatabaseHas('fcm_tokens', [
            'user_id' => $user->id,
            'token' => 'fcm-token-abc123',
            'device_type' => 'web',
        ]);
    }

    public function test_registering_the_same_token_twice_upserts_instead_of_duplicating(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson(route('fcm-tokens.store'), ['token' => 'duplicate-token']);
        $this->actingAs($user)->postJson(route('fcm-tokens.store'), ['token' => 'duplicate-token'])
            ->assertOk();

        $this->assertDatabaseCount('fcm_tokens', 1);
    }

    public function test_registering_an_fcm_token_with_a_device_type(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('fcm-tokens.store'), ['token' => 'ios-token-xyz', 'device_type' => 'ios'])
            ->assertOk();

        $this->assertDatabaseHas('fcm_tokens', [
            'user_id' => $user->id,
            'token' => 'ios-token-xyz',
            'device_type' => 'ios',
        ]);
    }

    public function test_registering_an_fcm_token_requires_a_token(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('fcm-tokens.store'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['token']);
    }

    public function test_registering_an_fcm_token_rejects_invalid_device_type(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('fcm-tokens.store'), ['token' => 'some-token', 'device_type' => 'smartfridge'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['device_type']);
    }

    // ── destroy ────────────────────────────────────────────────────────────────

    public function test_guests_cannot_delete_fcm_tokens(): void
    {
        $this->deleteJson(route('fcm-tokens.destroy', 'some-token'))
            ->assertUnauthorized();
    }

    public function test_authenticated_user_can_remove_their_fcm_token(): void
    {
        $user = User::factory()->create();
        $fcmToken = FcmToken::factory()->create(['user_id' => $user->id, 'token' => 'removable-token']);

        $this->actingAs($user)
            ->deleteJson(route('fcm-tokens.destroy', $fcmToken->token))
            ->assertOk()
            ->assertJson(['message' => 'FCM token removed.']);

        $this->assertDatabaseMissing('fcm_tokens', ['id' => $fcmToken->id]);
    }

    public function test_user_cannot_delete_another_users_fcm_token(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();
        $fcmToken = FcmToken::factory()->create(['user_id' => $owner->id, 'token' => 'owners-token']);

        $this->actingAs($attacker)
            ->deleteJson(route('fcm-tokens.destroy', $fcmToken->token))
            ->assertOk();

        // Token should still exist because it didn't belong to the attacker
        $this->assertDatabaseHas('fcm_tokens', ['id' => $fcmToken->id]);
    }

    public function test_deleting_nonexistent_token_returns_ok_gracefully(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->deleteJson(route('fcm-tokens.destroy', 'nonexistent-token'))
            ->assertOk();
    }

    // ── service worker ─────────────────────────────────────────────────────────

    public function test_firebase_service_worker_is_publicly_accessible(): void
    {
        $this->get(route('firebase.sw'))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/javascript');
    }

    public function test_firebase_service_worker_contains_firebase_init_script(): void
    {
        $this->get(route('firebase.sw'))
            ->assertOk()
            ->assertSee('firebase.initializeApp', false)
            ->assertSee('firebase.messaging()', false);
    }
}
