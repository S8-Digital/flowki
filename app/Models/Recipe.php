<?php

namespace App\Models;

use App\Enums\RecipeCategory;
use Database\Factories\RecipeFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Recipe extends Model
{
    /** @use HasFactory<RecipeFactory> */
    use HasFactory;

    protected $fillable = [
        'family_id',
        'created_by',
        'title',
        'description',
        'category',
        'servings',
        'prep_time_minutes',
        'cook_time_minutes',
        'instructions',
        'photo_path',
        'rating',
        'is_favorite',
    ];

    protected function casts(): array
    {
        return [
            'category' => RecipeCategory::class,
            'is_favorite' => 'boolean',
            'rating' => 'integer',
            'servings' => 'integer',
            'prep_time_minutes' => 'integer',
            'cook_time_minutes' => 'integer',
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

    public function ingredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class)->orderBy('sort_order');
    }

    public function scopeForFamily(Builder $query, int $familyId): Builder
    {
        return $query->where('family_id', $familyId);
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function (Builder $q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%");
        });
    }

    public function totalTimeMinutes(): int
    {
        return ($this->prep_time_minutes ?? 0) + ($this->cook_time_minutes ?? 0);
    }
}
