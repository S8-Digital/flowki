<?php

namespace Database\Factories;

use App\Models\Family;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShoppingList>
 */
class ShoppingListFactory extends Factory
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
            'name' => fake()->randomElement(['Weekly Groceries', 'Costco Run', 'Pharmacy', 'Hardware Store', 'Party Supplies']),
            'is_shared' => fake()->boolean(80),
        ];
    }
}
