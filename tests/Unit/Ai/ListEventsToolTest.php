<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\ListEvents;
use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class ListEventsToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_returns_no_events_message_when_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ListEvents($user);

        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('No events found', $result);
    }

    public function test_handle_lists_family_events(): void
    {
        $user = User::factory()->withFamily()->create();
        CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Family dinner',
            'start_at' => now()->addDays(2),
        ]);

        $tool = new ListEvents($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('Family dinner', $result);
        $this->assertMatchesRegularExpression('/\[ID:\d+\]/', $result);
    }

    public function test_handle_filters_by_date_range(): void
    {
        $user = User::factory()->withFamily()->create();
        CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Near event',
            'start_at' => now()->addDays(1),
        ]);
        CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Far event',
            'start_at' => now()->addDays(30),
        ]);

        $tool = new ListEvents($user);
        $result = $tool->handle(new Request([
            'from' => now()->toIso8601String(),
            'to' => now()->addDays(7)->toIso8601String(),
        ]));

        $this->assertStringContainsString('Near event', $result);
        $this->assertStringNotContainsString('Far event', $result);
    }

    public function test_handle_does_not_return_other_family_events(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        CalendarEvent::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Other family event',
            'start_at' => now()->addDays(1),
        ]);

        $tool = new ListEvents($user);
        $result = $tool->handle(new Request([]));

        $this->assertStringContainsString('No events found', $result);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new ListEvents($user);

        $this->assertNotEmpty($tool->description());
    }
}
