<?php

namespace Database\Factories;

use App\Enums\ShoppingItemCategory;
use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShoppingItem>
 */
class ShoppingItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'shopping_list_id' => ShoppingList::factory(),
            'added_by' => User::factory(),
            'name' => fake()->randomElement([
                'Milk', 'Eggs', 'Bread', 'Butter', 'Cheese', 'Chicken', 'Pasta',
                'Rice', 'Tomatoes', 'Apples', 'Bananas', 'Yogurt', 'Orange juice',
                'Dish soap', 'Paper towels', 'Shampoo', 'Toothpaste',
            ]),
            'quantity' => fake()->optional()->randomElement(['1', '2', '1 lb', '1 dozen', '6 pack', '1 bag']),
            'category' => fake()->randomElement(ShoppingItemCategory::cases()),
            'is_checked' => fake()->boolean(30),
        ];
    }
}
