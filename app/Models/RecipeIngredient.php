<?php

namespace App\Models;

use Database\Factories\RecipeIngredientFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecipeIngredient extends Model
{
    /** @use HasFactory<RecipeIngredientFactory> */
    use HasFactory;

    protected $fillable = [
        'recipe_id',
        'name',
        'quantity',
        'unit',
        'notes',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function recipe(): BelongsTo
    {
        return $this->belongsTo(Recipe::class);
    }
}
