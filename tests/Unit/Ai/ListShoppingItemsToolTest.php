<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\ListShoppingItems;
use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class ListShoppingItemsToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_returns_empty_message_when_no_lists(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ListShoppingItems($user);

        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('No shopping lists found', $result);
    }

    public function test_handle_lists_shopping_list_with_items(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'name' => 'Weekly Shop',
        ]);
        ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'added_by' => $user->id,
            'name' => 'Apples',
            'is_checked' => false,
        ]);

        $tool = new ListShoppingItems($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('Weekly Shop', $result);
        $this->assertStringContainsString('Apples', $result);
    }

    public function test_handle_filters_by_checked_status(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'name' => 'My List',
        ]);
        ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'added_by' => $user->id,
            'name' => 'Checked item',
            'is_checked' => true,
        ]);
        ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'added_by' => $user->id,
            'name' => 'Unchecked item',
            'is_checked' => false,
        ]);

        $tool = new ListShoppingItems($user);
        $result = $tool->handle(new Request(['checked' => false]));

        $this->assertStringContainsString('Unchecked item', $result);
        $this->assertStringNotContainsString('Checked item', $result);
    }

    public function test_handle_does_not_return_other_family_lists(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'name' => 'Private List',
        ]);
        ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'added_by' => $other->id,
            'name' => 'Secret item',
        ]);

        $tool = new ListShoppingItems($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('No shopping lists found', $result);
    }

    public function test_handle_includes_list_and_item_ids_in_output(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'name' => 'Grocery Run',
        ]);
        $item = ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'added_by' => $user->id,
            'name' => 'Bread',
            'is_checked' => false,
        ]);

        $tool = new ListShoppingItems($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString("ID:{$list->id}", $result);
        $this->assertStringContainsString("ID:{$item->id}", $result);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertNotEmpty((new ListShoppingItems($user))->description());
    }
}
