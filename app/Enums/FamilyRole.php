<?php

namespace App\Enums;

enum FamilyRole: string
{
    case Admin = 'admin';
    case Member = 'member';
    case Guest = 'guest';
    case Child = 'child';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Admin',
            self::Member => 'Member',
            self::Guest => 'Guest',
            self::Child => 'Child',
        };
    }

    public function isAdmin(): bool
    {
        return $this === self::Admin;
    }

    public function canLogin(): bool
    {
        return $this !== self::Child;
    }
}
