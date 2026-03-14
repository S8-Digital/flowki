<?php

use App\Http\Controllers\GoogleCalendarController;
use App\Http\Controllers\Settings\CategoriesController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
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
});


