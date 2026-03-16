<?php

namespace Database\Factories;

use App\Enums\FamilyRole;
use App\Models\Family;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create the user with a family, setting family_id and attaching the pivot as Admin.
     */
    public function withFamily(): static
    {
        return $this->afterCreating(function (User $user) {
            $family = Family::factory()->create(['created_by' => $user->id]);
            $user->family()->associate($family)->save();
            $family->members()->attach($user->id, ['role' => FamilyRole::Admin->value]);
            $user->syncRoles(['Admin']);
        });
    }

    /**
     * Attach the user to an existing family as a Member with the Member Spatie role.
     */
    public function asMemberOf(Family $family): static
    {
        return $this->afterCreating(function (User $user) use ($family) {
            $user->update(['family_id' => $family->id]);
            $family->members()->attach($user->id, ['role' => FamilyRole::Member->value]);
            $user->syncRoles(['Member']);
        });
    }

    /**
     * Attach the user to an existing family as a Child with the Child Spatie role.
     */
    public function asChildOf(Family $family): static
    {
        return $this->state(fn (array $attributes) => [
            'email' => null,
            'password' => null,
            'email_verified_at' => now(),
        ])->afterCreating(function (User $user) use ($family) {
            $user->update(['family_id' => $family->id]);
            $family->members()->attach($user->id, ['role' => FamilyRole::Child->value]);
            $user->syncRoles(['Child']);
        });
    }
}
