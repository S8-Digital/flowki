<?php

namespace Tests\Feature\Mobile;

use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShoppingControllerTest extends TestCase
{
    use RefreshDatabase;

    // ── index ──────────────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_list_shopping_lists(): void
    {
        $this->getJson(route('mobile.shopping.index'))->assertUnauthorized();
    }

    public function test_user_without_family_cannot_list_shopping_lists(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.shopping.index'))
            ->assertForbidden();
    }

    public function test_user_can_list_family_shopping_lists(): void
    {
        $user = User::factory()->withFamily()->create();
        ShoppingList::factory()->count(2)->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.shopping.index'));

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_user_does_not_see_other_family_shopping_lists(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();

        ShoppingList::factory()->count(3)->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.shopping.index'));

        $response->assertOk()->assertJsonCount(0, 'data');
    }

    // ── store ──────────────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_create_shopping_list(): void
    {
        $this->postJson(route('mobile.shopping.store'), ['name' => 'Test'])->assertUnauthorized();
    }

    public function test_user_can_create_shopping_list(): void
    {
        $user = User::factory()->withFamily()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.shopping.store'), ['name' => 'Weekly Groceries']);

        $response->assertCreated()
            ->assertJsonFragment(['name' => 'Weekly Groceries']);

        $this->assertDatabaseHas('shopping_lists', [
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'name' => 'Weekly Groceries',
        ]);
    }

    public function test_shopping_list_store_requires_name(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.shopping.store'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    // ── show ───────────────────────────────────────────────────────────────────

    public function test_user_can_view_own_family_shopping_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.shopping.show', $list));

        $response->assertOk()
            ->assertJsonFragment(['id' => $list->id]);
    }

    public function test_user_cannot_view_another_familys_shopping_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.shopping.show', $list))
            ->assertForbidden();
    }

    // ── destroy (list) ─────────────────────────────────────────────────────────

    public function test_user_can_delete_own_family_shopping_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson(route('mobile.shopping.destroy', $list))
            ->assertNoContent();

        $this->assertDatabaseMissing('shopping_lists', ['id' => $list->id]);
    }

    public function test_user_cannot_delete_another_familys_shopping_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson(route('mobile.shopping.destroy', $list))
            ->assertForbidden();

        $this->assertDatabaseHas('shopping_lists', ['id' => $list->id]);
    }

    // ── storeItem ──────────────────────────────────────────────────────────────

    public function test_user_can_add_item_to_shopping_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.shopping.items.store', $list), [
                'name' => 'Organic Milk',
                'quantity' => '2 litres',
            ]);

        $response->assertCreated()
            ->assertJsonFragment(['name' => 'Organic Milk']);

        $this->assertDatabaseHas('shopping_items', [
            'shopping_list_id' => $list->id,
            'name' => 'Organic Milk',
        ]);
    }

    public function test_item_store_requires_name(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.shopping.items.store', $list), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    public function test_user_cannot_add_item_to_another_familys_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.shopping.items.store', $list), ['name' => 'Milk'])
            ->assertForbidden();
    }

    // ── updateItem ─────────────────────────────────────────────────────────────

    public function test_user_can_update_a_shopping_item(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);
        $item = ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'added_by' => $user->id,
            'name' => 'Old name',
        ]);

        $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.shopping.items.update', [$list, $item]), ['name' => 'New name'])
            ->assertOk()
            ->assertJsonFragment(['name' => 'New name']);

        $this->assertDatabaseHas('shopping_items', ['id' => $item->id, 'name' => 'New name']);
    }

    // ── toggleItem ─────────────────────────────────────────────────────────────

    public function test_user_can_toggle_a_shopping_item(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);
        $item = ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'added_by' => $user->id,
            'is_checked' => false,
        ]);

        $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.shopping.items.toggle', [$list, $item]))
            ->assertOk()
            ->assertJsonFragment(['is_checked' => true]);

        $this->assertDatabaseHas('shopping_items', ['id' => $item->id, 'is_checked' => true]);
    }

    public function test_toggling_a_checked_item_unchecks_it(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);
        $item = ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'added_by' => $user->id,
            'is_checked' => true,
        ]);

        $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.shopping.items.toggle', [$list, $item]))
            ->assertOk()
            ->assertJsonFragment(['is_checked' => false]);
    }

    // ── destroyItem ────────────────────────────────────────────────────────────

    public function test_user_can_delete_a_shopping_item(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);
        $item = ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'added_by' => $user->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson(route('mobile.shopping.items.destroy', [$list, $item]))
            ->assertNoContent();

        $this->assertDatabaseMissing('shopping_items', ['id' => $item->id]);
    }

    public function test_user_cannot_delete_item_from_another_familys_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);
        $item = ShoppingItem::factory()->create([
            'shopping_list_id' => $list->id,
            'added_by' => $other->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson(route('mobile.shopping.items.destroy', [$list, $item]))
            ->assertForbidden();

        $this->assertDatabaseHas('shopping_items', ['id' => $item->id]);
    }
}
