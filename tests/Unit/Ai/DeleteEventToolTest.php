<?php

namespace Tests\Unit\Ai;

use App\Ai\Tools\DeleteEvent;
use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class DeleteEventToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_handle_deletes_the_event(): void
    {
        $user = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Dentist appointment',
            'start_at' => now()->addDay(),
        ]);

        $tool = new DeleteEvent($user);
        $result = $tool->handle(new Request(['event_id' => $event->id]));

        $this->assertStringContainsString('✓', $result);
        $this->assertStringContainsString('Dentist appointment', $result);
        $this->assertDatabaseMissing('calendar_events', ['id' => $event->id]);
    }

    public function test_handle_returns_error_for_unknown_event(): void
    {
        $user = User::factory()->withFamily()->create();
        $tool = new DeleteEvent($user);

        $result = $tool->handle(new Request(['event_id' => 99999]));

        $this->assertStringContainsString('Error', $result);
    }

    public function test_handle_cannot_delete_other_family_event(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $event = CalendarEvent::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
            'title' => 'Private event',
            'start_at' => now()->addDay(),
        ]);

        $tool = new DeleteEvent($user);
        $result = $tool->handle(new Request(['event_id' => $event->id]));

        $this->assertStringContainsString('Error', $result);
        $this->assertDatabaseHas('calendar_events', ['id' => $event->id]);
    }

    public function test_description_is_not_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->assertNotEmpty((new DeleteEvent($user))->description());
    }
}
