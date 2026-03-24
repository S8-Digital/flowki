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
        'reminder_enabled',
        'reminder_lead_time',
    ];

    protected function casts(): array
    {
        return [
            'frequency' => ChoreFrequency::class,
            'next_due_date' => 'datetime',
            'reminder_enabled' => 'boolean',
            'reminder_lead_time' => 'integer',
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

    /**
     * Serialise this chore for Firebase Realtime Database sync.
     *
     * @return array<string, mixed>
     */
    public function toSyncArray(): array
    {
        return [
            'id' => $this->id,
            'family_id' => $this->family_id,
            'created_by' => $this->created_by,
            'title' => $this->title,
            'description' => $this->description,
            'frequency' => $this->frequency?->value,
            'next_due_date' => $this->next_due_date?->toIso8601String(),
            'reminder_enabled' => $this->reminder_enabled,
            'reminder_lead_time' => $this->reminder_lead_time,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
