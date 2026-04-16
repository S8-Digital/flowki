<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        $user?->load('family');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user,
                'connectedProviders' => $user
                    ? $user->socialAccounts()->pluck('provider')->map(fn ($p) => $p->value)->all()
                    : [],
                'hasPasswordSet' => $user?->hasPasswordSet() ?? false,
            ],
            'currentUserPermissions' => $user
                ? $user->getAllPermissions()->pluck('name')->values()->all()
                : [],
            'unreadNotificationsCount' => $user
                ? $user->unreadNotifications()->count()
                : 0,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'googleMapsApiKey' => config('services.google.maps_key'),
            'firebaseConfig' => [
                'apiKey' => config('services.firebase.api_key'),
                'authDomain' => config('services.firebase.auth_domain'),
                'projectId' => config('services.firebase.project_id'),
                'storageBucket' => config('services.firebase.storage_bucket'),
                'messagingSenderId' => config('services.firebase.messaging_sender_id'),
                'appId' => config('services.firebase.app_id'),
                'measurementId' => config('services.firebase.measurement_id'),
                'vapidKey' => config('services.firebase.vapid_key'),
                'recaptchaSiteKey' => config('services.firebase.recaptcha_site_key'),
            ],
        ];
    }
}
