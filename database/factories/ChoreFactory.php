<?php

namespace Database\Factories;

use App\Enums\ChoreFrequency;
use App\Models\Chore;
use App\Models\Family;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Chore>
 */
class ChoreFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'family_id' => Family::factory(),
            'created_by' => User::factory(),
            'title' => fake()->randomElement([
                'Vacuum living room', 'Wash dishes', 'Take out trash',
                'Mow the lawn', 'Clean bathroom', 'Do laundry',
                'Wipe counters', 'Sweep kitchen', 'Walk the dog',
            ]),
            'description' => fake()->optional()->sentence(),
            'frequency' => fake()->randomElement(ChoreFrequency::cases()),
            'next_due_date' => fake()->dateTimeBetween('now', '+7 days'),
        ];
    }
}
