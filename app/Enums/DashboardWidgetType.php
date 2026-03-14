<?php

namespace App\Enums;

enum DashboardWidgetType: string
{
    case CalendarSchedule = 'calendar_schedule';
    case CalendarToday = 'calendar_today';
    case TodoList = 'todo_list';
    case ShoppingList = 'shopping_list';

    public function label(): string
    {
        return match ($this) {
            self::CalendarSchedule => 'Upcoming Events',
            self::CalendarToday => "Today's Schedule",
            self::TodoList => 'Todo List',
            self::ShoppingList => 'Shopping List',
        };
    }
}
