<?php

namespace Tests\Feature;

use App\Models\CalendarEvent;
use App\Models\Chore;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalendarEventControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_calendar(): void
    {
        $this->get(route('calendar.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_calendar(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)->get(route('calendar.index'))->assertOk();
    }

    public function test_family_schedule_requires_authentication(): void
    {
        $this->get(route('calendar.family'))->assertRedirect(route('login'));
    }

    public function test_family_schedule_returns_inertia_page(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->get(route('calendar.family'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Calendar/Index'));
    }

    public function test_family_schedule_passes_initial_view_prop(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->get(route('calendar.family'))
            ->assertInertia(fn ($page) => $page
                ->component('Calendar/Index')
                ->where('initialView', 'family')
            );
    }

    public function test_family_schedule_accepts_date_parameter(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->get(route('calendar.family', ['date' => '2024-06-15']))
            ->assertInertia(fn ($page) => $page
                ->component('Calendar/Index')
                ->where('initialDate', '2024-06-15')
            );
    }

    public function test_family_schedule_returns_members(): void
    {
        $user = User::factory()->withFamily()->create();
        $member = User::factory()->asMemberOf($user->family)->create();

        $this->actingAs($user)
            ->get(route('calendar.family'))
            ->assertInertia(fn ($page) => $page
                ->component('Calendar/Index')
                ->has('members', 2)
            );
    }

    public function test_family_schedule_returns_events(): void
    {
        $user = User::factory()->withFamily()->create();

        CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->get(route('calendar.family'))
            ->assertInertia(fn ($page) => $page
                ->component('Calendar/Index')
                ->has('events', 1)
            );
    }

    public function test_family_schedule_returns_todos(): void
    {
        $user = User::factory()->withFamily()->create();

        Todo::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'due_date' => '2024-06-15 09:00:00',
        ]);

        $this->actingAs($user)
            ->get(route('calendar.family'))
            ->assertInertia(fn ($page) => $page
                ->component('Calendar/Index')
                ->has('todos', 1)
            );
    }

    public function test_family_schedule_returns_chores(): void
    {
        $user = User::factory()->withFamily()->create();

        Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'next_due_date' => '2024-06-15 08:00:00',
        ]);

        $this->actingAs($user)
            ->get(route('calendar.family'))
            ->assertInertia(fn ($page) => $page
                ->component('Calendar/Index')
                ->has('chores', 1)
            );
    }

    public function test_family_schedule_defaults_to_today(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->travelTo(now()->startOfDay(), function () use ($user) {
            $this->actingAs($user)
                ->get(route('calendar.family'))
                ->assertInertia(fn ($page) => $page
                    ->component('Calendar/Index')
                    ->where('initialDate', now()->toDateString())
                );
        });
    }

    public function test_guests_cannot_store_event(): void
    {
        $this->post(route('calendar.store'), [])->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_store_event(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('calendar.store'), [
                'title' => 'Team Standup',
                'start_at' => now()->addDay()->toIso8601String(),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('calendar_events', [
            'title' => 'Team Standup',
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);
    }

    public function test_store_requires_title(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('calendar.store'), ['start_at' => now()->addDay()->toIso8601String()])
            ->assertSessionHasErrors('title');
    }

    public function test_store_requires_start_at(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('calendar.store'), ['title' => 'No Start'])
            ->assertSessionHasErrors('start_at');
    }

    public function test_store_validates_end_at_is_after_start_at(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('calendar.store'), [
                'title' => 'Bad Dates',
                'start_at' => now()->addDays(2)->toIso8601String(),
                'end_at' => now()->addDay()->toIso8601String(),
            ])
            ->assertSessionHasErrors('end_at');
    }

    public function test_store_syncs_attendees(): void
    {
        $user = User::factory()->withFamily()->create();
        $member = User::factory()->asMemberOf($user->family)->create();

        $this->actingAs($user)
            ->post(route('calendar.store'), [
                'title' => 'Birthday Party',
                'start_at' => now()->addDay()->toIso8601String(),
                'attendee_ids' => [$member->id],
            ])
            ->assertRedirect();

        $event = CalendarEvent::where('title', 'Birthday Party')->firstOrFail();
        $this->assertTrue($event->attendees()->where('users.id', $member->id)->exists());
    }

    public function test_guests_cannot_update_event(): void
    {
        $event = CalendarEvent::factory()->create();

        $this->patch(route('calendar.update', $event), [])->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_update_own_event(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Old Title',
        ]);

        $this->actingAs($user)
            ->patch(route('calendar.update', $event), [
                'title' => 'Updated Title',
                'start_at' => now()->addDay()->toIso8601String(),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('calendar_events', ['id' => $event->id, 'title' => 'Updated Title']);
    }

    public function test_guests_cannot_move_event(): void
    {
        $event = CalendarEvent::factory()->create();

        $this->patch(route('calendar.move', $event), [])->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_move_event(): void
    {
        $user = User::factory()->withFamily()->create();
        $newStart = now()->addDays(5)->toIso8601String();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->patch(route('calendar.move', $event), ['start_at' => $newStart])
            ->assertRedirect();
    }

    public function test_move_requires_start_at(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->patch(route('calendar.move', $event), [])
            ->assertSessionHasErrors('start_at');
    }

    public function test_guests_cannot_delete_event(): void
    {
        $event = CalendarEvent::factory()->create();

        $this->delete(route('calendar.destroy', $event))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_delete_own_event(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->delete(route('calendar.destroy', $event))
            ->assertRedirect();

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

        $this->actingAs($user)
            ->delete(route('calendar.destroy', $event))
            ->assertForbidden();
    }
}
