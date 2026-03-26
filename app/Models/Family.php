<?php

namespace App\Models;

use App\Enums\RecipeCategory;
use App\Enums\ShoppingItemCategory;
use App\Enums\TodoCategory;
use Database\Factories\FamilyFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Family extends Model
{
    /** @use HasFactory<FamilyFactory> */
    use HasFactory;

    protected $fillable = ['name', 'invite_code', 'created_by', 'settings', 'location_name', 'latitude', 'longitude'];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Family $family) {
            if (empty($family->invite_code)) {
                $family->invite_code = strtoupper(Str::random(8));
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps()
            ->using(FamilyMember::class);
    }

    public function todos(): HasMany
    {
        return $this->hasMany(Todo::class);
    }

    public function calendarEvents(): HasMany
    {
        return $this->hasMany(CalendarEvent::class);
    }

    public function chores(): HasMany
    {
        return $this->hasMany(Chore::class);
    }

    public function shoppingLists(): HasMany
    {
        return $this->hasMany(ShoppingList::class);
    }

    public function recipes(): HasMany
    {
        return $this->hasMany(Recipe::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    public function pendingInvitations(): HasMany
    {
        return $this->hasMany(Invitation::class)->whereNull('accepted_at');
    }

    /**
     * @return int[]
     */
    public function getMemberOrder(): array
    {
        return $this->settings['member_order'] ?? [];
    }

    /**
     * Returns members ordered by the family's member_order setting.
     */
    public function getOrderedMembers(): Collection
    {
        $members = $this->members()->get();
        $order = $this->getMemberOrder();

        if (empty($order)) {
            return $members;
        }

        $orderMap = array_flip($order);

        return $members->sortBy(fn ($member) => $orderMap[$member->id] ?? PHP_INT_MAX)->values();
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public function getTodoCategories(): array
    {
        return $this->settings['todo_categories'] ?? collect(TodoCategory::cases())
            ->map(fn ($c) => ['value' => $c->value, 'label' => $c->name])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public function getRecipeCategories(): array
    {
        return $this->settings['recipe_categories'] ?? collect(RecipeCategory::cases())
            ->map(fn ($c) => ['value' => $c->value, 'label' => $c->name])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public function getShoppingCategories(): array
    {
        return $this->settings['shopping_categories'] ?? collect(ShoppingItemCategory::cases())
            ->map(fn ($c) => ['value' => $c->value, 'label' => $c->name])
            ->values()
            ->all();
    }

    public function regenerateInviteCode(): void
    {
        $this->update(['invite_code' => strtoupper(Str::random(8))]);
    }
}
