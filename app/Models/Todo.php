<?php

namespace App\Models;

use App\Enums\Priority;
use App\Enums\TodoCategory;
use App\Enums\TodoStatus;
use Database\Factories\TodoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Todo extends Model
{
    /** @use HasFactory<TodoFactory> */
    use HasFactory;

    protected $fillable = [
        'family_id',
        'created_by',
        'assigned_to',
        'title',
        'description',
        'category',
        'priority',
        'status',
        'due_date',
        'reminder_enabled',
        'reminder_lead_time',
    ];

    protected function casts(): array
    {
        return [
            'category' => TodoCategory::class,
            'priority' => Priority::class,
            'status' => TodoStatus::class,
            'due_date' => 'datetime',
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

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function scopeForFamily(Builder $query, int $familyId): Builder
    {
        return $query->where('family_id', $familyId);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', TodoStatus::Pending);
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function (Builder $q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%");
        });
    }

    /**
     * Serialise this todo for Firebase Realtime Database sync.
     *
     * @return array<string, mixed>
     */
    public function toSyncArray(): array
    {
        return [
            'id' => $this->id,
            'family_id' => $this->family_id,
            'created_by' => $this->created_by,
            'assigned_to' => $this->assigned_to,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category?->value,
            'priority' => $this->priority?->value,
            'status' => $this->status?->value,
            'due_date' => $this->due_date?->toIso8601String(),
            'reminder_enabled' => $this->reminder_enabled,
            'reminder_lead_time' => $this->reminder_lead_time,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
