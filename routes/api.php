<?php

use App\Http\Controllers\InboundEmailController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by bootstrap/app.php and are NOT protected by
| the auth middleware. They are intended for webhooks and external services.
|
*/

Route::post('inbound-email', InboundEmailController::class)->name('inbound-email.webhook');
