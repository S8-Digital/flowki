<?php

namespace Tests\Feature\Mobile;

use App\Enums\FamilyRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FamilyControllerTest extends TestCase
{
    use RefreshDatabase;

    // ── show ───────────────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_view_family(): void
    {
        $this->getJson(route('mobile.family.show'))->assertUnauthorized();
    }

    public function test_user_without_family_gets_404(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.family.show'))
            ->assertNotFound()
            ->assertJsonFragment(['message' => 'No family found.']);
    }

    public function test_user_can_view_own_family(): void
    {
        $user = User::factory()->withFamily()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.family.show'));

        $response->assertOk()
            ->assertJsonStructure(['id', 'name', 'invite_code', 'members'])
            ->assertJsonFragment(['id' => $user->family_id]);
    }

    public function test_family_response_includes_members(): void
    {
        $user = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $user->family_id]);
        $user->family->members()->attach($member->id, ['role' => FamilyRole::Member->value]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.family.show'));

        $response->assertOk();

        $members = $response->json('members');
        $this->assertCount(2, $members);
    }

    public function test_family_member_response_includes_role(): void
    {
        $user = User::factory()->withFamily()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.family.show'));

        $members = $response->json('members');
        $this->assertArrayHasKey('role', $members[0]);
    }

    // ── store ──────────────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_create_family(): void
    {
        $this->postJson(route('mobile.family.store'), ['name' => 'Test'])->assertUnauthorized();
    }

    public function test_user_can_create_a_family(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.family.store'), ['name' => 'The Johnsons']);

        $response->assertCreated()
            ->assertJsonFragment(['name' => 'The Johnsons']);

        $this->assertDatabaseHas('families', ['name' => 'The Johnsons', 'created_by' => $user->id]);
        $this->assertNotNull($user->fresh()->family_id);
    }

    public function test_family_store_assigns_admin_role_to_creator(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.family.store'), ['name' => 'The Smiths'])
            ->assertCreated();

        $user->refresh();
        $pivot = $user->family->members()->where('users.id', $user->id)->first();
        $this->assertEquals(FamilyRole::Admin->value, $pivot->pivot->role);
    }

    public function test_family_store_requires_name(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.family.store'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    public function test_user_already_in_family_cannot_create_another(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.family.store'), ['name' => 'Second Family'])
            ->assertUnprocessable()
            ->assertJsonFragment(['message' => 'You already belong to a family.']);
    }

    // ── join ───────────────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_join_family(): void
    {
        $this->postJson(route('mobile.family.join'), ['invite_code' => 'ABCD1234'])->assertUnauthorized();
    }

    public function test_user_can_join_family_with_valid_invite_code(): void
    {
        $owner = User::factory()->withFamily()->create();
        $family = $owner->family;
        $joiner = User::factory()->create(['family_id' => null]);

        $response = $this->actingAs($joiner, 'sanctum')
            ->postJson(route('mobile.family.join'), ['invite_code' => $family->invite_code]);

        $response->assertOk()
            ->assertJsonFragment(['id' => $family->id]);

        $this->assertEquals($family->id, $joiner->fresh()->family_id);
    }

    public function test_joining_assigns_member_role(): void
    {
        $owner = User::factory()->withFamily()->create();
        $family = $owner->family;
        $joiner = User::factory()->create(['family_id' => null]);

        $this->actingAs($joiner, 'sanctum')
            ->postJson(route('mobile.family.join'), ['invite_code' => $family->invite_code])
            ->assertOk();

        $pivot = $family->fresh()->members()->where('users.id', $joiner->id)->first();
        $this->assertEquals(FamilyRole::Member->value, $pivot->pivot->role);
    }

    public function test_join_with_invalid_invite_code_returns_422(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.family.join'), ['invite_code' => 'INVALIDXX'])
            ->assertUnprocessable()
            ->assertJsonFragment(['message' => 'Invalid invite code.']);
    }

    public function test_join_requires_invite_code(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.family.join'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('invite_code');
    }

    public function test_user_already_in_family_cannot_join_another(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.family.join'), ['invite_code' => $other->family->invite_code])
            ->assertUnprocessable()
            ->assertJsonFragment(['message' => 'You already belong to a family.']);
    }

    public function test_invite_code_matching_is_case_insensitive(): void
    {
        $owner = User::factory()->withFamily()->create();
        $family = $owner->family;
        $joiner = User::factory()->create(['family_id' => null]);

        $response = $this->actingAs($joiner, 'sanctum')
            ->postJson(route('mobile.family.join'), [
                'invite_code' => strtolower($family->invite_code),
            ]);

        $response->assertOk();
    }
}
