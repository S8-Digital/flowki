<?php

namespace App\Providers;

use App\Events\NotificationReceived;
use Illuminate\Notifications\Events\NotificationSent;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use SocialiteProviders\Apple\AppleExtendSocialite;
use SocialiteProviders\Manager\SocialiteWasCalled;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(SocialiteWasCalled::class, AppleExtendSocialite::class);

        // Broadcast a real-time event whenever a database notification is sent
        Event::listen(NotificationSent::class, function (NotificationSent $event) {
            if (! in_array('database', $event->channels, true)) {
                return;
            }

            $notifiable = $event->notifiable;
            if (! method_exists($notifiable, 'unreadNotifications')) {
                return;
            }

            $unreadCount = $notifiable->unreadNotifications()->count();

            NotificationReceived::dispatch(
                $notifiable->id,
                $event->notification::class,
                $event->response->data ?? [],
                $unreadCount,
            );
        });
    }
}
