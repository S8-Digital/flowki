<?php

namespace App\Models;

use App\Enums\FamilyRole;
use App\Enums\SocialProvider;
use App\Notifications\VerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (User $user) {
            if (is_null($user->inbound_email_token)) {
                $user->inbound_email_token = (string) Str::uuid();
            }
        });
    }

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
        'profile_color',
        'notification_preferences',
        'email_verified_at',
        'google_calendar_id',
        'google_calendar_token',
        'inbound_email_token',
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
            'notification_preferences' => 'array',
        ];
    }

    /**
     * Whether the user wants email notifications.
     */
    public function wantsEmailNotifications(): bool
    {
        return ($this->notification_preferences['email'] ?? true) === true;
    }

    /**
     * Whether the user wants push notifications.
     */
    public function wantsPushNotifications(): bool
    {
        return ($this->notification_preferences['push'] ?? true) === true;
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

    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccount::class);
    }

    public function hasSocialProvider(SocialProvider $provider): bool
    {
        return $this->socialAccounts()->where('provider', $provider->value)->exists();
    }

    public function hasPasswordSet(): bool
    {
        return $this->password !== null;
    }

    public function fcmTokens(): HasMany
    {
        return $this->hasMany(FcmToken::class);
    }

    public function inboundEmails(): HasMany
    {
        return $this->hasMany(InboundEmail::class);
    }

    public function inboundEmailAddress(): ?string
    {
        if ($this->inbound_email_token === null) {
            return null;
        }

        return $this->inbound_email_token.'@in.flowki.family';
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmail);
    }
}
