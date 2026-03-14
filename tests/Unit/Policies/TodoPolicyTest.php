<?php

namespace Tests\Unit\Policies;

use App\Models\Todo;
use App\Models\User;
use App\Policies\TodoPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoPolicyTest extends TestCase
{
    use RefreshDatabase;

    private TodoPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new TodoPolicy;
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

    public function test_view_allows_same_family_member(): void
    {
        $user = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create(['family_id' => $user->family_id]);

        $this->assertTrue($this->policy->view($user, $todo));
    }

    public function test_view_denies_different_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create(['family_id' => $other->family_id]);

        $this->assertFalse($this->policy->view($user, $todo));
    }

    public function test_create_allows_admin(): void
    {
        $user = User::factory()->withFamily()->create(); // Admin role
        $this->assertTrue($this->policy->create($user));
    }

    public function test_create_allows_member(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->asMemberOf($admin->family)->create();
        $this->assertTrue($this->policy->create($member));
    }

    public function test_create_denies_guest(): void
    {
        $admin = User::factory()->withFamily()->create();
        $guest = User::factory()->create(['family_id' => $admin->family_id]);
        $guest->syncRoles(['Guest']);
        $this->assertFalse($this->policy->create($guest));
    }

    public function test_create_denies_user_without_family(): void
    {
        $user = User::factory()->create(['family_id' => null]);
        $this->assertFalse($this->policy->create($user));
    }

    public function test_update_allows_member_in_same_family(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->asMemberOf($admin->family)->create();
        $todo = Todo::factory()->create([
            'family_id' => $admin->family_id,
            'created_by' => $admin->id,
        ]);

        $this->assertTrue($this->policy->update($member, $todo));
    }

    public function test_update_denies_guest(): void
    {
        $admin = User::factory()->withFamily()->create();
        $guest = User::factory()->create(['family_id' => $admin->family_id]);
        $guest->syncRoles(['Guest']);
        $todo = Todo::factory()->create([
            'family_id' => $admin->family_id,
            'created_by' => $admin->id,
        ]);

        $this->assertFalse($this->policy->update($guest, $todo));
    }

    public function test_update_denies_different_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create(['family_id' => $other->family_id]);

        $this->assertFalse($this->policy->update($user, $todo));
    }

    public function test_delete_allows_admin(): void
    {
        $user = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->assertTrue($this->policy->delete($user, $todo));
    }

    public function test_delete_allows_member_in_same_family(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->asMemberOf($admin->family)->create();
        $todo = Todo::factory()->create([
            'family_id' => $admin->family_id,
            'created_by' => $admin->id,
        ]);

        $this->assertTrue($this->policy->delete($member, $todo));
    }

    public function test_delete_denies_guest(): void
    {
        $admin = User::factory()->withFamily()->create();
        $guest = User::factory()->create(['family_id' => $admin->family_id]);
        $guest->syncRoles(['Guest']);
        $todo = Todo::factory()->create([
            'family_id' => $admin->family_id,
            'created_by' => $admin->id,
        ]);

        $this->assertFalse($this->policy->delete($guest, $todo));
    }
}
