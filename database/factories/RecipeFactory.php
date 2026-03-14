<?php

namespace Database\Factories;

use App\Enums\RecipeCategory;
use App\Models\Family;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Recipe>
 */
class RecipeFactory extends Factory
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
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'category' => fake()->randomElement(RecipeCategory::cases()),
            'servings' => fake()->numberBetween(2, 8),
            'prep_time_minutes' => fake()->randomElement([10, 15, 20, 30]),
            'cook_time_minutes' => fake()->randomElement([20, 30, 45, 60]),
            'instructions' => implode("\n\n", fake()->paragraphs(3)),
            'photo_path' => null,
            'rating' => fake()->optional()->numberBetween(1, 5),
            'is_favorite' => fake()->boolean(20),
        ];
    }

    public function favorite(): static
    {
        return $this->state(['is_favorite' => true, 'rating' => 5]);
    }
}
