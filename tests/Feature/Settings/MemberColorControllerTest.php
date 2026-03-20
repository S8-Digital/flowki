<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberColorControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_update_member_color(): void
    {
        $this->patch(route('settings.members.color.update', ['user' => 1]))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_update_member_profile_color(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $admin->family_id]);
        $admin->family->members()->attach($member->id, ['role' => 'Member']);

        $this->actingAs($admin)
            ->patch(route('settings.members.color.update', ['user' => $member->id]), [
                'profile_color' => '#ff0000',
            ])
            ->assertRedirect()
            ->assertSessionHas('status', 'color-updated');

        $this->assertEquals('#ff0000', $member->fresh()->profile_color);
    }

    public function test_admin_can_clear_member_profile_color(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $admin->family_id, 'profile_color' => '#00ff00']);
        $admin->family->members()->attach($member->id, ['role' => 'Member']);

        $this->actingAs($admin)
            ->patch(route('settings.members.color.update', ['user' => $member->id]), [
                'profile_color' => null,
            ])
            ->assertRedirect()
            ->assertSessionHas('status', 'color-updated');

        $this->assertNull($member->fresh()->profile_color);
    }

    public function test_non_admin_cannot_update_member_color(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $admin->family_id]);
        $admin->family->members()->attach($member->id, ['role' => 'Member']);
        $member->syncRoles(['Member']);

        $this->actingAs($member)
            ->patch(route('settings.members.color.update', ['user' => $admin->id]), [
                'profile_color' => '#ff0000',
            ])
            ->assertForbidden();
    }

    public function test_invalid_color_format_is_rejected(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $admin->family_id]);
        $admin->family->members()->attach($member->id, ['role' => 'Member']);

        $this->actingAs($admin)
            ->patch(route('settings.members.color.update', ['user' => $member->id]), [
                'profile_color' => 'not-a-color',
            ])
            ->assertSessionHasErrors('profile_color');
    }

    public function test_updating_color_of_user_not_in_family_returns_404(): void
    {
        $admin = User::factory()->withFamily()->create();
        $outsider = User::factory()->withFamily()->create();

        $this->actingAs($admin)
            ->patch(route('settings.members.color.update', ['user' => $outsider->id]), [
                'profile_color' => '#ff0000',
            ])
            ->assertNotFound();
    }

    public function test_three_letter_hex_color_is_rejected(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $admin->family_id]);
        $admin->family->members()->attach($member->id, ['role' => 'Member']);

        $this->actingAs($admin)
            ->patch(route('settings.members.color.update', ['user' => $member->id]), [
                'profile_color' => '#fff',
            ])
            ->assertSessionHasErrors('profile_color');
    }
}
