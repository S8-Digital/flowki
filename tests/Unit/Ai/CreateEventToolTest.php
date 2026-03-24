<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\CreateEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class CreateEventToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_creates_a_calendar_event(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateEvent($user);

        $result = $tool->handle(new Request([
            'title' => 'Doctor appointment',
            'start_at' => '2025-07-15 10:00:00',
        ]));

        $this->assertStringContainsString('Doctor appointment', $result);
        $this->assertDatabaseHas('calendar_events', [
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Doctor appointment',
        ]);
    }

    public function test_handle_stores_description_when_provided(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateEvent($user);

        $tool->handle(new Request([
            'title' => 'Meeting',
            'start_at' => '2025-07-15 10:00:00',
            'description' => 'Annual review',
        ]));

        $this->assertDatabaseHas('calendar_events', [
            'title' => 'Meeting',
            'description' => 'Annual review',
        ]);
    }

    public function test_handle_stores_location_when_provided(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateEvent($user);

        $tool->handle(new Request([
            'title' => 'Conference',
            'start_at' => '2025-08-01 09:00:00',
            'location' => 'London ExCel',
        ]));

        $this->assertDatabaseHas('calendar_events', [
            'title' => 'Conference',
            'location' => 'London ExCel',
        ]);
    }

    public function test_handle_stores_end_at_when_provided(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateEvent($user);

        $tool->handle(new Request([
            'title' => 'Workshop',
            'start_at' => '2025-08-01 09:00:00',
            'end_at' => '2025-08-01 17:00:00',
        ]));

        $this->assertDatabaseHas('calendar_events', [
            'title' => 'Workshop',
        ]);
    }

    public function test_handle_sets_is_all_day_to_false_by_default(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateEvent($user);

        $tool->handle(new Request([
            'title' => 'Quick event',
            'start_at' => '2025-08-01 09:00:00',
        ]));

        $this->assertDatabaseHas('calendar_events', [
            'title' => 'Quick event',
            'is_all_day' => false,
        ]);
    }

    public function test_handle_can_create_all_day_event(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateEvent($user);

        $tool->handle(new Request([
            'title' => 'School Holiday',
            'start_at' => '2025-08-12',
            'is_all_day' => true,
        ]));

        $this->assertDatabaseHas('calendar_events', [
            'title' => 'School Holiday',
            'is_all_day' => true,
        ]);
    }

    public function test_handle_returns_confirmation_message(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateEvent($user);

        $result = $tool->handle(new Request([
            'title' => 'Birthday party',
            'start_at' => '2025-09-01 15:00:00',
        ]));

        $this->assertStringContainsString('✓', $result);
        $this->assertStringContainsString('Birthday party', $result);
    }

    public function test_handle_stores_recurrence_when_provided(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateEvent($user);

        $tool->handle(new Request([
            'title' => 'Weekly standup',
            'start_at' => '2025-09-01 10:00:00',
            'recurrence' => 'weekly',
        ]));

        $this->assertDatabaseHas('calendar_events', [
            'title' => 'Weekly standup',
            'recurrence' => 'weekly',
        ]);
    }

    public function test_handle_stores_color_when_provided(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateEvent($user);

        $tool->handle(new Request([
            'title' => 'Team event',
            'start_at' => '2025-09-10 09:00:00',
            'color' => '#6366f1',
        ]));

        $this->assertDatabaseHas('calendar_events', [
            'title' => 'Team event',
            'color' => '#6366f1',
        ]);
    }

    public function test_handle_response_includes_event_id(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateEvent($user);

        $result = $tool->handle(new Request([
            'title' => 'Test event',
            'start_at' => '2025-10-01 08:00:00',
        ]));

        $this->assertMatchesRegularExpression('/ID: \d+/', $result);
    }

    public function test_handle_syncs_attendees_from_same_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $user->family_id]);
        $tool = new CreateEvent($user);

        $result = $tool->handle(new Request([
            'title' => 'Family meeting',
            'start_at' => '2025-10-01 10:00:00',
            'attendee_ids' => [$member->id],
        ]));

        $this->assertStringContainsString('✓', $result);
        $event = \App\Models\CalendarEvent::where('title', 'Family meeting')->first();
        $this->assertTrue($event->attendees->contains($member->id));
    }

    public function test_handle_rejects_attendees_from_another_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $outsider = User::factory()->withFamily()->create();
        $tool = new CreateEvent($user);

        $result = $tool->handle(new Request([
            'title' => 'Private event',
            'start_at' => '2025-10-01 10:00:00',
            'attendee_ids' => [$outsider->id],
        ]));

        $this->assertStringContainsString('Error', $result);
        $this->assertStringContainsString((string) $outsider->id, $result);
    }

    public function test_description_is_non_empty_string(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateEvent($user);

        $this->assertNotEmpty($tool->description());
    }
}
