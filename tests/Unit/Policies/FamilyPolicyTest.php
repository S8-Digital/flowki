<?php

namespace Tests\Unit\Policies;

use App\Enums\FamilyRole;
use App\Models\Family;
use App\Models\User;
use App\Policies\FamilyPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FamilyPolicyTest extends TestCase
{
    use RefreshDatabase;

    private FamilyPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new FamilyPolicy;
    }

    public function test_view_allows_family_member(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->assertTrue($this->policy->view($user, $user->family));
    }

    public function test_view_denies_non_member(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();

        $this->assertFalse($this->policy->view($user, $other->family));
    }

    public function test_update_allows_admin(): void
    {
        $admin = User::factory()->withFamily()->create();

        $this->assertTrue($this->policy->update($admin, $admin->family));
    }

    public function test_update_denies_member(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $admin->family_id]);
        $admin->family->members()->attach($member->id, ['role' => FamilyRole::Member->value]);

        $this->assertFalse($this->policy->update($member, $admin->family));
    }

    public function test_delete_allows_creator(): void
    {
        $user = User::factory()->withFamily()->create();
        $family = Family::where('created_by', $user->id)->firstOrFail();

        $this->assertTrue($this->policy->delete($user, $family));
    }

    public function test_delete_denies_non_creator(): void
    {
        $admin = User::factory()->withFamily()->create();
        $other = User::factory()->create(['family_id' => $admin->family_id]);
        $admin->family->members()->attach($other->id, ['role' => FamilyRole::Member->value]);

        $this->assertFalse($this->policy->delete($other, $admin->family));
    }

    public function test_manage_members_allows_admin(): void
    {
        $admin = User::factory()->withFamily()->create();

        $this->assertTrue($this->policy->manageMembers($admin, $admin->family));
    }

    public function test_manage_members_denies_member(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $admin->family_id]);
        $admin->family->members()->attach($member->id, ['role' => FamilyRole::Member->value]);

        $this->assertFalse($this->policy->manageMembers($member, $admin->family));
    }
}
