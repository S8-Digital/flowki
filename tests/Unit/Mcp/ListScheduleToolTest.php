<?php

namespace Tests\Unit\Mcp;

use App\Mcp\Tools\ListScheduleTool;
use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Mcp\Request;
use Tests\TestCase;

class ListScheduleToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_error_when_user_has_no_family(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $tool = new ListScheduleTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('Error', (string) $response->content());
    }

    public function test_returns_no_shifts_when_not_an_attendee(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Family event, not my shift',
        ]);

        $tool = new ListScheduleTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('No schedule shifts found', (string) $response->content());
    }

    public function test_lists_events_where_user_is_attendee(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Morning shift',
            'start_at' => '2026-04-01 08:00:00',
        ]);
        $event->attendees()->attach($user->id);

        $tool = new ListScheduleTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('Morning shift', (string) $response->content());
    }

    public function test_filters_schedule_by_date_range(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $aprilShift = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'April shift',
            'start_at' => '2026-04-10 09:00:00',
        ]);
        $aprilShift->attendees()->attach($user->id);

        $juneShift = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'June shift',
            'start_at' => '2026-06-10 09:00:00',
        ]);
        $juneShift->attendees()->attach($user->id);

        $tool = new ListScheduleTool;
        $response = $tool->handle(new Request(['from' => '2026-04-01', 'to' => '2026-05-01']));

        $this->assertStringContainsString('April shift', (string) $response->content());
        $this->assertStringNotContainsString('June shift', (string) $response->content());
    }
}
