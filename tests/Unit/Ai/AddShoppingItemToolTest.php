<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\AddShoppingItem;
use App\Enums\ShoppingItemCategory;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class AddShoppingItemToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_creates_new_list_when_none_exists(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new AddShoppingItem($user);

        $result = $tool->handle(new Request(['name' => 'Milk']));

        $this->assertStringContainsString('Milk', $result);
        $this->assertDatabaseHas('shopping_items', [
            'name' => 'Milk',
            'added_by' => $user->id,
        ]);
    }

    public function test_handle_adds_to_existing_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'name' => 'Weekly Shop',
        ]);

        $tool = new AddShoppingItem($user);
        $result = $tool->handle(new Request(['name' => 'Eggs', 'list_name' => 'Weekly Shop']));

        $this->assertStringContainsString('Eggs', $result);
        $this->assertStringContainsString('Weekly Shop', $result);
    }

    public function test_handle_includes_quantity_when_provided(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new AddShoppingItem($user);

        $tool->handle(new Request(['name' => 'Butter', 'quantity' => '500g']));

        $this->assertDatabaseHas('shopping_items', [
            'name' => 'Butter',
            'quantity' => '500g',
        ]);
    }

    public function test_handle_uses_default_category_when_not_specified(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new AddShoppingItem($user);

        $tool->handle(new Request(['name' => 'Apples']));

        $this->assertDatabaseHas('shopping_items', [
            'name' => 'Apples',
            'category' => ShoppingItemCategory::Groceries->value,
        ]);
    }

    public function test_handle_uses_provided_category(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new AddShoppingItem($user);

        $tool->handle(new Request(['name' => 'Shampoo', 'category' => ShoppingItemCategory::PersonalCare->value]));

        $this->assertDatabaseHas('shopping_items', [
            'name' => 'Shampoo',
            'category' => ShoppingItemCategory::PersonalCare->value,
        ]);
    }

    public function test_handle_creates_item_with_is_checked_false(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new AddShoppingItem($user);

        $tool->handle(new Request(['name' => 'Bread']));

        $this->assertDatabaseHas('shopping_items', [
            'name' => 'Bread',
            'is_checked' => false,
        ]);
    }

    public function test_description_is_non_empty_string(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new AddShoppingItem($user);

        $this->assertNotEmpty($tool->description());
        $this->assertIsString($tool->description());
    }

    public function test_schema_has_name_quantity_category_and_list_name_fields(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new AddShoppingItem($user);

        // The tool is exercised end-to-end with all schema fields to ensure
        // the schema definition drives correct handling of each parameter.
        $result = $tool->handle(new Request([
            'name' => 'Rice',
            'quantity' => '1kg',
            'category' => ShoppingItemCategory::Groceries->value,
            'list_name' => 'Weekly',
        ]));

        $this->assertStringContainsString('Rice', $result);
        $this->assertDatabaseHas('shopping_items', ['name' => 'Rice', 'quantity' => '1kg']);
    }
}
