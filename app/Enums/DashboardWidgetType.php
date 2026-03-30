<?php

namespace App\Enums;

enum DashboardWidgetType: string
{
    case CalendarSchedule = 'calendar_schedule';
    case CalendarToday = 'calendar_today';
    case TodoList = 'todo_list';
    case ShoppingList = 'shopping_list';
    case Weather = 'weather';
    case MealPlanner = 'meal_planner';

    public function label(): string
    {
        return match ($this) {
            self::CalendarSchedule => 'Upcoming Events',
            self::CalendarToday => "Today's Schedule",
            self::TodoList => 'Todo List',
            self::ShoppingList => 'Shopping List',
            self::Weather => 'Weather',
            self::MealPlanner => "This Week's Dinners",
        };
    }
}
