<?php

namespace Tests\Unit\Policies;

use App\Enums\FamilyRole;
use App\Models\CalendarEvent;
use App\Models\User;
use App\Policies\CalendarEventPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalendarEventPolicyTest extends TestCase
{
    use RefreshDatabase;

    private CalendarEventPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new CalendarEventPolicy;
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

    public function test_view_allows_same_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create(['family_id' => $user->family_id]);

        $this->assertTrue($this->policy->view($user, $event));
    }

    public function test_view_denies_different_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create(['family_id' => $other->family_id]);

        $this->assertFalse($this->policy->view($user, $event));
    }

    public function test_create_allows_user_with_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertTrue($this->policy->create($user));
    }

    public function test_update_allows_creator(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->assertTrue($this->policy->update($user, $event));
    }

    public function test_update_denies_non_creator_member(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->create(['family_id' => $user->family_id]);
        $user->family->members()->attach($other->id, ['role' => FamilyRole::Member->value]);
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->assertFalse($this->policy->update($other, $event));
    }

    public function test_delete_allows_creator(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->assertTrue($this->policy->delete($user, $event));
    }

    public function test_delete_denies_different_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create(['family_id' => $other->family_id]);

        $this->assertFalse($this->policy->delete($user, $event));
    }
}
