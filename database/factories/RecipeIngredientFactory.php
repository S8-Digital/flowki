<?php

namespace Database\Factories;

use App\Models\Recipe;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RecipeIngredient>
 */
class RecipeIngredientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'recipe_id' => Recipe::factory(),
            'name' => fake()->randomElement([
                'flour', 'sugar', 'butter', 'eggs', 'milk', 'salt', 'olive oil',
                'garlic', 'onion', 'chicken breast', 'pasta', 'tomato sauce',
                'cheese', 'pepper', 'basil', 'parsley',
            ]),
            'quantity' => fake()->optional()->randomElement(['1', '2', '1/2', '1/4', '3']),
            'unit' => fake()->optional()->randomElement(['cup', 'tbsp', 'tsp', 'lb', 'oz', 'clove', 'g', 'ml']),
            'notes' => fake()->optional()->sentence(),
            'sort_order' => 0,
        ];
    }
}
