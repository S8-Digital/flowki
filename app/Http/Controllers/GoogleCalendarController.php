<?php

namespace App\Http\Controllers;

use App\Services\GoogleCalendarService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GoogleCalendarController extends Controller
{
    public function __construct(private readonly GoogleCalendarService $googleCalendar) {}

    public function redirect(Request $request): RedirectResponse
    {
        $state = Str::random(32);
        session(['google_calendar_state' => $state]);

        return redirect($this->googleCalendar->getAuthorizationUrl($state));
    }

    public function callback(Request $request): RedirectResponse
    {
        if ($request->state !== session('google_calendar_state')) {
            return redirect()->route('profile.edit')->withErrors(['google' => 'Invalid state. Please try again.']);
        }

        if ($request->has('error')) {
            return redirect()->route('profile.edit')->withErrors(['google' => 'Google Calendar access was denied.']);
        }

        $tokenData = $this->googleCalendar->exchangeCodeForToken($request->code);

        if (isset($tokenData['error'])) {
            return redirect()->route('profile.edit')->withErrors(['google' => 'Failed to connect Google Calendar.']);
        }

        $request->user()->update([
            'google_calendar_token' => array_merge($tokenData, [
                'expires_at' => now()->addSeconds($tokenData['expires_in'] ?? 3600)->timestamp,
            ]),
        ]);

        return redirect()->route('profile.edit')->with('status', 'google-calendar-connected');
    }

    public function disconnect(Request $request): RedirectResponse
    {
        $request->user()->update([
            'google_calendar_token' => null,
            'google_calendar_id' => null,
        ]);

        return redirect()->route('profile.edit')->with('status', 'google-calendar-disconnected');
    }
}
