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
    ];

    protected function casts(): array
    {
        return [
            'category' => TodoCategory::class,
            'priority' => Priority::class,
            'status' => TodoStatus::class,
            'due_date' => 'datetime',
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
}
