<?php

namespace Tests\Unit\Mcp;

use App\Mcp\Tools\ListEventsTool;
use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Mcp\Request;
use Tests\TestCase;

class ListEventsToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_error_when_user_has_no_family(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $tool = new ListEventsTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('Error', (string) $response->content());
    }

    public function test_returns_no_events_message_when_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new ListEventsTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('No events found', (string) $response->content());
    }

    public function test_lists_family_events(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Team Barbecue',
        ]);

        $tool = new ListEventsTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('Team Barbecue', (string) $response->content());
    }

    public function test_filters_events_by_date_range(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'April Event',
            'start_at' => '2026-04-15 10:00:00',
        ]);
        CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'June Event',
            'start_at' => '2026-06-15 10:00:00',
        ]);

        $tool = new ListEventsTool;
        $response = $tool->handle(new Request(['from' => '2026-04-01', 'to' => '2026-05-01']));

        $this->assertStringContainsString('April Event', (string) $response->content());
        $this->assertStringNotContainsString('June Event', (string) $response->content());
    }

    public function test_does_not_list_other_family_events(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $this->actingAs($user);

        CalendarEvent::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Other family event',
        ]);

        $tool = new ListEventsTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('No events found', (string) $response->content());
    }
}
