<?php

namespace App\Models;

use App\Enums\ShoppingItemCategory;
use Database\Factories\ShoppingItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShoppingItem extends Model
{
    /** @use HasFactory<ShoppingItemFactory> */
    use HasFactory;

    protected $fillable = [
        'shopping_list_id',
        'added_by',
        'name',
        'quantity',
        'category',
        'is_checked',
    ];

    protected function casts(): array
    {
        return [
            'category' => ShoppingItemCategory::class,
            'is_checked' => 'boolean',
        ];
    }

    public function shoppingList(): BelongsTo
    {
        return $this->belongsTo(ShoppingList::class);
    }

    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }
}
