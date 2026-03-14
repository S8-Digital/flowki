<?php

namespace Tests\Unit\Models;

use App\Enums\FamilyRole;
use App\Models\Family;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FamilyModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_family_auto_generates_invite_code_on_create(): void
    {
        $creator = User::factory()->create();
        $family = Family::create(['name' => 'Test Family', 'created_by' => $creator->id]);

        $this->assertNotEmpty($family->invite_code);
        $this->assertEquals(8, strlen($family->invite_code));
    }

    public function test_family_has_members_relationship(): void
    {
        $user = User::factory()->withFamily()->create();
        $family = $user->family;

        $this->assertTrue($family->members()->where('users.id', $user->id)->exists());
    }

    public function test_family_has_todos_relationship(): void
    {
        $user = User::factory()->withFamily()->create();
        \App\Models\Todo::factory()->create(['family_id' => $user->family_id]);

        $this->assertCount(1, $user->family->todos);
    }

    public function test_family_has_chores_relationship(): void
    {
        $user = User::factory()->withFamily()->create();
        \App\Models\Chore::factory()->create(['family_id' => $user->family_id]);

        $this->assertCount(1, $user->family->chores);
    }

    public function test_family_has_shopping_lists_relationship(): void
    {
        $user = User::factory()->withFamily()->create();
        \App\Models\ShoppingList::factory()->create(['family_id' => $user->family_id]);

        $this->assertCount(1, $user->family->shoppingLists);
    }

    public function test_regenerate_invite_code_produces_new_code(): void
    {
        $user = User::factory()->withFamily()->create();
        $family = $user->family;
        $oldCode = $family->invite_code;

        $family->regenerateInviteCode();

        $this->assertNotEquals($oldCode, $family->fresh()->invite_code);
        $this->assertEquals(8, strlen($family->fresh()->invite_code));
    }

    public function test_user_is_admin_in_own_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertTrue($user->isAdminIn($user->family));
    }

    public function test_regular_member_is_not_admin(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $admin->family_id]);
        $admin->family->members()->attach($member->id, ['role' => FamilyRole::Member->value]);

        $this->assertFalse($member->isAdminIn($admin->family));
    }
}
