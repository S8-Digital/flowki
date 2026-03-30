<?php

namespace Database\Factories;

use App\Enums\MealType;
use App\Models\Family;
use App\Models\Meal;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Meal>
 */
class MealFactory extends Factory
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
            'recipe_id' => Recipe::factory(),
            'planned_date' => fake()->dateTimeBetween('now', '+7 days')->format('Y-m-d'),
            'meal_type' => fake()->randomElement(MealType::cases()),
            'servings' => fake()->optional()->numberBetween(2, 8),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
