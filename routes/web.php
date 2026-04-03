<?php

use App\Http\Controllers\AiController;
use App\Http\Controllers\CalendarEventController;
use App\Http\Controllers\ChoreController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FamilyController;
use App\Http\Controllers\FcmTokenController;
use App\Http\Controllers\FirebaseServiceWorkerController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\MealController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ShoppingItemController;
use App\Http\Controllers\ShoppingListController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\WeatherController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Firebase messaging service worker (must be at root scope, no auth)
Route::get('/firebase-messaging-sw.js', FirebaseServiceWorkerController::class)->name('firebase.sw');

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Welcome');
})->name('home');

// Public legal pages
Route::get('/privacy', function () {
    return Inertia::render('Privacy');
})->name('privacy');

Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('dashboard/widgets', [DashboardController::class, 'store'])->name('dashboard.widgets.store');
    Route::patch('dashboard/widgets/{dashboardWidget}', [DashboardController::class, 'update'])->name('dashboard.widgets.update');
    Route::post('dashboard/widgets/reorder', [DashboardController::class, 'reorder'])->name('dashboard.widgets.reorder');
    Route::delete('dashboard/widgets/{dashboardWidget}', [DashboardController::class, 'destroy'])->name('dashboard.widgets.destroy');

    // Family
    Route::get('family/create', [FamilyController::class, 'create'])->name('family.create');
    Route::post('family', [FamilyController::class, 'store'])->name('family.store');
    Route::get('family/join', [FamilyController::class, 'join'])->name('family.join');
    Route::post('family/join', [FamilyController::class, 'joinStore'])->name('family.join.store');
    Route::get('family', [FamilyController::class, 'show'])->name('family.show');
    Route::patch('family', [FamilyController::class, 'update'])->name('family.update');
    Route::post('family/members', [FamilyController::class, 'inviteMember'])->name('family.members.invite');
    Route::post('family/children', [FamilyController::class, 'addChild'])->name('family.children.add');
    Route::patch('family/{family}/members/{userId}/role', [FamilyController::class, 'updateMemberRole'])->name('family.members.role');
    Route::delete('family/{family}/members/{userId}', [FamilyController::class, 'removeMember'])->name('family.members.remove');
    Route::delete('family/{family}/invitations/{invitation}', [FamilyController::class, 'cancelInvitation'])->name('family.invitations.cancel');
    Route::post('family/{family}/invitations/{invitation}/resend', [FamilyController::class, 'resendInvitation'])->name('family.invitations.resend');

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
    Route::get('calendar', [CalendarEventController::class, 'index'])->name('calendar.index');
    Route::get('calendar/family', [CalendarEventController::class, 'familySchedule'])->name('calendar.family');
    Route::post('calendar', [CalendarEventController::class, 'store'])->name('calendar.store');
    Route::patch('calendar/{calendarEvent}', [CalendarEventController::class, 'update'])->name('calendar.update');
    Route::patch('calendar/{calendarEvent}/move', [CalendarEventController::class, 'move'])->name('calendar.move');
    Route::delete('calendar/{calendarEvent}', [CalendarEventController::class, 'destroy'])->name('calendar.destroy');

    // Schedule Import
    Route::post('schedule/upload', [ScheduleController::class, 'upload'])->name('schedule.upload');
    Route::post('schedule/confirm', [ScheduleController::class, 'confirm'])->name('schedule.confirm');

    // Shopping
    Route::get('shopping', [ShoppingListController::class, 'index'])->name('shopping.index');
    Route::post('shopping', [ShoppingListController::class, 'store'])->name('shopping.store');
    Route::get('shopping/{shoppingList}', [ShoppingListController::class, 'show'])->name('shopping.show');
    Route::delete('shopping/{shoppingList}', [ShoppingListController::class, 'destroy'])->name('shopping.destroy');
    Route::post('shopping/{shoppingList}/items', [ShoppingItemController::class, 'store'])->name('shopping.items.store');
    Route::patch('shopping/{shoppingList}/items/{shoppingItem}', [ShoppingItemController::class, 'update'])->name('shopping.items.update');
    Route::patch('shopping/{shoppingList}/items/{shoppingItem}/toggle', [ShoppingItemController::class, 'toggle'])->name('shopping.items.toggle');
    Route::delete('shopping/{shoppingList}/items/{shoppingItem}', [ShoppingItemController::class, 'destroy'])->name('shopping.items.destroy');

    // Recipes
    Route::get('recipes', [RecipeController::class, 'index'])->name('recipes.index');
    Route::post('recipes', [RecipeController::class, 'store'])->name('recipes.store');
    Route::get('recipes/{recipe}', [RecipeController::class, 'show'])->name('recipes.show');
    Route::patch('recipes/{recipe}', [RecipeController::class, 'update'])->name('recipes.update');
    Route::delete('recipes/{recipe}', [RecipeController::class, 'destroy'])->name('recipes.destroy');

    // Meal Planner
    Route::get('meals', [MealController::class, 'index'])->name('meals.index');
    Route::post('meals', [MealController::class, 'store'])->name('meals.store');
    Route::patch('meals/{meal}', [MealController::class, 'update'])->name('meals.update');
    Route::delete('meals/{meal}', [MealController::class, 'destroy'])->name('meals.destroy');
    Route::post('meals/{meal}/groceries', [MealController::class, 'aggregateGroceries'])->name('meals.groceries');

    // AI Assistant
    Route::get('assistant', [AiController::class, 'index'])->name('assistant.index');
    Route::post('assistant/chat', [AiController::class, 'chat'])->name('assistant.chat');

    // Global Search
    Route::get('search', GlobalSearchController::class)->name('search');

    // FCM Tokens
    Route::post('fcm-tokens', [FcmTokenController::class, 'store'])->name('fcm-tokens.store');
    Route::delete('fcm-tokens/{token}', [FcmTokenController::class, 'destroy'])->name('fcm-tokens.destroy');

    // Weather
    Route::get('weather', [WeatherController::class, 'index'])->name('weather.index');

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/recent', [NotificationController::class, 'recent'])->name('notifications.recent');
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
