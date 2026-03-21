<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Services\GoogleCalendarService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GoogleCalendarServiceTest extends TestCase
{
    use RefreshDatabase;

    private GoogleCalendarService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new GoogleCalendarService;

        config([
            'services.google.client_id' => 'test-client-id',
            'services.google.client_secret' => 'test-client-secret',
            'services.google.redirect_uri' => 'http://localhost/google/callback',
        ]);
    }

    public function test_get_authorization_url_contains_required_params(): void
    {
        $url = $this->service->getAuthorizationUrl('my-state');

        $this->assertStringContainsString('accounts.google.com', $url);
        $this->assertStringContainsString('state=my-state', $url);
        $this->assertStringContainsString('client_id=test-client-id', $url);
        $this->assertStringContainsString('response_type=code', $url);
    }

    public function test_exchange_code_for_token_sends_post_and_returns_json(): void
    {
        Http::fake([
            'oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'access-abc',
                'refresh_token' => 'refresh-xyz',
                'expires_in' => 3600,
            ], 200),
        ]);

        $result = $this->service->exchangeCodeForToken('auth-code');

        $this->assertEquals('access-abc', $result['access_token']);
        $this->assertEquals('refresh-xyz', $result['refresh_token']);
    }

    public function test_refresh_access_token_returns_existing_token_when_not_expired(): void
    {
        $user = User::factory()->create([
            'google_calendar_token' => [
                'access_token' => 'existing-token',
                'refresh_token' => 'refresh-token',
                'expires_at' => now()->addHour()->timestamp,
            ],
        ]);

        Http::fake();

        $token = $this->service->refreshAccessToken($user);

        $this->assertEquals('existing-token', $token);
        Http::assertNothingSent();
    }

    public function test_refresh_access_token_refreshes_expired_token(): void
    {
        $user = User::factory()->create([
            'google_calendar_token' => [
                'access_token' => 'old-token',
                'refresh_token' => 'refresh-token',
                'expires_at' => now()->subHour()->timestamp,
            ],
        ]);

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'new-token',
                'expires_in' => 3600,
            ], 200),
        ]);

        $token = $this->service->refreshAccessToken($user);

        $this->assertEquals('new-token', $token);
        $this->assertEquals('new-token', $user->fresh()->google_calendar_token['access_token']);
    }

    public function test_refresh_access_token_returns_null_when_no_refresh_token(): void
    {
        $user = User::factory()->create([
            'google_calendar_token' => ['access_token' => 'token'],
        ]);

        Http::fake();

        $token = $this->service->refreshAccessToken($user);

        $this->assertNull($token);
    }

    public function test_refresh_access_token_returns_null_when_http_fails(): void
    {
        $user = User::factory()->create([
            'google_calendar_token' => [
                'access_token' => 'old-token',
                'refresh_token' => 'refresh-token',
                'expires_at' => now()->subHour()->timestamp,
            ],
        ]);

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response([], 400),
        ]);

        $token = $this->service->refreshAccessToken($user);

        $this->assertNull($token);
    }

    public function test_create_or_update_event_creates_new_event(): void
    {
        $user = User::factory()->create([
            'google_calendar_token' => [
                'access_token' => 'valid-token',
                'refresh_token' => 'refresh-token',
                'expires_at' => now()->addHour()->timestamp,
            ],
        ]);

        Http::fake([
            'www.googleapis.com/calendar/v3/*' => Http::response(['id' => 'google-event-id-123'], 200),
        ]);

        $result = $this->service->createOrUpdateEvent($user, null, [
            'summary' => 'Team Meeting',
            'description' => 'Weekly sync',
            'start' => now()->toIso8601String(),
            'end' => now()->addHour()->toIso8601String(),
        ]);

        $this->assertEquals('google-event-id-123', $result);
    }

    public function test_create_or_update_event_updates_existing_event(): void
    {
        $user = User::factory()->create([
            'google_calendar_token' => [
                'access_token' => 'valid-token',
                'refresh_token' => 'refresh-token',
                'expires_at' => now()->addHour()->timestamp,
            ],
        ]);

        Http::fake([
            'www.googleapis.com/calendar/v3/*' => Http::response(['id' => 'existing-event-id'], 200),
        ]);

        $result = $this->service->createOrUpdateEvent($user, 'existing-event-id', [
            'summary' => 'Updated Meeting',
            'start' => now()->toIso8601String(),
            'end' => now()->addHour()->toIso8601String(),
        ]);

        $this->assertEquals('existing-event-id', $result);
    }

    public function test_create_or_update_event_returns_null_when_no_access_token(): void
    {
        $user = User::factory()->create([
            'google_calendar_token' => null,
        ]);

        Http::fake();

        $result = $this->service->createOrUpdateEvent($user, null, [
            'summary' => 'Event',
            'start' => now()->toIso8601String(),
            'end' => now()->addHour()->toIso8601String(),
        ]);

        $this->assertNull($result);
    }

    public function test_create_or_update_event_returns_null_when_api_fails(): void
    {
        $user = User::factory()->create([
            'google_calendar_token' => [
                'access_token' => 'valid-token',
                'refresh_token' => 'refresh-token',
                'expires_at' => now()->addHour()->timestamp,
            ],
        ]);

        Http::fake([
            'www.googleapis.com/calendar/v3/*' => Http::response(['error' => 'forbidden'], 403),
        ]);

        $result = $this->service->createOrUpdateEvent($user, null, [
            'summary' => 'Bad Event',
            'start' => now()->toIso8601String(),
            'end' => now()->addHour()->toIso8601String(),
        ]);

        $this->assertNull($result);
    }

    public function test_delete_event_calls_google_api(): void
    {
        $user = User::factory()->create([
            'google_calendar_token' => [
                'access_token' => 'valid-token',
                'refresh_token' => 'refresh-token',
                'expires_at' => now()->addHour()->timestamp,
            ],
        ]);

        Http::fake([
            'www.googleapis.com/calendar/v3/*' => Http::response('', 204),
        ]);

        $this->service->deleteEvent($user, 'event-to-delete');

        Http::assertSent(fn ($request) => str_contains($request->url(), '/calendars/primary/events/event-to-delete'));
    }

    public function test_delete_event_does_nothing_when_no_token(): void
    {
        $user = User::factory()->create([
            'google_calendar_token' => null,
        ]);

        Http::fake();

        $this->service->deleteEvent($user, 'some-event-id');

        Http::assertNothingSent();
    }
}
