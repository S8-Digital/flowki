<?php

namespace App\Enums;

enum TodoCategory: string
{
    case Work = 'work';
    case School = 'school';
    case Home = 'home';
    case Personal = 'personal';
}
