<?php

namespace Tests\Feature\Mobile;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receive_token(): void
    {
        $response = $this->postJson(route('mobile.register'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123!',
            'password_confirmation' => 'password123!',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);
    }

    public function test_register_requires_valid_email(): void
    {
        $this->postJson(route('mobile.register'), [
            'name' => 'Test',
            'email' => 'not-an-email',
            'password' => 'password123!',
            'password_confirmation' => 'password123!',
        ])->assertUnprocessable();
    }

    public function test_register_requires_password_confirmation(): void
    {
        $this->postJson(route('mobile.register'), [
            'name' => 'Test',
            'email' => 'test@example.com',
            'password' => 'password123!',
            'password_confirmation' => 'wrong',
        ])->assertUnprocessable();
    }

    public function test_user_can_login_and_receive_token(): void
    {
        $user = User::factory()->create([
            'email' => 'login@example.com',
            'password' => bcrypt('secret123!'),
        ]);

        $response = $this->postJson(route('mobile.login'), [
            'email' => 'login@example.com',
            'password' => 'secret123!',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);
    }

    public function test_login_with_wrong_password_returns_401(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('correct'),
        ]);

        $this->postJson(route('mobile.login'), [
            'email' => 'user@example.com',
            'password' => 'wrong',
        ])->assertUnauthorized();
    }

    public function test_authenticated_user_can_fetch_their_profile(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.user'))
            ->assertOk()
            ->assertJsonFragment(['id' => $user->id, 'email' => $user->email]);
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('mobile')->plainTextToken;

        $this->withToken($token)
            ->postJson(route('mobile.logout'))
            ->assertOk()
            ->assertJsonFragment(['message' => 'Logged out.']);

        // Token should now be invalid
        $this->withToken($token)
            ->getJson(route('mobile.user'))
            ->assertUnauthorized();
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $this->getJson(route('mobile.user'))->assertUnauthorized();
        $this->getJson(route('mobile.todos.index'))->assertUnauthorized();
        $this->getJson(route('mobile.chores.index'))->assertUnauthorized();
        $this->getJson(route('mobile.shopping.index'))->assertUnauthorized();
        $this->getJson(route('mobile.calendar.index'))->assertUnauthorized();
    }
}
