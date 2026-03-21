<?php

namespace Tests\Unit\Mcp;

use App\Enums\ChoreFrequency;
use App\Mcp\Tools\CreateChoreTool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Mcp\Request;
use Tests\TestCase;

class CreateChoreToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_error_when_user_has_no_family(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $tool = new CreateChoreTool;
        $response = $tool->handle(new Request(['title' => 'Vacuum']));

        $this->assertStringContainsString('Error', (string) $response->content());
        $this->assertStringContainsString('family', (string) $response->content());
    }

    public function test_returns_error_when_title_is_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new CreateChoreTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('Error', (string) $response->content());
        $this->assertStringContainsString('title', (string) $response->content());
    }

    public function test_creates_chore_with_default_frequency(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new CreateChoreTool;
        $response = $tool->handle(new Request(['title' => 'Vacuum']));

        $this->assertStringContainsString('Vacuum', (string) $response->content());
        $this->assertDatabaseHas('chores', [
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Vacuum',
            'frequency' => ChoreFrequency::Weekly->value,
        ]);
    }

    public function test_creates_chore_with_provided_frequency_and_due_date(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new CreateChoreTool;
        $response = $tool->handle(new Request([
            'title' => 'Mow lawn',
            'description' => 'Front and back yard',
            'frequency' => ChoreFrequency::Monthly->value,
            'next_due_date' => '2026-04-01',
        ]));

        $this->assertStringContainsString('Mow lawn', (string) $response->content());
        $this->assertDatabaseHas('chores', [
            'title' => 'Mow lawn',
            'description' => 'Front and back yard',
            'frequency' => ChoreFrequency::Monthly->value,
        ]);
    }
}
