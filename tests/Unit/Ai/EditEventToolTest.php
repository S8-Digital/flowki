<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\EditEvent;
use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class EditEventToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_updates_event_title(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Old title',
            'start_at' => now()->addDay(),
        ]);

        $tool = new EditEvent($user);
        $result = $tool->handle(new Request([
            'event_id' => $event->id,
            'title' => 'New title',
        ]));

        $this->assertStringContainsString('✓', $result);
        $this->assertStringContainsString('New title', $result);
        $this->assertDatabaseHas('calendar_events', [
            'id' => $event->id,
            'title' => 'New title',
        ]);
    }

    public function test_handle_updates_location_and_description(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Meeting',
            'start_at' => now()->addDay(),
        ]);

        $tool = new EditEvent($user);
        $tool->handle(new Request([
            'event_id' => $event->id,
            'location' => 'Conference Room A',
            'description' => 'Quarterly review',
        ]));

        $this->assertDatabaseHas('calendar_events', [
            'id' => $event->id,
            'location' => 'Conference Room A',
            'description' => 'Quarterly review',
        ]);
    }

    public function test_handle_syncs_attendees(): void
    {
        $user = User::factory()->withFamily()->create();
        $member = User::factory()->create(['family_id' => $user->family_id]);
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Party',
            'start_at' => now()->addDay(),
        ]);

        $tool = new EditEvent($user);
        $tool->handle(new Request([
            'event_id' => $event->id,
            'attendee_ids' => [$member->id],
        ]));

        $this->assertDatabaseHas('calendar_event_user', [
            'calendar_event_id' => $event->id,
            'user_id' => $member->id,
        ]);
    }

    public function test_handle_returns_error_for_unknown_event(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new EditEvent($user);

        $result = $tool->handle(new Request(['event_id' => 99999, 'title' => 'X']));

        $this->assertStringContainsString('Error', $result);
    }

    public function test_handle_cannot_edit_other_family_event(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Private event',
            'start_at' => now()->addDay(),
        ]);

        $tool = new EditEvent($user);
        $result = $tool->handle(new Request(['event_id' => $event->id, 'title' => 'Hacked']));

        $this->assertStringContainsString('Error', $result);
        $this->assertDatabaseHas('calendar_events', ['id' => $event->id, 'title' => 'Private event']);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertNotEmpty((new EditEvent($user))->description());
    }
}
