<?php

namespace App\Models;

use Database\Factories\ShoppingListFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShoppingList extends Model
{
    /** @use HasFactory<ShoppingListFactory> */
    use HasFactory;

    protected $fillable = [
        'family_id',
        'created_by',
        'name',
        'is_shared',
    ];

    protected function casts(): array
    {
        return [
            'is_shared' => 'boolean',
        ];
    }

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ShoppingItem::class);
    }

    public function scopeForFamily(Builder $query, int $familyId): Builder
    {
        return $query->where('family_id', $familyId);
    }
}
