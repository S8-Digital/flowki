<?php

namespace App\Enums;

enum ChoreFrequency: string
{
    case Once = 'once';
    case Daily = 'daily';
    case Weekly = 'weekly';
    case Monthly = 'monthly';
}
