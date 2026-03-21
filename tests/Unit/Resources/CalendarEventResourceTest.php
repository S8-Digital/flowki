<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\CalendarEventResource;
use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class CalendarEventResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_resource_returns_expected_keys(): void
    {
        $event = CalendarEvent::factory()->create();
        $resource = (new CalendarEventResource($event))->toArray(new Request);

        $this->assertArrayHasKey('id', $resource);
        $this->assertArrayHasKey('title', $resource);
        $this->assertArrayHasKey('description', $resource);
        $this->assertArrayHasKey('location', $resource);
        $this->assertArrayHasKey('start_at', $resource);
        $this->assertArrayHasKey('end_at', $resource);
        $this->assertArrayHasKey('is_all_day', $resource);
        $this->assertArrayHasKey('recurrence', $resource);
        $this->assertArrayHasKey('reminder_at', $resource);
        $this->assertArrayHasKey('color', $resource);
        $this->assertArrayHasKey('family_id', $resource);
        $this->assertArrayHasKey('created_at', $resource);
        $this->assertArrayHasKey('updated_at', $resource);
    }

    public function test_start_at_is_formatted_as_iso8601(): void
    {
        $event = CalendarEvent::factory()->create(['start_at' => '2025-06-15 10:00:00']);
        $resource = (new CalendarEventResource($event))->toArray(new Request);

        $this->assertStringContainsString('2025-06-15', $resource['start_at']);
    }

    public function test_end_at_is_formatted_as_iso8601_when_present(): void
    {
        $event = CalendarEvent::factory()->create(['end_at' => '2025-06-15 11:00:00']);
        $resource = (new CalendarEventResource($event))->toArray(new Request);

        $this->assertStringContainsString('2025-06-15', $resource['end_at']);
    }

    public function test_end_at_is_null_when_not_set(): void
    {
        $event = CalendarEvent::factory()->create(['end_at' => null]);
        $resource = (new CalendarEventResource($event))->toArray(new Request);

        $this->assertNull($resource['end_at']);
    }

    public function test_attendees_are_included_when_loaded(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create(['family_id' => $user->family_id]);
        $event->attendees()->attach($user->id);
        $event->load('attendees');

        $resource = (new CalendarEventResource($event))->toArray(new Request);

        $this->assertIsArray($resource['attendees']);
        $this->assertCount(1, $resource['attendees']);
    }

    public function test_is_all_day_is_boolean(): void
    {
        $event = CalendarEvent::factory()->create(['is_all_day' => true]);
        $resource = (new CalendarEventResource($event))->toArray(new Request);

        $this->assertIsBool($resource['is_all_day']);
        $this->assertTrue($resource['is_all_day']);
    }
}
