<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\ChoreResource;
use App\Models\Chore;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class ChoreResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_resource_returns_expected_keys(): void
    {
        $chore = Chore::factory()->create();
        $resource = (new ChoreResource($chore))->toArray(new Request);

        $this->assertArrayHasKey('id', $resource);
        $this->assertArrayHasKey('title', $resource);
        $this->assertArrayHasKey('description', $resource);
        $this->assertArrayHasKey('frequency', $resource);
        $this->assertArrayHasKey('next_due_date', $resource);
        $this->assertArrayHasKey('reminder_enabled', $resource);
        $this->assertArrayHasKey('reminder_lead_time', $resource);
        $this->assertArrayHasKey('family_id', $resource);
        $this->assertArrayHasKey('created_at', $resource);
        $this->assertArrayHasKey('updated_at', $resource);
    }

    public function test_resource_formats_next_due_date_as_datetime_local_string(): void
    {
        $chore = Chore::factory()->create(['next_due_date' => '2025-06-15 10:30:00']);
        $resource = (new ChoreResource($chore))->toArray(new Request);

        $this->assertEquals('2025-06-15T10:30', $resource['next_due_date']);
    }

    public function test_resource_returns_null_when_next_due_date_is_null(): void
    {
        $chore = Chore::factory()->create(['next_due_date' => null]);
        $resource = (new ChoreResource($chore))->toArray(new Request);

        $this->assertNull($resource['next_due_date']);
    }

    public function test_resource_includes_assignees_when_loaded(): void
    {
        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create(['family_id' => $user->family_id]);
        $chore->assignees()->attach($user->id);
        $chore->load('assignees');

        $resource = (new ChoreResource($chore))->toArray(new Request);

        $this->assertIsArray($resource['assignees']);
        $this->assertCount(1, $resource['assignees']);
    }

    public function test_resource_frequency_is_included(): void
    {
        $chore = Chore::factory()->create();
        $resource = (new ChoreResource($chore))->toArray(new Request);

        $this->assertNotNull($resource['frequency']);
    }
}
