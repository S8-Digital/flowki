<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
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
        // We manage all authentication and two-factor routes ourselves (login,
        // register, password reset, two-factor-authentication management,
        // two-factor challenge, etc.), so we tell Fortify not to register any
        // routes at all. Fortify is only used here for its underlying actions,
        // requests, and features, while all routes are defined in our own
        // route files and handled by our controllers.
        Fortify::ignoreRoutes();
    }
}
