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

    /**
     * Serialise this shopping item for Firebase Realtime Database sync.
     *
     * @return array<string, mixed>
     */
    public function toSyncArray(): array
    {
        return [
            'id' => $this->id,
            'shopping_list_id' => $this->shopping_list_id,
            'added_by' => $this->added_by,
            'name' => $this->name,
            'quantity' => $this->quantity,
            'category' => $this->category?->value,
            'is_checked' => $this->is_checked,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
