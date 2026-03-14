<?php

namespace Tests\Unit\Policies;

use App\Models\ShoppingList;
use App\Models\User;
use App\Policies\ShoppingListPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShoppingListPolicyTest extends TestCase
{
    use RefreshDatabase;

    private ShoppingListPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new ShoppingListPolicy;
    }

    public function test_view_any_allows_user_with_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertTrue($this->policy->viewAny($user));
    }

    public function test_view_any_denies_user_without_family(): void
    {
        $user = User::factory()->create(['family_id' => null]);
        $this->assertFalse($this->policy->viewAny($user));
    }

    public function test_view_allows_same_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create(['family_id' => $user->family_id]);

        $this->assertTrue($this->policy->view($user, $list));
    }

    public function test_view_denies_different_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create(['family_id' => $other->family_id]);

        $this->assertFalse($this->policy->view($user, $list));
    }

    public function test_create_allows_user_with_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertTrue($this->policy->create($user));
    }

    public function test_update_allows_creator(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->assertTrue($this->policy->update($user, $list));
    }

    public function test_update_denies_different_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create(['family_id' => $other->family_id]);

        $this->assertFalse($this->policy->update($user, $list));
    }

    public function test_delete_allows_creator(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->assertTrue($this->policy->delete($user, $list));
    }

    public function test_add_item_allows_family_member(): void
    {
        $user = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create(['family_id' => $user->family_id]);

        $this->assertTrue($this->policy->addItem($user, $list));
    }

    public function test_add_item_denies_different_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $list = ShoppingList::factory()->create(['family_id' => $other->family_id]);

        $this->assertFalse($this->policy->addItem($user, $list));
    }
}
