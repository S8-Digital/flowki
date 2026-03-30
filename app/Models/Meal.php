<?php

namespace App\Models;

use App\Enums\MealType;
use Database\Factories\MealFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Meal extends Model
{
    /** @use HasFactory<MealFactory> */
    use HasFactory;

    protected $fillable = [
        'family_id',
        'created_by',
        'recipe_id',
        'planned_date',
        'meal_type',
        'servings',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'meal_type' => MealType::class,
            'planned_date' => 'date',
            'servings' => 'integer',
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

    public function recipe(): BelongsTo
    {
        return $this->belongsTo(Recipe::class);
    }

    public function scopeForFamily(Builder $query, int $familyId): Builder
    {
        return $query->where('family_id', $familyId);
    }

    public function scopeForWeek(Builder $query, string $weekStart): Builder
    {
        return $query->whereBetween('planned_date', [$weekStart, date('Y-m-d', strtotime($weekStart . ' +6 days'))]);
    }

    /**
     * Serialise this meal for Firebase Realtime Database sync.
     *
     * @return array<string, mixed>
     */
    public function toSyncArray(): array
    {
        return [
            'id' => $this->id,
            'family_id' => $this->family_id,
            'created_by' => $this->created_by,
            'recipe_id' => $this->recipe_id,
            'planned_date' => $this->planned_date?->toDateString(),
            'meal_type' => $this->meal_type?->value,
            'servings' => $this->servings,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
