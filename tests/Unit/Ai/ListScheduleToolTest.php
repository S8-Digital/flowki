<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\ListSchedule;
use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class ListScheduleToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_returns_no_shifts_message_when_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ListSchedule($user);

        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('No schedule shifts found', $result);
    }

    public function test_handle_lists_shifts_assigned_to_user(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Morning shift',
            'start_at' => now()->addDay(),
        ]);
        $event->attendees()->attach($user->id);

        $tool = new ListSchedule($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('Morning shift', $result);
    }

    public function test_handle_does_not_list_events_user_is_not_attending(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->create(['family_id' => $user->family_id]);
        $user->family->members()->attach($other->id, ['role' => 'Member']);

        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $other->id,
            'title' => 'Other person shift',
            'start_at' => now()->addDay(),
        ]);
        $event->attendees()->attach($other->id);

        $tool = new ListSchedule($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringNotContainsString('Other person shift', $result);
    }

    public function test_handle_filters_by_from_date(): void
    {
        $user = User::factory()->withFamily()->create();

        $pastEvent = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Past shift',
            'start_at' => now()->subDays(10),
        ]);
        $pastEvent->attendees()->attach($user->id);

        $futureEvent = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Future shift',
            'start_at' => now()->addDays(10),
        ]);
        $futureEvent->attendees()->attach($user->id);

        $tool = new ListSchedule($user);
        $result = $tool->handle(new Request(['from' => now()->toDateString()]));

        $this->assertStringContainsString('Future shift', $result);
        $this->assertStringNotContainsString('Past shift', $result);
    }

    public function test_handle_filters_by_to_date(): void
    {
        $user = User::factory()->withFamily()->create();

        $nearEvent = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Near shift',
            'start_at' => now()->addDay(),
        ]);
        $nearEvent->attendees()->attach($user->id);

        $farEvent = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Far shift',
            'start_at' => now()->addDays(30),
        ]);
        $farEvent->attendees()->attach($user->id);

        $tool = new ListSchedule($user);
        $result = $tool->handle(new Request(['to' => now()->addDays(5)->toDateString()]));

        $this->assertStringContainsString('Near shift', $result);
        $this->assertStringNotContainsString('Far shift', $result);
    }

    public function test_handle_includes_count_in_output(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Work shift',
            'start_at' => now()->addDay(),
        ]);
        $event->attendees()->attach($user->id);

        $tool = new ListSchedule($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('Schedule shifts (1):', $result);
    }

    public function test_description_is_non_empty_string(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ListSchedule($user);

        $this->assertNotEmpty($tool->description());
    }
}
