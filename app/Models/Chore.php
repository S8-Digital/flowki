<?php

namespace App\Models;

use App\Enums\ChoreFrequency;
use Database\Factories\ChoreFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chore extends Model
{
    /** @use HasFactory<ChoreFactory> */
    use HasFactory;

    protected $fillable = [
        'family_id',
        'created_by',
        'title',
        'description',
        'frequency',
        'next_due_date',
    ];

    protected function casts(): array
    {
        return [
            'frequency' => ChoreFrequency::class,
            'next_due_date' => 'datetime',
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

    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    public function completions(): HasMany
    {
        return $this->hasMany(ChoreCompletion::class);
    }

    public function scopeForFamily(Builder $query, int $familyId): Builder
    {
        return $query->where('family_id', $familyId);
    }

    public function scopeDueToday(Builder $query): Builder
    {
        return $query->whereDate('next_due_date', today());
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function (Builder $q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%");
        });
    }
}
