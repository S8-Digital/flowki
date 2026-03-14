<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;

class GoogleCalendarService
{
    private const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';

    private const CALENDAR_URL = 'https://www.googleapis.com/calendar/v3';

    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function getAuthorizationUrl(string $state): string
    {
        return self::AUTH_URL.'?'.http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => config('services.google.redirect_uri'),
            'response_type' => 'code',
            'scope' => 'https://www.googleapis.com/auth/calendar.events',
            'access_type' => 'offline',
            'prompt' => 'consent',
            'state' => $state,
        ]);
    }

    public function exchangeCodeForToken(string $code): array
    {
        $response = Http::post(self::TOKEN_URL, [
            'code' => $code,
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => config('services.google.redirect_uri'),
            'grant_type' => 'authorization_code',
        ]);

        return $response->json();
    }

    public function refreshAccessToken(User $user): ?string
    {
        $token = $user->google_calendar_token;

        if (! isset($token['refresh_token'])) {
            return null;
        }

        if (isset($token['expires_at']) && now()->timestamp < $token['expires_at']) {
            return $token['access_token'];
        }

        $response = Http::post(self::TOKEN_URL, [
            'refresh_token' => $token['refresh_token'],
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'grant_type' => 'refresh_token',
        ]);

        if ($response->failed()) {
            return null;
        }

        $newToken = array_merge($token, $response->json(), [
            'expires_at' => now()->addSeconds($response->json('expires_in', 3600))->timestamp,
        ]);

        $user->update(['google_calendar_token' => $newToken]);

        return $newToken['access_token'];
    }

    /**
     * @param  array{summary: string, description?: string, start: string, end: string}  $eventData
     */
    public function createOrUpdateEvent(User $user, ?string $googleEventId, array $eventData): ?string
    {
        $accessToken = $this->refreshAccessToken($user);

        if (! $accessToken) {
            return null;
        }

        $calendarId = $user->google_calendar_id ?? 'primary';

        $body = [
            'summary' => $eventData['summary'],
            'description' => $eventData['description'] ?? '',
            'start' => ['dateTime' => $eventData['start'], 'timeZone' => config('app.timezone')],
            'end' => ['dateTime' => $eventData['end'], 'timeZone' => config('app.timezone')],
        ];

        if ($googleEventId) {
            $response = Http::withToken($accessToken)
                ->put(self::CALENDAR_URL."/calendars/{$calendarId}/events/{$googleEventId}", $body);
        } else {
            $response = Http::withToken($accessToken)
                ->post(self::CALENDAR_URL."/calendars/{$calendarId}/events", $body);
        }

        return $response->successful() ? $response->json('id') : null;
    }

    public function deleteEvent(User $user, string $googleEventId): void
    {
        $accessToken = $this->refreshAccessToken($user);

        if (! $accessToken) {
            return;
        }

        $calendarId = $user->google_calendar_id ?? 'primary';

        Http::withToken($accessToken)
            ->delete(self::CALENDAR_URL."/calendars/{$calendarId}/events/{$googleEventId}");
    }
}
