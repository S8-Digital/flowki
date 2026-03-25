<?php

namespace Tests\Feature\Mobile;

use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalendarControllerTest extends TestCase
{
    use RefreshDatabase;

    // ── index ──────────────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_list_events(): void
    {
        $this->getJson(route('mobile.calendar.index'))->assertUnauthorized();
    }

    public function test_user_without_family_cannot_list_events(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.calendar.index'))
            ->assertForbidden();
    }

    public function test_user_can_list_family_events(): void
    {
        $user = User::factory()->withFamily()->create();
        CalendarEvent::factory()->count(2)->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.calendar.index'));

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_user_does_not_see_other_family_events(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();

        CalendarEvent::factory()->count(3)->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.calendar.index'));

        $response->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_events_can_be_filtered_by_start_date(): void
    {
        $user = User::factory()->withFamily()->create();

        CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'start_at' => '2030-06-01 09:00:00',
            'end_at' => '2030-06-01 10:00:00',
        ]);

        CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'start_at' => '2030-01-01 09:00:00',
            'end_at' => '2030-01-01 10:00:00',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.calendar.index', ['start' => '2030-05-01']));

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_events_are_returned_with_attendees_and_creator(): void
    {
        $user = User::factory()->withFamily()->create();
        CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.calendar.index'));

        $response->assertOk()
            ->assertJsonStructure(['data' => [['id', 'title', 'start_at', 'creator']]]);
    }

    // ── store ──────────────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_create_event(): void
    {
        $this->postJson(route('mobile.calendar.store'), [])->assertUnauthorized();
    }

    public function test_user_can_create_calendar_event(): void
    {
        $user = User::factory()->withFamily()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.calendar.store'), [
                'title' => 'Team Meeting',
                'start_at' => '2030-03-25 09:00:00',
                'end_at' => '2030-03-25 10:00:00',
            ]);

        $response->assertCreated()
            ->assertJsonFragment(['title' => 'Team Meeting']);

        $this->assertDatabaseHas('calendar_events', [
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Team Meeting',
        ]);
    }

    public function test_event_store_requires_title(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.calendar.store'), [
                'start_at' => '2030-03-25 09:00:00',
                'end_at' => '2030-03-25 10:00:00',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('title');
    }

    public function test_event_store_requires_start_at(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.calendar.store'), [
                'title' => 'Meeting',
                'end_at' => '2030-03-25 10:00:00',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('start_at');
    }

    public function test_event_store_requires_end_at_after_start_at(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.calendar.store'), [
                'title' => 'Bad Event',
                'start_at' => '2030-03-25 10:00:00',
                'end_at' => '2030-03-25 09:00:00',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('end_at');
    }

    // ── update ─────────────────────────────────────────────────────────────────

    public function test_user_can_update_own_family_event(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Old Title',
        ]);

        $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.calendar.update', $event), ['title' => 'New Title'])
            ->assertOk()
            ->assertJsonFragment(['title' => 'New Title']);

        $this->assertDatabaseHas('calendar_events', ['id' => $event->id, 'title' => 'New Title']);
    }

    public function test_user_cannot_update_another_familys_event(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.calendar.update', $event), ['title' => 'Hacked'])
            ->assertForbidden();
    }

    // ── destroy ────────────────────────────────────────────────────────────────

    public function test_user_can_delete_own_family_event(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson(route('mobile.calendar.destroy', $event))
            ->assertNoContent();

        $this->assertDatabaseMissing('calendar_events', ['id' => $event->id]);
    }

    public function test_user_cannot_delete_another_familys_event(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson(route('mobile.calendar.destroy', $event))
            ->assertForbidden();

        $this->assertDatabaseHas('calendar_events', ['id' => $event->id]);
    }
}
