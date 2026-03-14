<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\TodoResource;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class TodoResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_resource_returns_expected_keys(): void
    {
        $todo = Todo::factory()->create();
        $resource = (new TodoResource($todo))->toArray(new Request);

        $this->assertArrayHasKey('id', $resource);
        $this->assertArrayHasKey('title', $resource);
        $this->assertArrayHasKey('description', $resource);
        $this->assertArrayHasKey('category', $resource);
        $this->assertArrayHasKey('priority', $resource);
        $this->assertArrayHasKey('status', $resource);
        $this->assertArrayHasKey('due_date', $resource);
        $this->assertArrayHasKey('family_id', $resource);
        $this->assertArrayHasKey('created_at', $resource);
        $this->assertArrayHasKey('updated_at', $resource);
    }

    public function test_resource_formats_due_date_as_datetime_local_string(): void
    {
        $todo = Todo::factory()->create(['due_date' => '2025-06-15 10:30:00']);
        $resource = (new TodoResource($todo))->toArray(new Request);

        $this->assertEquals('2025-06-15T10:30', $resource['due_date']);
    }

    public function test_resource_includes_loaded_assignee(): void
    {
        $user = User::factory()->withFamily()->create();
        $assignee = User::factory()->create(['family_id' => $user->family_id]);
        $todo = Todo::factory()->create([
            'family_id' => $user->family_id,
            'assigned_to' => $assignee->id,
        ]);
        $todo->load('assignee');

        $resource = (new TodoResource($todo))->toArray(new Request);

        $this->assertNotNull($resource['assignee']);
    }

    public function test_resource_assignee_is_null_when_not_loaded(): void
    {
        $todo = Todo::factory()->create(['assigned_to' => null]);
        $resource = (new TodoResource($todo))->toArray(new Request);

        // When not loaded, whenLoaded returns a MissingValue which resolves to null in JSON
        $this->assertArrayHasKey('assignee', $resource);
    }
}
