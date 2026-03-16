<?php

namespace Tests\Feature;

use App\Models\Family;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FamilyLocationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_family_location(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->patch(route('family.update'), [
                'name' => $user->family->name,
                'location_name' => 'London',
                'latitude' => 51.5074,
                'longitude' => -0.1278,
            ])
            ->assertRedirect();

        $family = $user->family->fresh();
        $this->assertEquals('London', $family->location_name);
        $this->assertEquals(51.5074, $family->latitude);
        $this->assertEquals(-0.1278, $family->longitude);
    }

    public function test_admin_can_clear_family_location(): void
    {
        $user = User::factory()->withFamily()->create();

        $user->family->update([
            'location_name' => 'London',
            'latitude' => 51.5074,
            'longitude' => -0.1278,
        ]);

        $this->actingAs($user)
            ->patch(route('family.update'), [
                'name' => $user->family->name,
                'location_name' => null,
            ])
            ->assertRedirect();

        $family = $user->family->fresh();
        $this->assertNull($family->location_name);
    }

    public function test_location_name_max_length_is_validated(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->patch(route('family.update'), [
                'name' => $user->family->name,
                'location_name' => str_repeat('x', 256),
            ])
            ->assertSessionHasErrors('location_name');
    }

    public function test_latitude_must_be_between_minus_90_and_90(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->patch(route('family.update'), [
                'name' => $user->family->name,
                'location_name' => 'London',
                'latitude' => 999,
                'longitude' => 0,
            ])
            ->assertSessionHasErrors('latitude');
    }

    public function test_longitude_must_be_between_minus_180_and_180(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->patch(route('family.update'), [
                'name' => $user->family->name,
                'location_name' => 'London',
                'latitude' => 0,
                'longitude' => 999,
            ])
            ->assertSessionHasErrors('longitude');
    }

    public function test_non_admin_cannot_update_family_location(): void
    {
        $admin = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $admin->family_id]);
        $admin->family->members()->attach($member->id, ['role' => 'member']);
        $member->syncRoles(['Member']);

        $this->actingAs($member)
            ->patch(route('family.update'), [
                'name' => $admin->family->name,
                'location_name' => 'Paris',
            ])
            ->assertForbidden();
    }

    public function test_guests_cannot_update_family_location(): void
    {
        $this->patch(route('family.update'), ['name' => 'Test', 'location_name' => 'London'])
            ->assertRedirect(route('login'));
    }
}
