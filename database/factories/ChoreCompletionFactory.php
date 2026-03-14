<?php

namespace Database\Factories;

use App\Models\Chore;
use App\Models\ChoreCompletion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChoreCompletion>
 */
class ChoreCompletionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'chore_id' => Chore::factory(),
            'completed_by' => User::factory(),
            'completed_at' => fake()->dateTimeBetween('-30 days', 'now'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
