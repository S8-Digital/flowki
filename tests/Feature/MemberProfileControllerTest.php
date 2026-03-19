<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberProfileControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_member_profile_page(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->get(route('settings.members.profile.edit', $user))->assertRedirect(route('login'));
    }

    public function test_admin_can_view_member_profile_page_for_family_member(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->asMemberOf($family)->create();

        $this->actingAs($admin)
            ->get(route('settings.members.profile.edit', $member))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('settings/MemberProfile')
                ->where('member.id', $member->id)
                ->where('member.name', $member->name)
                ->has('member.profile_color')
            );
    }

    public function test_non_admin_cannot_view_member_profile_page(): void
    {
        $admin = User::factory()->withFamily()->create();
        $family = $admin->family;
        $member = User::factory()->asMemberOf($family)->create();

        $this->actingAs($member)
            ->get(route('settings.members.profile.edit', $admin))
            ->assertForbidden();
    }

    public function test_cannot_view_member_profile_for_user_outside_family(): void
    {
        $admin = User::factory()->withFamily()->create();
        $outsider = User::factory()->withFamily()->create();

        $this->actingAs($admin)
            ->get(route('settings.members.profile.edit', $outsider))
            ->assertNotFound();
    }
}
