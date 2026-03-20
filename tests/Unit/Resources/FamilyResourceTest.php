<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\FamilyResource;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class FamilyResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_resource_returns_expected_keys(): void
    {
        $user = User::factory()->withFamily()->create();
        $family = $user->family;
        $resource = (new FamilyResource($family))->toArray(new Request);

        $this->assertArrayHasKey('id', $resource);
        $this->assertArrayHasKey('name', $resource);
        $this->assertArrayHasKey('invite_code', $resource);
        $this->assertArrayHasKey('location_name', $resource);
        $this->assertArrayHasKey('latitude', $resource);
        $this->assertArrayHasKey('longitude', $resource);
        $this->assertArrayHasKey('created_at', $resource);
        $this->assertArrayHasKey('member_order', $resource);
    }

    public function test_resource_includes_correct_family_name(): void
    {
        $user = User::factory()->withFamily()->create();
        $family = $user->family;
        $family->update(['name' => 'The Smiths']);

        $resource = (new FamilyResource($family))->toArray(new Request);

        $this->assertEquals('The Smiths', $resource['name']);
    }

    public function test_resource_includes_invite_code(): void
    {
        $user = User::factory()->withFamily()->create();
        $family = $user->family;

        $resource = (new FamilyResource($family))->toArray(new Request);

        $this->assertNotNull($resource['invite_code']);
        $this->assertEquals($family->invite_code, $resource['invite_code']);
    }

    public function test_members_are_not_included_when_relation_not_loaded(): void
    {
        $user = User::factory()->withFamily()->create();
        $family = $user->family;

        $resource = (new FamilyResource($family))->toArray(new Request);

        $this->assertArrayNotHasKey('members', $resource);
    }

    public function test_members_are_included_when_relation_is_loaded(): void
    {
        $user = User::factory()->withFamily()->create();
        $family = $user->family;
        $family->load('members');

        $resource = (new FamilyResource($family))->toArray(new Request);

        $this->assertArrayHasKey('members', $resource);
        $this->assertCount(1, $resource['members']);
    }

    public function test_member_order_defaults_to_empty_array(): void
    {
        $user = User::factory()->withFamily()->create();
        $family = $user->family;

        $resource = (new FamilyResource($family))->toArray(new Request);

        $this->assertIsArray($resource['member_order']);
        $this->assertEmpty($resource['member_order']);
    }

    public function test_location_fields_are_null_when_not_set(): void
    {
        $user = User::factory()->withFamily()->create();
        $family = $user->family;
        $family->update(['location_name' => null, 'latitude' => null, 'longitude' => null]);

        $resource = (new FamilyResource($family->fresh()))->toArray(new Request);

        $this->assertNull($resource['location_name']);
        $this->assertNull($resource['latitude']);
        $this->assertNull($resource['longitude']);
    }
}
