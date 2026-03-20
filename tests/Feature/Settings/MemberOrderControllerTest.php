<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberOrderControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_update_member_order(): void
    {
        $this->patch(route('settings.members.order.update'))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_update_member_order(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $admin->family_id]);
        $admin->family->members()->attach($member->id, ['role' => 'Member']);

        $this->actingAs($admin)
            ->patch(route('settings.members.order.update'), [
                'member_order' => [$member->id, $admin->id],
            ])
            ->assertRedirect()
            ->assertSessionHas('status', 'member-order-updated');

        $family = $admin->fresh()->family;
        $this->assertEquals([$member->id, $admin->id], $family->getMemberOrder());
    }

    public function test_member_order_must_be_required(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->patch(route('settings.members.order.update'), [])
            ->assertSessionHasErrors('member_order');
    }

    public function test_member_order_entries_must_be_integers(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->patch(route('settings.members.order.update'), [
                'member_order' => ['not-an-int'],
            ])
            ->assertSessionHasErrors('member_order.0');
    }

    public function test_non_admin_cannot_update_member_order(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $admin->family_id]);
        $admin->family->members()->attach($member->id, ['role' => 'Member']);
        $member->syncRoles(['Member']);

        $this->actingAs($member)
            ->patch(route('settings.members.order.update'), [
                'member_order' => [$admin->id, $member->id],
            ])
            ->assertForbidden();
    }

    public function test_member_order_accepts_empty_array(): void
    {
        $user = User::factory()->withFamily()->create();

        // member_order is required, an empty array still passes the required rule
        $this->actingAs($user)
            ->patch(route('settings.members.order.update'), [
                'member_order' => [],
            ])
            ->assertRedirect()
            ->assertSessionHas('status', 'member-order-updated');
    }
}
