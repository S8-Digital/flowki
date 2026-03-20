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
        // We manage all authentication routes ourselves (login, register, password,
        // etc.), so we tell Fortify not to register those routes. The only Fortify
        // routes we want are the two-factor-authentication management endpoints
        // (/user/two-factor-authentication, /user/two-factor-qr-code, etc.) and
        // the two-factor challenge, which we also handle with our own controller.
        Fortify::ignoreRoutes();
    }
}
