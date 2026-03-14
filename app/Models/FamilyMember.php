<?php

namespace App\Models;

use App\Enums\FamilyRole;
use Illuminate\Database\Eloquent\Relations\Pivot;

class FamilyMember extends Pivot
{
    public $timestamps = true;

    protected $fillable = ['family_id', 'user_id', 'role'];

    protected function casts(): array
    {
        return [
            'role' => FamilyRole::class,
        ];
    }
}
