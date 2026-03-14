<?php

namespace Database\Factories;

use App\Enums\Priority;
use App\Enums\TodoCategory;
use App\Enums\TodoStatus;
use App\Models\Family;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Todo>
 */
class TodoFactory extends Factory
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
            'assigned_to' => null,
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'category' => fake()->randomElement(TodoCategory::cases()),
            'priority' => fake()->randomElement(Priority::cases()),
            'status' => fake()->randomElement(TodoStatus::cases()),
            'due_date' => fake()->optional()->dateTimeBetween('now', '+30 days'),
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => TodoStatus::Pending]);
    }

    public function completed(): static
    {
        return $this->state(['status' => TodoStatus::Completed]);
    }

    public function highPriority(): static
    {
        return $this->state(['priority' => Priority::High]);
    }
}
