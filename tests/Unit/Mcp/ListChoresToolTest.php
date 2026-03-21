<?php

namespace Tests\Unit\Mcp;

use App\Enums\ChoreFrequency;
use App\Mcp\Tools\ListChoresTool;
use App\Models\Chore;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Mcp\Request;
use Tests\TestCase;

class ListChoresToolTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_error_when_user_has_no_family(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $tool = new ListChoresTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('Error', (string) $response->content());
    }

    public function test_returns_no_chores_message_when_empty(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        $tool = new ListChoresTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('No chores found', (string) $response->content());
    }

    public function test_lists_family_chores(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Vacuum living room',
        ]);

        $tool = new ListChoresTool;
        $response = $tool->handle(new Request([]));

        $this->assertStringContainsString('Vacuum living room', (string) $response->content());
    }

    public function test_filters_chores_by_frequency(): void
    {
        $user = User::factory()->withFamily()->create();
        $this->actingAs($user);

        Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Weekly vacuum',
            'frequency' => ChoreFrequency::Weekly,
        ]);
        Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Monthly deep clean',
            'frequency' => ChoreFrequency::Monthly,
        ]);

        $tool = new ListChoresTool;
        $response = $tool->handle(new Request(['frequency' => ChoreFrequency::Weekly->value]));

        $this->assertStringContainsString('Weekly vacuum', (string) $response->content());
        $this->assertStringNotContainsString('Monthly deep clean', (string) $response->content());
    }
}
