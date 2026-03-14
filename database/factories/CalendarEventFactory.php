<?php

namespace Database\Factories;

use App\Enums\RecurrenceType;
use App\Models\CalendarEvent;
use App\Models\Family;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CalendarEvent>
 */
class CalendarEventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startAt = fake()->dateTimeBetween('now', '+60 days');
        $endAt = (clone $startAt)->modify('+'.fake()->numberBetween(30, 180).' minutes');

        return [
            'family_id' => Family::factory(),
            'created_by' => User::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'location' => fake()->optional()->address(),
            'start_at' => $startAt,
            'end_at' => fake()->boolean(70) ? $endAt : null,
            'is_all_day' => fake()->boolean(20),
            'recurrence' => fake()->optional(0.3)->randomElement(RecurrenceType::cases()),
            'reminder_at' => null,
            'color' => fake()->optional()->hexColor(),
        ];
    }
}
