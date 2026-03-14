<?php

namespace App\Enums;

enum ShoppingItemCategory: string
{
    case Groceries = 'groceries';
    case Household = 'household';
    case Personal = 'personal';
    case Other = 'other';
}
