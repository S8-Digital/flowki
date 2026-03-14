<?php

namespace App\Models;

use App\Enums\FamilyRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'family_id',
        'email_verified_at',
        'google_calendar_id',
        'google_calendar_token',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_calendar_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'google_calendar_token' => 'array',
        ];
    }

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    public function families(): BelongsToMany
    {
        return $this->belongsToMany(Family::class)
            ->withPivot('role')
            ->withTimestamps()
            ->using(FamilyMember::class);
    }

    public function todos(): HasMany
    {
        return $this->hasMany(Todo::class, 'created_by');
    }

    public function assignedTodos(): HasMany
    {
        return $this->hasMany(Todo::class, 'assigned_to');
    }

    public function choreCompletions(): HasMany
    {
        return $this->hasMany(ChoreCompletion::class, 'completed_by');
    }

    public function familyRoleIn(Family $family): ?FamilyRole
    {
        /** @var FamilyMember|null $pivot */
        $pivot = $this->families()->where('family_id', $family->id)->first()?->pivot;

        return $pivot?->role;
    }

    public function isAdminIn(Family $family): bool
    {
        return $this->familyRoleIn($family)?->isAdmin() ?? false;
    }

    public function isChild(): bool
    {
        return $this->email === null;
    }

    public function isPendingInvitation(): bool
    {
        return ! $this->isChild() && $this->email_verified_at === null;
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    public function dashboardWidgets(): HasMany
    {
        return $this->hasMany(DashboardWidget::class)->orderBy('position');
    }

    public function hasGoogleCalendarConnected(): bool
    {
        return $this->google_calendar_token !== null;
    }
}
