<?php

namespace Tests\Unit\Models;

use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class CalendarEventModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_calendar_event_belongs_to_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create(['family_id' => $user->family_id]);

        $this->assertEquals($user->family_id, $event->family_id);
    }

    public function test_calendar_event_belongs_to_creator(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);
        $event->load('creator');

        $this->assertEquals($user->id, $event->creator->id);
    }

    public function test_calendar_event_has_attendees_relationship(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create(['family_id' => $user->family_id]);
        $event->attendees()->attach($user->id);

        $this->assertCount(1, $event->attendees);
    }

    public function test_start_at_is_cast_to_datetime(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'start_at' => '2025-06-15 10:00:00',
        ]);

        $this->assertInstanceOf(Carbon::class, $event->fresh()->start_at);
    }

    public function test_end_at_is_cast_to_datetime(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'end_at' => '2025-06-15 11:00:00',
        ]);

        $this->assertInstanceOf(Carbon::class, $event->fresh()->end_at);
    }

    public function test_is_all_day_cast_to_boolean(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'is_all_day' => true,
        ]);

        $this->assertIsBool($event->fresh()->is_all_day);
        $this->assertTrue($event->fresh()->is_all_day);
    }

    public function test_for_family_scope_filters_by_family(): void
    {
        $user1 = User::factory()->withFamily()->create();
        $user2 = User::factory()->withFamily()->create();
        CalendarEvent::factory()->create(['family_id' => $user1->family_id]);
        CalendarEvent::factory()->create(['family_id' => $user2->family_id]);

        $events = CalendarEvent::forFamily($user1->family_id)->get();
        $this->assertCount(1, $events);
        $this->assertEquals($user1->family_id, $events->first()->family_id);
    }

    public function test_can_filter_events_starting_after_now(): void
    {
        $user = User::factory()->withFamily()->create();
        CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'start_at' => now()->addDay(),
        ]);
        CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'start_at' => now()->subDay(),
        ]);

        $upcoming = CalendarEvent::forFamily($user->family_id)
            ->where('start_at', '>', now())
            ->get();

        $this->assertCount(1, $upcoming);
    }
}
