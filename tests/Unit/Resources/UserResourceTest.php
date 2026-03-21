<?php

namespace Tests\Unit\Resources;

use App\Enums\FamilyRole;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class UserResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_resource_returns_expected_keys(): void
    {
        $user = User::factory()->withFamily()->create();
        $resource = (new UserResource($user))->toArray(new Request);

        $this->assertArrayHasKey('id', $resource);
        $this->assertArrayHasKey('name', $resource);
        $this->assertArrayHasKey('email', $resource);
        $this->assertArrayHasKey('family_id', $resource);
        $this->assertArrayHasKey('profile_color', $resource);
        $this->assertArrayHasKey('is_pending', $resource);
        $this->assertArrayHasKey('is_child', $resource);
    }

    public function test_resource_returns_correct_user_name(): void
    {
        $user = User::factory()->create(['name' => 'Jane Doe']);
        $resource = (new UserResource($user))->toArray(new Request);

        $this->assertEquals('Jane Doe', $resource['name']);
    }

    public function test_resource_returns_correct_email(): void
    {
        $user = User::factory()->create(['email' => 'jane@example.com']);
        $resource = (new UserResource($user))->toArray(new Request);

        $this->assertEquals('jane@example.com', $resource['email']);
    }

    public function test_profile_color_is_included(): void
    {
        $user = User::factory()->create(['profile_color' => '#ff0000']);
        $resource = (new UserResource($user))->toArray(new Request);

        $this->assertEquals('#ff0000', $resource['profile_color']);
    }

    public function test_profile_color_is_null_when_not_set(): void
    {
        $user = User::factory()->create(['profile_color' => null]);
        $resource = (new UserResource($user))->toArray(new Request);

        $this->assertNull($resource['profile_color']);
    }

    public function test_is_pending_is_false_for_regular_user(): void
    {
        $user = User::factory()->withFamily()->create();
        $resource = (new UserResource($user))->toArray(new Request);

        $this->assertFalse($resource['is_pending']);
    }

    public function test_family_id_is_null_when_user_has_no_family(): void
    {
        $user = User::factory()->create(['family_id' => null]);
        $resource = (new UserResource($user))->toArray(new Request);

        $this->assertNull($resource['family_id']);
    }

    public function test_role_is_included_when_pivot_is_loaded(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $admin->family_id]);
        $admin->family->members()->attach($member->id, ['role' => FamilyRole::Member->value]);

        $userWithPivot = $admin->family->members()->where('users.id', $member->id)->first();
        $resource = (new UserResource($userWithPivot))->toArray(new Request);

        $this->assertEquals(FamilyRole::Member, $resource['role']);
    }
}
