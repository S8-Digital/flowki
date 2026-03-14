<?php

namespace Tests\Unit\Models;

use App\Models\Family;
use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShoppingListModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_shopping_list_belongs_to_family(): void
    {
        $list = ShoppingList::factory()->create();
        $this->assertInstanceOf(Family::class, $list->family);
    }

    public function test_shopping_list_belongs_to_creator(): void
    {
        $list = ShoppingList::factory()->create();
        $this->assertInstanceOf(User::class, $list->creator);
    }

    public function test_shopping_list_has_many_items(): void
    {
        $list = ShoppingList::factory()->create();
        ShoppingItem::factory()->count(3)->create(['shopping_list_id' => $list->id]);

        $this->assertCount(3, $list->fresh()->items);
    }

    public function test_scope_for_family_filters_correctly(): void
    {
        $familyA = Family::factory()->create();
        $familyB = Family::factory()->create();
        ShoppingList::factory()->count(2)->create(['family_id' => $familyA->id]);
        ShoppingList::factory()->create(['family_id' => $familyB->id]);

        $results = ShoppingList::query()->forFamily($familyA->id)->get();
        $this->assertCount(2, $results);
    }

    public function test_is_shared_cast_to_boolean(): void
    {
        $list = ShoppingList::factory()->create(['is_shared' => true]);
        $this->assertIsBool($list->fresh()->is_shared);
        $this->assertTrue($list->fresh()->is_shared);
    }
}
