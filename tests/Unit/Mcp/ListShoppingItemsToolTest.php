<?php

namespace Tests\Unit\Mcp;

use App\Mcp\Tools\ListShoppingItemsTool;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Mcp\Request;
use Tests\TestCase;

class ListShoppingItemsToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_error_when_user_has_no_family(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $tool = new ListShoppingItemsTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('Error', (string) $response->content());
    }

    public function test_returns_no_list_message_when_no_lists_exist(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new ListShoppingItemsTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('No shopping list found', (string) $response->content());
    }

    public function test_returns_empty_message_when_list_has_no_items(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'name' => 'Empty list',
        ]);

        $tool = new ListShoppingItemsTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('empty', (string) $response->content());
    }

    public function test_lists_items_in_shopping_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'name' => 'Weekly groceries',
        ]);
        $list->items()->create([
            'added_by' => $user->id,
            'name' => 'Bread',
            'is_checked' => false,
        ]);

        $tool = new ListShoppingItemsTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('Bread', (string) $response->content());
    }

    public function test_filters_unchecked_items_only(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);
        $list->items()->create(['added_by' => $user->id, 'name' => 'Apples', 'is_checked' => false]);
        $list->items()->create(['added_by' => $user->id, 'name' => 'Bananas', 'is_checked' => true]);

        $tool = new ListShoppingItemsTool;
        $response = $tool->handle(new Request(['unchecked_only' => true]));

        $this->assertStringContainsString('Apples', (string) $response->content());
        $this->assertStringNotContainsString('Bananas', (string) $response->content());
    }

    public function test_matches_list_by_name(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'name' => 'Costco Run',
        ]);
        $list->items()->create(['added_by' => $user->id, 'name' => 'Olive oil', 'is_checked' => false]);

        $tool = new ListShoppingItemsTool;
        $response = $tool->handle(new Request(['list_name' => 'Costco']));

        $this->assertStringContainsString('Costco Run', (string) $response->content());
        $this->assertStringContainsString('Olive oil', (string) $response->content());
    }
}
