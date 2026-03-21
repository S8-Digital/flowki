<?php

namespace Tests\Unit\Mcp;

use App\Enums\ShoppingItemCategory;
use App\Mcp\Tools\AddShoppingItemTool;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Mcp\Request;
use Tests\TestCase;

class AddShoppingItemToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_error_when_user_has_no_family(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $tool = new AddShoppingItemTool;
        $response = $tool->handle(new Request(['name' => 'Milk']));

        $this->assertStringContainsString('Error', (string) $response->content());
        $this->assertStringContainsString('family', (string) $response->content());
    }

    public function test_returns_error_when_name_is_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new AddShoppingItemTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('Error', (string) $response->content());
        $this->assertStringContainsString('name', (string) $response->content());
    }

    public function test_creates_new_list_when_none_exists(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new AddShoppingItemTool;
        $response = $tool->handle(new Request(['name' => 'Milk']));

        $this->assertStringContainsString('Milk', (string) $response->content());
        $this->assertDatabaseHas('shopping_items', [
            'name' => 'Milk',
            'added_by' => $user->id,
        ]);
    }

    public function test_adds_to_existing_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'name' => 'Weekly Shop',
        ]);

        $tool = new AddShoppingItemTool;
        $response = $tool->handle(new Request(['name' => 'Eggs', 'list_name' => 'Weekly Shop']));

        $this->assertStringContainsString('Eggs', (string) $response->content());
        $this->assertStringContainsString('Weekly Shop', (string) $response->content());
    }

    public function test_uses_default_groceries_category(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new AddShoppingItemTool;
        $tool->handle(new Request(['name' => 'Apples']));

        $this->assertDatabaseHas('shopping_items', [
            'name' => 'Apples',
            'category' => ShoppingItemCategory::Groceries->value,
        ]);
    }

    public function test_uses_provided_category(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new AddShoppingItemTool;
        $tool->handle(new Request([
            'name' => 'Shampoo',
            'category' => ShoppingItemCategory::Personal->value,
        ]));

        $this->assertDatabaseHas('shopping_items', [
            'name' => 'Shampoo',
            'category' => ShoppingItemCategory::Personal->value,
        ]);
    }

    public function test_stores_quantity_when_provided(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new AddShoppingItemTool;
        $tool->handle(new Request(['name' => 'Butter', 'quantity' => '500g']));

        $this->assertDatabaseHas('shopping_items', [
            'name' => 'Butter',
            'quantity' => '500g',
        ]);
    }
}
