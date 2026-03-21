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

    public function test_description_is_non_empty_string(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new CreateEvent($user);

        $this->assertNotEmpty($tool->description());
    }
}
