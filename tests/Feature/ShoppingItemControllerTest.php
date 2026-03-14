<?php

namespace Tests\Feature;

use App\Enums\ShoppingItemCategory;
use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShoppingItemControllerTest extends TestCase
{
    use RefreshDatabase;

    private function makeListFor(User $user): ShoppingList
    {
        return ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);
    }

    public function test_user_can_add_item_to_own_family_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = $this->makeListFor($user);

        $this->actingAs($user)
            ->post(route('shopping.items.store', $list), [
                'name' => 'Milk',
                'quantity' => '1 gallon',
                'category' => ShoppingItemCategory::Groceries->value,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('shopping_items', [
            'shopping_list_id' => $list->id,
            'name' => 'Milk',
        ]);
    }

    public function test_item_store_validates_required_fields(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = $this->makeListFor($user);

        $this->actingAs($user)
            ->post(route('shopping.items.store', $list), [])
            ->assertSessionHasErrors(['name', 'category']);
    }

    public function test_user_cannot_add_item_to_another_familys_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $this->actingAs($user)
            ->post(route('shopping.items.store', $list), [
                'name' => 'Milk',
                'category' => ShoppingItemCategory::Groceries->value,
            ])
            ->assertForbidden();
    }

    public function test_user_can_toggle_item(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = $this->makeListFor($user);
        $item = ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'is_checked' => false,
        ]);

        $this->actingAs($user)
            ->patch(route('shopping.items.toggle', [$list, $item]))
            ->assertRedirect();

        $this->assertTrue($item->fresh()->is_checked);
    }

    public function test_user_can_delete_item_from_own_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = $this->makeListFor($user);
        $item = ShoppingItem::factory()->create(['shopping_list_id' => $list->id]);

        $this->actingAs($user)
            ->delete(route('shopping.items.destroy', [$list, $item]))
            ->assertRedirect();

        $this->assertDatabaseMissing('shopping_items', ['id' => $item->id]);
    }
}
