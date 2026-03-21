<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\GoogleCalendarService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class GoogleCalendarControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_initiate_google_calendar_redirect(): void
    {
        $this->get(route('google.calendar.redirect'))->assertRedirect(route('login'));
    }

    public function test_redirect_stores_state_in_session_and_redirects_to_google(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->mock(GoogleCalendarService::class, function ($mock) {
            $mock->shouldReceive('getAuthorizationUrl')
                ->once()
                ->andReturn('https://accounts.google.com/o/oauth2/v2/auth?state=abc');
        });

        $this->actingAs($user)
            ->get(route('google.calendar.redirect'))
            ->assertRedirect('https://accounts.google.com/o/oauth2/v2/auth?state=abc');

        $this->assertNotNull(session('google_calendar_state'));
    }

    public function test_callback_rejects_invalid_state(): void
    {
        $user = User::factory()->withFamily()->create();

        session(['google_calendar_state' => 'valid-state']);

        $this->actingAs($user)
            ->get(route('google.calendar.callback').'?state=wrong-state&code=auth-code')
            ->assertRedirect(route('profile.edit'))
            ->assertSessionHasErrors('google');
    }

    public function test_callback_rejects_when_error_is_present(): void
    {
        $user = User::factory()->withFamily()->create();
        $state = 'some-state';
        session(['google_calendar_state' => $state]);

        $this->actingAs($user)
            ->get(route('google.calendar.callback').'?state='.$state.'&error=access_denied')
            ->assertRedirect(route('profile.edit'))
            ->assertSessionHasErrors('google');
    }

    public function test_callback_stores_token_on_success(): void
    {
        $user = User::factory()->withFamily()->create();
        $state = 'valid-state';
        session(['google_calendar_state' => $state]);

        $tokenData = [
            'access_token' => 'token-abc',
            'refresh_token' => 'refresh-abc',
            'expires_in' => 3600,
        ];

        $this->mock(GoogleCalendarService::class, function ($mock) use ($tokenData) {
            $mock->shouldReceive('exchangeCodeForToken')
                ->once()
                ->with('auth-code')
                ->andReturn($tokenData);
        });

        $this->actingAs($user)
            ->get(route('google.calendar.callback').'?state='.$state.'&code=auth-code')
            ->assertRedirect(route('profile.edit'))
            ->assertSessionHas('status', 'google-calendar-connected');

        $this->assertNotNull($user->fresh()->google_calendar_token);
        $this->assertEquals('token-abc', $user->fresh()->google_calendar_token['access_token']);
    }

    public function test_callback_redirects_with_error_when_token_exchange_fails(): void
    {
        $user = User::factory()->withFamily()->create();
        $state = 'valid-state';
        session(['google_calendar_state' => $state]);

        $this->mock(GoogleCalendarService::class, function ($mock) {
            $mock->shouldReceive('exchangeCodeForToken')
                ->once()
                ->andReturn(['error' => 'invalid_grant', 'error_description' => 'Token has been expired']);
        });

        $this->actingAs($user)
            ->get(route('google.calendar.callback').'?state='.$state.'&code=bad-code')
            ->assertRedirect(route('profile.edit'))
            ->assertSessionHasErrors('google');
    }

    public function test_guests_cannot_disconnect_google_calendar(): void
    {
        $this->delete(route('google.calendar.disconnect'))->assertRedirect(route('login'));
    }

    public function test_user_can_disconnect_google_calendar(): void
    {
        $user = User::factory()->withFamily()->create([
            'google_calendar_token' => ['access_token' => 'token'],
            'google_calendar_id' => 'some-calendar-id',
        ]);

        $this->actingAs($user)
            ->delete(route('google.calendar.disconnect'))
            ->assertRedirect(route('profile.edit'))
            ->assertSessionHas('status', 'google-calendar-disconnected');

        $this->assertNull($user->fresh()->google_calendar_token);
        $this->assertNull($user->fresh()->google_calendar_id);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
