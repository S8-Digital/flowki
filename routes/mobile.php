<?php

declare(strict_types=1);

use App\Http\Controllers\FcmTokenController;
use App\Http\Controllers\Mobile\AuthController;
use App\Http\Controllers\Mobile\CalendarController;
use App\Http\Controllers\Mobile\ChoreController;
use App\Http\Controllers\Mobile\FamilyController;
use App\Http\Controllers\Mobile\MealController;
use App\Http\Controllers\Mobile\ProfileController;
use App\Http\Controllers\Mobile\RecipeController;
use App\Http\Controllers\Mobile\ShoppingController;
use App\Http\Controllers\Mobile\TodoController;
use App\Http\Controllers\Mobile\VoiceCommandController;
use App\Http\Controllers\Mobile\WeatherController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Mobile API Routes (Sanctum token-authenticated)
|--------------------------------------------------------------------------
|
| These routes serve the Expo mobile app. They use Sanctum bearer tokens
| instead of session cookies so the app can authenticate natively.
|
*/

Route::name('mobile.')->group(function () {
    // Public (unauthenticated)
    Route::post('register', [AuthController::class, 'register'])->name('register');
    Route::post('login', [AuthController::class, 'login'])->name('login');

    // Protected (Sanctum token)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('user', [AuthController::class, 'me'])->name('user');

        // Profile & password
        Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

        // Family
        Route::get('family', [FamilyController::class, 'show'])->name('family.show');
        Route::post('family', [FamilyController::class, 'store'])->name('family.store');
        Route::post('family/join', [FamilyController::class, 'join'])->name('family.join');

        // Weather
        Route::get('weather', [WeatherController::class, 'index'])->name('weather.index');

        // Voice commands (rate-limited to 20 requests per minute per user)
        Route::post('voice/command', VoiceCommandController::class)
            ->name('voice.command')
            ->middleware('throttle:20,1');

        // FCM tokens
        Route::post('fcm-tokens', [FcmTokenController::class, 'store'])->name('fcm-tokens.store');
        Route::delete('fcm-tokens/{token}', [FcmTokenController::class, 'destroy'])->name('fcm-tokens.destroy');

        // Todos
        Route::get('todos', [TodoController::class, 'index'])->name('todos.index');
        Route::post('todos', [TodoController::class, 'store'])->name('todos.store');
        Route::patch('todos/{todo}', [TodoController::class, 'update'])->name('todos.update');
        Route::delete('todos/{todo}', [TodoController::class, 'destroy'])->name('todos.destroy');

        // Chores
        Route::get('chores', [ChoreController::class, 'index'])->name('chores.index');
        Route::post('chores', [ChoreController::class, 'store'])->name('chores.store');
        Route::patch('chores/{chore}', [ChoreController::class, 'update'])->name('chores.update');
        Route::delete('chores/{chore}', [ChoreController::class, 'destroy'])->name('chores.destroy');
        Route::post('chores/{chore}/complete', [ChoreController::class, 'complete'])->name('chores.complete');

        // Calendar
        Route::get('calendar', [CalendarController::class, 'index'])->name('calendar.index');
        Route::post('calendar', [CalendarController::class, 'store'])->name('calendar.store');
        Route::patch('calendar/{calendarEvent}', [CalendarController::class, 'update'])->name('calendar.update');
        Route::delete('calendar/{calendarEvent}', [CalendarController::class, 'destroy'])->name('calendar.destroy');

        // Recipes
        Route::get('recipes', [RecipeController::class, 'index'])->name('recipes.index');

        // Meals
        Route::get('meals', [MealController::class, 'index'])->name('meals.index');
        Route::post('meals/ai-suggest', [MealController::class, 'aiSuggest'])->name('meals.ai-suggest');
        Route::post('meals/bulk', [MealController::class, 'bulkCreate'])->name('meals.bulk');
        Route::post('meals', [MealController::class, 'store'])->name('meals.store');
        Route::patch('meals/{meal}', [MealController::class, 'update'])->name('meals.update');
        Route::delete('meals/{meal}', [MealController::class, 'destroy'])->name('meals.destroy');
        Route::post('meals/{meal}/groceries', [MealController::class, 'aggregateGroceries'])->name('meals.groceries');

        // Shopping lists
        Route::get('shopping', [ShoppingController::class, 'index'])->name('shopping.index');
        Route::post('shopping', [ShoppingController::class, 'store'])->name('shopping.store');
        Route::get('shopping/{shoppingList}', [ShoppingController::class, 'show'])->name('shopping.show');
        Route::delete('shopping/{shoppingList}', [ShoppingController::class, 'destroy'])->name('shopping.destroy');

        // Shopping items (scoped so {shoppingItem} must belong to {shoppingList})
        Route::scopeBindings()->group(function () {
            Route::post('shopping/{shoppingList}/items', [ShoppingController::class, 'storeItem'])->name('shopping.items.store');
            Route::patch('shopping/{shoppingList}/items/{shoppingItem}', [ShoppingController::class, 'updateItem'])->name('shopping.items.update');
            Route::patch('shopping/{shoppingList}/items/{shoppingItem}/toggle', [ShoppingController::class, 'toggleItem'])->name('shopping.items.toggle');
            Route::delete('shopping/{shoppingList}/items/{shoppingItem}', [ShoppingController::class, 'destroyItem'])->name('shopping.items.destroy');
        });
    });
});
