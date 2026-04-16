<?php

namespace App\Providers;

use App\Models\CalendarEvent;
use App\Models\Chore;
use App\Models\Meal;
use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use App\Models\Todo;
use App\Observers\CalendarEventObserver;
use App\Observers\ChoreObserver;
use App\Observers\MealObserver;
use App\Observers\ShoppingItemObserver;
use App\Observers\ShoppingListObserver;
use App\Observers\TodoObserver;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
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
        Log::info('mail namespace paths', [
            'paths' => app('view')->getFinder()->getHints()['mail'] ?? 'NOT REGISTERED',
        ]);

        Event::listen(SocialiteWasCalled::class, AppleExtendSocialite::class);

        Todo::observe(TodoObserver::class);
        Chore::observe(ChoreObserver::class);
        ShoppingItem::observe(ShoppingItemObserver::class);
        ShoppingList::observe(ShoppingListObserver::class);
        CalendarEvent::observe(CalendarEventObserver::class);
        Meal::observe(MealObserver::class);
    }
}
