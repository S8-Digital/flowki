<?php

namespace Tests\Feature\Auth;

use App\Enums\SocialProvider;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class SocialAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function mockSocialiteUser(string $id, string $name, string $email, string $provider = 'google'): void
    {
        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->token = 'access-token';
        $socialiteUser->refreshToken = 'refresh-token';
        $socialiteUser->expiresIn = 3600;

        $socialiteUser->shouldReceive('getId')->andReturn($id);
        $socialiteUser->shouldReceive('getName')->andReturn($name);
        $socialiteUser->shouldReceive('getEmail')->andReturn($email);
        $socialiteUser->shouldReceive('getAvatar')->andReturn('https://example.com/avatar.jpg');

        $mockProvider = Mockery::mock('Laravel\Socialite\Two\AbstractProvider');
        $mockProvider->shouldReceive('user')->andReturn($socialiteUser);
        $mockProvider->shouldReceive('redirect')->andReturn(redirect('/'));
        $mockProvider->shouldReceive('stateless')->andReturnSelf();
        $mockProvider->shouldReceive('with')->andReturnSelf();

        Socialite::shouldReceive('driver')->with($provider)->andReturn($mockProvider);
    }

    /**
     * Build a signed state the same way the controller does, for use in test requests.
     *
     * @param  array<string, mixed>  $data
     */
    private function signedState(array $data): string
    {
        $payload = base64_encode((string) json_encode($data));
        $signature = hash_hmac('sha256', $payload, config('app.key'));

        return $payload.'.'.$signature;
    }

    /** Hit the callback then follow the resume redirect, returning the final response. */
    private function callbackThenResume(string $provider, array $queryParams = []): TestResponse
    {
        $callbackResponse = $this->get(route('social.callback', $provider).'?'.http_build_query($queryParams));
        $resumeUrl = $callbackResponse->headers->get('Location');

        return $this->get($resumeUrl);
    }

    // --- Guest sign-in / register flows ---

    public function test_redirect_redirects_to_provider(): void
    {
        $mockProvider = Mockery::mock('Laravel\Socialite\Two\AbstractProvider');
        $mockProvider->shouldReceive('stateless')->andReturnSelf();
        $mockProvider->shouldReceive('with')->andReturnSelf();
        $mockProvider->shouldReceive('redirect')->andReturn(redirect('https://accounts.google.com/oauth'));

        Socialite::shouldReceive('driver')->with('google')->andReturn($mockProvider);

        $this->get(route('social.redirect', 'google'))->assertRedirect();
    }

    public function test_callback_creates_new_user_when_no_account_exists(): void
    {
        $this->mockSocialiteUser('google-123', 'John Doe', 'john@example.com');

        $state = $this->signedState(['action' => 'login']);
        $finalResponse = $this->callbackThenResume('google', ['state' => $state]);

        $this->assertAuthenticated();
        $finalResponse->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('users', ['email' => 'john@example.com', 'name' => 'John Doe']);
        $this->assertDatabaseHas('social_accounts', [
            'provider' => SocialProvider::Google->value,
            'provider_id' => 'google-123',
        ]);
    }

    public function test_callback_new_user_has_verified_email(): void
    {
        $this->mockSocialiteUser('google-123', 'John Doe', 'john@example.com');

        $state = $this->signedState(['action' => 'login']);
        $this->callbackThenResume('google', ['state' => $state]);

        $this->assertNotNull(User::query()->where('email', 'john@example.com')->first()->email_verified_at);
    }

    public function test_callback_logs_in_existing_social_account(): void
    {
        $user = User::factory()->create(['email' => 'john@example.com']);
        SocialAccount::factory()->google()->create(['user_id' => $user->id, 'provider_id' => 'google-123']);

        $this->mockSocialiteUser('google-123', 'John Doe', 'john@example.com');

        $state = $this->signedState(['action' => 'login']);
        $this->callbackThenResume('google', ['state' => $state]);

        $this->assertAuthenticatedAs($user);
    }

    public function test_callback_merges_with_existing_user_by_email(): void
    {
        $existingUser = User::factory()->create(['email' => 'john@example.com', 'email_verified_at' => null]);

        $this->mockSocialiteUser('google-456', 'John Doe', 'john@example.com');

        $state = $this->signedState(['action' => 'login']);
        $this->callbackThenResume('google', ['state' => $state]);

        $this->assertAuthenticatedAs($existingUser);
        $this->assertDatabaseHas('social_accounts', [
            'user_id' => $existingUser->id,
            'provider' => SocialProvider::Google->value,
            'provider_id' => 'google-456',
        ]);
        $this->assertNotNull($existingUser->fresh()->email_verified_at);
    }

    public function test_callback_does_not_create_duplicate_users_for_same_email(): void
    {
        User::factory()->create(['email' => 'john@example.com']);
        $this->mockSocialiteUser('google-789', 'John Doe', 'john@example.com');

        $state = $this->signedState(['action' => 'login']);
        $this->callbackThenResume('google', ['state' => $state]);

        $this->assertDatabaseCount('users', 1);
    }

    public function test_callback_bridges_error_to_login_page(): void
    {
        $state = $this->signedState(['action' => 'login']);

        // Hit callback with error, then follow resume to the login page
        $callbackResponse = $this->get(route('social.callback', 'google').'?error=access_denied&state='.$state);
        $resumeUrl = $callbackResponse->headers->get('Location');
        $finalResponse = $this->get($resumeUrl);

        $finalResponse->assertRedirect(route('login'));
    }

    public function test_callback_rejects_tampered_state(): void
    {
        $this->mockSocialiteUser('google-123', 'John Doe', 'john@example.com');

        $tamperedState = $this->signedState(['action' => 'login']).'tampered';

        $callbackResponse = $this->get(route('social.callback', 'google').'?state='.$tamperedState);
        $resumeUrl = $callbackResponse->headers->get('Location');
        $finalResponse = $this->get($resumeUrl);

        $finalResponse->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_callback_rejects_invalid_provider(): void
    {
        $this->withoutExceptionHandling();
        $this->expectException(\ValueError::class);

        $this->get(route('social.callback', 'unknown'));
    }

    public function test_resume_with_expired_token_redirects_to_login(): void
    {
        $this->get(route('social.resume').'?token=invalid-token')
            ->assertRedirect(route('login'));
    }

    // --- Authenticated linking flows ---

    public function test_authenticated_user_can_link_a_social_provider(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->mockSocialiteUser('google-999', 'John Doe', 'john@example.com');

        $state = $this->signedState(['action' => 'link', 'uid' => $user->id]);
        $callbackResponse = $this->get(route('social.callback', 'google').'?state='.$state);

        $resumeUrl = $callbackResponse->headers->get('Location');
        $this->get($resumeUrl)->assertRedirect(route('profile.edit'));

        $this->assertDatabaseHas('social_accounts', [
            'user_id' => $user->id,
            'provider' => SocialProvider::Google->value,
            'provider_id' => 'google-999',
        ]);
    }

    public function test_cannot_link_a_provider_already_linked_to_another_account(): void
    {
        $otherUser = User::factory()->create();
        SocialAccount::factory()->google()->create(['user_id' => $otherUser->id, 'provider_id' => 'google-999']);

        $user = User::factory()->create();
        $this->actingAs($user);

        $this->mockSocialiteUser('google-999', 'John Doe', 'other@example.com');

        $state = $this->signedState(['action' => 'link', 'uid' => $user->id]);
        $callbackResponse = $this->get(route('social.callback', 'google').'?state='.$state);

        $resumeUrl = $callbackResponse->headers->get('Location');
        $finalResponse = $this->get($resumeUrl);

        $finalResponse->assertRedirect(route('profile.edit'));
        $finalResponse->assertSessionHasErrors('social');
        $this->assertDatabaseMissing('social_accounts', ['user_id' => $user->id]);
    }

    public function test_authenticated_user_can_unlink_a_provider_when_password_is_set(): void
    {
        $user = User::factory()->create();
        $socialAccount = SocialAccount::factory()->google()->create(['user_id' => $user->id]);

        $this->actingAs($user)->delete(route('social.unlink', 'google'))
            ->assertRedirect(route('profile.edit'));

        $this->assertDatabaseMissing('social_accounts', ['id' => $socialAccount->id]);
    }

    public function test_cannot_unlink_only_sign_in_method_when_no_password_set(): void
    {
        $user = User::factory()->create(['password' => null]);
        SocialAccount::factory()->google()->create(['user_id' => $user->id]);

        $this->actingAs($user)->delete(route('social.unlink', 'google'))
            ->assertRedirect(route('profile.edit'))
            ->assertSessionHasErrors('social');

        $this->assertDatabaseCount('social_accounts', 1);
    }

    public function test_can_unlink_one_provider_when_another_remains(): void
    {
        $user = User::factory()->create(['password' => null]);
        SocialAccount::factory()->google()->create(['user_id' => $user->id]);
        SocialAccount::factory()->apple()->create(['user_id' => $user->id]);

        $this->actingAs($user)->delete(route('social.unlink', 'google'))
            ->assertRedirect(route('profile.edit'));

        $this->assertDatabaseCount('social_accounts', 1);
        $this->assertDatabaseHas('social_accounts', [
            'user_id' => $user->id,
            'provider' => SocialProvider::Apple->value,
        ]);
    }

    public function test_unauthenticated_user_cannot_access_link_route(): void
    {
        $this->get(route('social.link', 'google'))->assertRedirect(route('login'));
    }

    public function test_unauthenticated_user_cannot_unlink(): void
    {
        $this->delete(route('social.unlink', 'google'))->assertRedirect(route('login'));
    }

    public function test_resume_token_is_single_use(): void
    {
        $user = User::factory()->create();
        $token = Str::random(64);
        Cache::put('social_resume_'.$token, ['action' => 'login', 'user_id' => $user->id], now()->addMinutes(5));

        // First use - should succeed
        $this->get(route('social.resume').'?token='.$token)->assertRedirect(route('dashboard'));

        // Second use - token is consumed, should fail
        $this->get(route('social.resume').'?token='.$token)->assertRedirect(route('login'));
    }
}
