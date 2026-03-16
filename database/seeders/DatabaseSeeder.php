<?php

namespace Database\Seeders;

use App\Enums\ChoreFrequency;
use App\Enums\FamilyRole;
use App\Enums\Priority;
use App\Enums\RecipeCategory;
use App\Enums\ShoppingItemCategory;
use App\Enums\TodoCategory;
use App\Enums\TodoStatus;
use App\Models\CalendarEvent;
use App\Models\Chore;
use App\Models\Family;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run the role and permission seeders
        $this->call([
            RolePermissionSeeder::class,
        ]);

        // Create demo admin user
        $admin = User::factory()->create([
            'name' => 'Ben Sutter',
            'email' => 'ben@sutter.tech',
            'password' => Hash::make('password'),
        ]);

        // Create family
        $family = Family::create([
            'name' => 'The Sutter Family',
            'invite_code' => strtoupper(Str::random(8)),
            'created_by' => $admin->id,
        ]);

        // Add admin to family
        $family->members()->attach($admin->id, ['role' => FamilyRole::Admin->value]);

        // Attach admin role
        $admin->syncRoles(['Admin']);

        // Set family_id on all users
        User::whereIn('id', [$admin->id])
            ->update(['family_id' => $family->id]);

        // --- Todos ---
        $todoData = [
            ['title' => 'Schedule dentist appointments', 'category' => TodoCategory::Personal, 'priority' => Priority::High, 'status' => TodoStatus::Pending, 'assigned_to' => $admin->id],
            ['title' => 'Pay electricity bill', 'category' => TodoCategory::Home, 'priority' => Priority::Medium, 'status' => TodoStatus::Pending, 'assigned_to' => $admin->id],
        ];

        foreach ($todoData as $data) {
            Todo::create(array_merge($data, [
                'family_id' => $family->id,
                'created_by' => $admin->id,
                'due_date' => now()->addDays(rand(1, 14)),
            ]));
        }

        // --- Chores ---
        $choreData = [
            ['title' => 'Take out trash', 'frequency' => ChoreFrequency::Weekly, 'assigned_to' => $admin->id],
        ];

        foreach ($choreData as $data) {
            $assignedTo = $data['assigned_to'];
            unset($data['assigned_to']);

            $chore = Chore::create(array_merge($data, [
                'family_id' => $family->id,
                'created_by' => $admin->id,
                'next_due_date' => now()->addDays(rand(0, 7)),
            ]));

            $chore->assignees()->attach($assignedTo);
        }

        // --- Calendar Events ---
        CalendarEvent::create([
            'family_id' => $family->id,
            'created_by' => $admin->id,
            'title' => 'Family Game Night',
            'description' => 'Board games and pizza!',
            'location' => 'Home',
            'start_at' => now()->addDays(3)->setTime(19, 0),
            'end_at' => now()->addDays(3)->setTime(22, 0),
            'is_all_day' => false,
            'color' => '#6366f1',
        ]);

        CalendarEvent::create([
            'family_id' => $family->id,
            'created_by' => $admin->id,
            'title' => 'School Spring Concert',
            'description' => "Jordan's spring concert performance",
            'location' => 'Lincoln Elementary School',
            'start_at' => now()->addDays(10)->setTime(18, 30),
            'end_at' => now()->addDays(10)->setTime(20, 0),
            'is_all_day' => false,
            'color' => '#10b981',
        ]);

        CalendarEvent::create([
            'family_id' => $family->id,
            'created_by' => $admin->id,
            'title' => 'Dentist Appointment',
            'location' => 'Dr. Smith Dental Office',
            'start_at' => now()->addDays(7)->setTime(10, 0),
            'end_at' => now()->addDays(7)->setTime(11, 0),
            'is_all_day' => false,
            'color' => '#f59e0b',
        ]);

        // --- Shopping List ---
        $groceryList = ShoppingList::create([
            'family_id' => $family->id,
            'created_by' => $admin->id,
            'name' => 'Weekly Groceries',
            'is_shared' => true,
        ]);

        $groceryItems = [
            ['name' => 'Milk', 'quantity' => '1 gallon', 'category' => ShoppingItemCategory::Groceries],
            ['name' => 'Eggs', 'quantity' => '1 dozen', 'category' => ShoppingItemCategory::Groceries],
            ['name' => 'Bread', 'quantity' => '2 loaves', 'category' => ShoppingItemCategory::Groceries],
            ['name' => 'Chicken breast', 'quantity' => '2 lbs', 'category' => ShoppingItemCategory::Groceries],
            ['name' => 'Pasta', 'quantity' => '3 boxes', 'category' => ShoppingItemCategory::Groceries],
            ['name' => 'Dish soap', 'quantity' => '1 bottle', 'category' => ShoppingItemCategory::Household],
            ['name' => 'Paper towels', 'quantity' => '6 pack', 'category' => ShoppingItemCategory::Household],
        ];

        foreach ($groceryItems as $item) {
            ShoppingItem::create(array_merge($item, [
                'shopping_list_id' => $groceryList->id,
                'added_by' => $admin->id,
                'is_checked' => false,
            ]));
        }

        // --- Recipes ---
        $pasta = Recipe::create([
            'family_id' => $family->id,
            'created_by' => $admin->id,
            'title' => 'Classic Spaghetti Bolognese',
            'description' => 'A hearty Italian meat sauce served over spaghetti.',
            'category' => RecipeCategory::Dinner,
            'servings' => 4,
            'prep_time_minutes' => 15,
            'cook_time_minutes' => 45,
            'instructions' => "1. Brown ground beef in a large pan over medium heat.\n\n2. Add diced onion and garlic, cook until softened.\n\n3. Pour in tomato sauce and diced tomatoes. Season with salt, pepper, and Italian herbs.\n\n4. Simmer for 30 minutes on low heat.\n\n5. Cook spaghetti according to package directions. Serve with meat sauce and Parmesan.",
            'rating' => 5,
            'is_favorite' => true,
        ]);

        $pastaIngredients = [
            ['name' => 'ground beef', 'quantity' => '1', 'unit' => 'lb', 'sort_order' => 1],
            ['name' => 'spaghetti', 'quantity' => '12', 'unit' => 'oz', 'sort_order' => 2],
            ['name' => 'tomato sauce', 'quantity' => '2', 'unit' => 'cups', 'sort_order' => 3],
            ['name' => 'onion', 'quantity' => '1', 'unit' => 'medium', 'sort_order' => 4],
            ['name' => 'garlic', 'quantity' => '3', 'unit' => 'cloves', 'sort_order' => 5],
            ['name' => 'Parmesan cheese', 'quantity' => '1/2', 'unit' => 'cup', 'sort_order' => 6],
        ];

        foreach ($pastaIngredients as $ingredient) {
            RecipeIngredient::create(array_merge($ingredient, ['recipe_id' => $pasta->id]));
        }

        $pancakes = Recipe::create([
            'family_id' => $family->id,
            'created_by' => $admin->id,
            'title' => 'Fluffy Buttermilk Pancakes',
            'description' => 'Light and fluffy pancakes perfect for weekend mornings.',
            'category' => RecipeCategory::Breakfast,
            'servings' => 4,
            'prep_time_minutes' => 10,
            'cook_time_minutes' => 20,
            'instructions' => "1. Whisk together flour, sugar, baking powder, and salt in a large bowl.\n\n2. In a separate bowl, whisk buttermilk, eggs, and melted butter.\n\n3. Combine wet and dry ingredients — do not overmix.\n\n4. Cook on a greased griddle over medium heat until bubbles form, then flip.\n\n5. Serve with maple syrup and fresh berries.",
            'rating' => 4,
            'is_favorite' => false,
        ]);

        $pancakeIngredients = [
            ['name' => 'flour', 'quantity' => '2', 'unit' => 'cups', 'sort_order' => 1],
            ['name' => 'buttermilk', 'quantity' => '2', 'unit' => 'cups', 'sort_order' => 2],
            ['name' => 'eggs', 'quantity' => '2', 'unit' => null, 'sort_order' => 3],
            ['name' => 'butter', 'quantity' => '3', 'unit' => 'tbsp', 'sort_order' => 4],
            ['name' => 'sugar', 'quantity' => '2', 'unit' => 'tbsp', 'sort_order' => 5],
            ['name' => 'baking powder', 'quantity' => '2', 'unit' => 'tsp', 'sort_order' => 6],
            ['name' => 'salt', 'quantity' => '1/2', 'unit' => 'tsp', 'sort_order' => 7],
        ];

        foreach ($pancakeIngredients as $ingredient) {
            RecipeIngredient::create(array_merge($ingredient, ['recipe_id' => $pancakes->id]));
        }
    }
}
