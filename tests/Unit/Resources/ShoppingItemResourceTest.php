<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\ShoppingItemResource;
use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class ShoppingItemResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_resource_returns_expected_keys(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create(['family_id' => $user->family_id]);
        $item = ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'added_by' => $user->id,
        ]);

        $resource = (new ShoppingItemResource($item))->toArray(new Request);

        $this->assertArrayHasKey('id', $resource);
        $this->assertArrayHasKey('name', $resource);
        $this->assertArrayHasKey('quantity', $resource);
        $this->assertArrayHasKey('category', $resource);
        $this->assertArrayHasKey('is_checked', $resource);
        $this->assertArrayHasKey('shopping_list_id', $resource);
        $this->assertArrayHasKey('created_at', $resource);
    }

    public function test_is_checked_is_boolean(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create(['family_id' => $user->family_id]);
        $item = ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'added_by' => $user->id,
            'is_checked' => false,
        ]);

        $resource = (new ShoppingItemResource($item))->toArray(new Request);

        $this->assertIsBool($resource['is_checked']);
    }

    public function test_added_by_is_included_when_loaded(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create(['family_id' => $user->family_id]);
        $item = ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'added_by' => $user->id,
        ]);
        $item->load('addedBy');

        $resource = (new ShoppingItemResource($item))->toArray(new Request);

        $this->assertNotEmpty($resource['added_by']);
        $this->assertEquals($user->id, $resource['added_by']['id']);
    }

    public function test_quantity_can_be_null(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create(['family_id' => $user->family_id]);
        $item = ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'added_by' => $user->id,
            'quantity' => null,
        ]);

        $resource = (new ShoppingItemResource($item))->toArray(new Request);

        $this->assertNull($resource['quantity']);
    }
}
