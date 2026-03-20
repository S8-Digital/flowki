<?php

use App\Http\Controllers\GoogleCalendarController;
use App\Http\Controllers\Settings\CategoriesController;
use App\Http\Controllers\Settings\MemberColorController;
use App\Http\Controllers\Settings\MemberOrderController;
use App\Http\Controllers\Settings\MemberProfileController;
use App\Http\Controllers\Settings\NotificationPreferencesController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\PermissionController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/Appearance');
    })->name('appearance');

    Route::get('settings/categories', [CategoriesController::class, 'edit'])->name('settings.categories');
    Route::post('settings/categories', [CategoriesController::class, 'update'])->name('settings.categories.update');

    Route::get('auth/google/calendar', [GoogleCalendarController::class, 'redirect'])->name('google.calendar.redirect');
    Route::get('auth/google/calendar/callback', [GoogleCalendarController::class, 'callback'])->name('google.calendar.callback');
    Route::delete('auth/google/calendar', [GoogleCalendarController::class, 'disconnect'])->name('google.calendar.disconnect');

    Route::get('settings/members/{user}', [MemberProfileController::class, 'edit'])->name('settings.members.profile.edit');

    Route::get('settings/members/{user}/permissions', [PermissionController::class, 'edit'])->name('settings.permissions.edit');
    Route::put('settings/members/{user}/permissions', [PermissionController::class, 'update'])->name('settings.permissions.update');

    Route::get('settings/notifications', [NotificationPreferencesController::class, 'edit'])->name('settings.notifications.edit');
    Route::put('settings/notifications', [NotificationPreferencesController::class, 'update'])->name('settings.notifications.update');

    Route::patch('settings/members/{user}/color', [MemberColorController::class, 'update'])->name('settings.members.color.update');

    Route::patch('settings/members/order', [MemberOrderController::class, 'update'])->name('settings.members.order.update');

    // Two-factor authentication management
    Route::post('user/two-factor-authentication', [TwoFactorController::class, 'store'])
        ->middleware('password.confirm')
        ->name('two-factor.enable');
    Route::put('user/confirmed-two-factor-authentication', [TwoFactorController::class, 'update'])
        ->middleware('password.confirm')
        ->name('two-factor.confirm');
    Route::delete('user/two-factor-authentication', [TwoFactorController::class, 'destroy'])
        ->middleware('password.confirm')
        ->name('two-factor.disable');
    Route::get('user/two-factor-qr-code', [TwoFactorController::class, 'show'])
        ->middleware('password.confirm')
        ->name('two-factor.qr-code');
    Route::get('user/two-factor-recovery-codes', [TwoFactorController::class, 'recoveryCodes'])
        ->middleware('password.confirm')
        ->name('two-factor.recovery-codes');
    Route::post('user/two-factor-recovery-codes', [TwoFactorController::class, 'regenerateRecoveryCodes'])
        ->middleware('password.confirm')
        ->name('two-factor.recovery-codes.regenerate');
});
