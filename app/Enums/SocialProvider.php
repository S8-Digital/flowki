<?php

namespace App\Enums;

enum SocialProvider: string
{
    case Google = 'google';
    case Apple = 'apple';

    public function label(): string
    {
        return match ($this) {
            self::Google => 'Google',
            self::Apple => 'Apple',
        };
    }
}
