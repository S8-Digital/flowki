<?php

namespace Database\Factories;

use App\Enums\SocialProvider;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SocialAccount>
 */
class SocialAccountFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'provider' => SocialProvider::Google,
            'provider_id' => fake()->numerify('####################'),
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'avatar' => fake()->imageUrl(),
            'token' => fake()->sha256(),
            'refresh_token' => fake()->sha256(),
            'token_expires_at' => now()->addHour(),
        ];
    }

    public function google(): static
    {
        return $this->state(['provider' => SocialProvider::Google]);
    }

    public function apple(): static
    {
        return $this->state(['provider' => SocialProvider::Apple]);
    }
}
