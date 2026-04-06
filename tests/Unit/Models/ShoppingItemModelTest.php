<?php

namespace Tests\Unit\Models;

use App\Enums\ShoppingItemCategory;
use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShoppingItemModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_shopping_item_belongs_to_shopping_list(): void
    {
        $item = ShoppingItem::factory()->create();
        $this->assertInstanceOf(ShoppingList::class, $item->shoppingList);
    }

    public function test_shopping_item_belongs_to_added_by_user(): void
    {
        $item = ShoppingItem::factory()->create();
        $this->assertInstanceOf(User::class, $item->addedBy);
    }

    public function test_shopping_item_casts_category_to_enum(): void
    {
        $item = ShoppingItem::factory()->create(['category' => ShoppingItemCategory::Groceries]);
        $this->assertInstanceOf(ShoppingItemCategory::class, $item->fresh()->category);
        $this->assertEquals(ShoppingItemCategory::Groceries, $item->fresh()->category);
    }

    public function test_shopping_item_casts_is_checked_to_boolean(): void
    {
        $item = ShoppingItem::factory()->create(['is_checked' => true]);
        $this->assertTrue($item->fresh()->is_checked);

        $item2 = ShoppingItem::factory()->create(['is_checked' => false]);
        $this->assertFalse($item2->fresh()->is_checked);
    }

    public function test_to_sync_array_returns_expected_keys(): void
    {
        $item = ShoppingItem::factory()->create([
            'name' => 'Milk',
            'quantity' => '1 litre',
            'is_checked' => false,
            'category' => ShoppingItemCategory::Household,
        ]);

        $sync = $item->toSyncArray();

        $this->assertArrayHasKey('id', $sync);
        $this->assertArrayHasKey('shopping_list_id', $sync);
        $this->assertArrayHasKey('added_by', $sync);
        $this->assertArrayHasKey('name', $sync);
        $this->assertArrayHasKey('quantity', $sync);
        $this->assertArrayHasKey('category', $sync);
        $this->assertArrayHasKey('is_checked', $sync);
        $this->assertEquals('Milk', $sync['name']);
        $this->assertFalse($sync['is_checked']);
        $this->assertEquals('household', $sync['category']);
    }

    public function test_shopping_item_is_fillable(): void
    {
        $list = ShoppingList::factory()->create();
        $user = User::factory()->withFamily()->create();

        $item = ShoppingItem::create([
            'shopping_list_id' => $list->id,
            'added_by' => $user->id,
            'name' => 'Apples',
            'quantity' => '6',
            'category' => ShoppingItemCategory::Groceries,
            'is_checked' => false,
        ]);

        $this->assertEquals('Apples', $item->name);
        $this->assertEquals('6', $item->quantity);
    }
}
