<?php

namespace Tests\Feature;

use App\Models\ShoppingList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShoppingListControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_shopping_lists(): void
    {
        $this->get(route('shopping.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_shopping_lists(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)->get(route('shopping.index'))->assertOk();
    }

    public function test_user_can_create_shopping_list(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('shopping.store'), ['name' => 'Weekly Groceries', 'is_shared' => true])
            ->assertRedirect();

        $this->assertDatabaseHas('shopping_lists', [
            'family_id' => $user->family_id,
            'name' => 'Weekly Groceries',
        ]);
    }

    public function test_shopping_list_store_validates_required_name(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('shopping.store'), [])
            ->assertSessionHasErrors('name');
    }

    public function test_user_can_view_own_family_shopping_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)->get(route('shopping.show', $list))->assertOk();
    }

    public function test_user_cannot_view_another_familys_shopping_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $this->actingAs($user)->get(route('shopping.show', $list))->assertForbidden();
    }

    public function test_user_can_delete_own_shopping_list(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)->delete(route('shopping.destroy', $list))->assertRedirect();
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

        $this->actingAs($user)->delete(route('shopping.destroy', $list))->assertForbidden();
    }
}
