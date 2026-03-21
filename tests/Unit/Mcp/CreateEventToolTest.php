<?php

namespace Tests\Unit\Mcp;

use App\Mcp\Tools\CreateEventTool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Mcp\Request;
use Tests\TestCase;

class CreateEventToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_error_when_user_has_no_family(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $tool = new CreateEventTool;
        $response = $tool->handle(new Request(['title' => 'Lunch', 'start_at' => '2026-04-01T12:00:00']));

        $this->assertStringContainsString('Error', (string) $response->content());
        $this->assertStringContainsString('family', (string) $response->content());
    }

    public function test_returns_error_when_start_at_is_missing(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new CreateEventTool;
        $response = $tool->handle(new Request(['title' => 'Meeting']));

        $this->assertStringContainsString('Error', (string) $response->content());
    }

    public function test_creates_event_with_required_fields(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new CreateEventTool;
        $response = $tool->handle(new Request(['title' => 'Dentist', 'start_at' => '2026-04-01T10:00:00']));

        $this->assertStringContainsString('Dentist', (string) $response->content());
        $this->assertDatabaseHas('calendar_events', [
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Dentist',
        ]);
    }

    public function test_creates_all_day_event(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new CreateEventTool;
        $tool->handle(new Request(['title' => 'Public Holiday', 'start_at' => '2026-04-25T00:00:00', 'is_all_day' => true]));

        $this->assertDatabaseHas('calendar_events', ['title' => 'Public Holiday', 'is_all_day' => true]);
    }
}
