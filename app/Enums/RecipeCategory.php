<?php

namespace App\Enums;

enum RecipeCategory: string
{
    case Breakfast = 'breakfast';
    case Lunch = 'lunch';
    case Dinner = 'dinner';
    case Snack = 'snack';
    case Dessert = 'dessert';
    case Beverage = 'beverage';
}
