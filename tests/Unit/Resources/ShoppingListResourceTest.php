<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\ShoppingListResource;
use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class ShoppingListResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_resource_returns_expected_keys(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create(['family_id' => $user->family_id]);
        $resource = (new ShoppingListResource($list))->toArray(new Request);

        $this->assertArrayHasKey('id', $resource);
        $this->assertArrayHasKey('name', $resource);
        $this->assertArrayHasKey('is_shared', $resource);
        $this->assertArrayHasKey('family_id', $resource);
        $this->assertArrayHasKey('created_at', $resource);
        $this->assertArrayHasKey('updated_at', $resource);
    }

    public function test_is_shared_is_included(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'is_shared' => true,
        ]);

        $resource = (new ShoppingListResource($list))->toArray(new Request);

        $this->assertTrue($resource['is_shared']);
    }

    public function test_items_are_included_when_loaded(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create(['family_id' => $user->family_id]);
        ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'added_by' => $user->id,
        ]);
        $list->load('items');

        $resource = (new ShoppingListResource($list))->toArray(new Request);

        $this->assertCount(1, $resource['items']);
    }

    public function test_creator_is_included_when_loaded(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);
        $list->load('creator');

        $resource = (new ShoppingListResource($list))->toArray(new Request);

        $this->assertNotEmpty($resource['creator']);
        $this->assertEquals($user->id, $resource['creator']['id']);
    }

    public function test_items_count_is_included_when_counted(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create(['family_id' => $user->family_id]);
        ShoppingItem::factory()->create(['shopping_list_id' => $list->id, 'added_by' => $user->id]);
        ShoppingItem::factory()->create(['shopping_list_id' => $list->id, 'added_by' => $user->id]);

        $listWithCount = ShoppingList::withCount('items')->find($list->id);
        $resource = (new ShoppingListResource($listWithCount))->toArray(new Request);

        $this->assertEquals(2, $resource['items_count']);
    }
}
