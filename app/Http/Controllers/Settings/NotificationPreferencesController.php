<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationPreferencesController extends Controller
{
    public function edit(Request $request): Response
    {
        $preferences = $request->user()->notification_preferences ?? [];

        return Inertia::render('settings/Notifications', [
            'preferences' => [
                'email' => $preferences['email'] ?? true,
                'push' => $preferences['push'] ?? true,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'boolean'],
            'push' => ['required', 'boolean'],
        ]);

        $request->user()->update([
            'notification_preferences' => $validated,
        ]);

        return back()->with('status', 'notification-preferences-updated');
    }
}
