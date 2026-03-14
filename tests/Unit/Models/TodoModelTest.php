<?php

namespace Tests\Unit\Models;

use App\Enums\Priority;
use App\Enums\TodoCategory;
use App\Enums\TodoStatus;
use App\Models\Family;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_todo_belongs_to_family(): void
    {
        $todo = Todo::factory()->create();
        $this->assertInstanceOf(Family::class, $todo->family);
    }

    public function test_todo_belongs_to_creator(): void
    {
        $todo = Todo::factory()->create();
        $this->assertInstanceOf(User::class, $todo->creator);
    }

    public function test_todo_belongs_to_assignee_when_set(): void
    {
        $user = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $user->family_id,
            'assigned_to' => $user->id,
        ]);

        $this->assertInstanceOf(User::class, $todo->assignee);
        $this->assertEquals($user->id, $todo->assignee->id);
    }

    public function test_casts_category_to_enum(): void
    {
        $todo = Todo::factory()->create(['category' => TodoCategory::Home]);
        $this->assertInstanceOf(TodoCategory::class, $todo->fresh()->category);
    }

    public function test_casts_priority_to_enum(): void
    {
        $todo = Todo::factory()->create(['priority' => Priority::High]);
        $this->assertInstanceOf(Priority::class, $todo->fresh()->priority);
    }

    public function test_casts_status_to_enum(): void
    {
        $todo = Todo::factory()->create(['status' => TodoStatus::Pending]);
        $this->assertInstanceOf(TodoStatus::class, $todo->fresh()->status);
    }

    public function test_scope_for_family_filters_by_family(): void
    {
        $familyA = Family::factory()->create();
        $familyB = Family::factory()->create();
        Todo::factory()->count(2)->create(['family_id' => $familyA->id]);
        Todo::factory()->create(['family_id' => $familyB->id]);

        $results = Todo::query()->forFamily($familyA->id)->get();
        $this->assertCount(2, $results);
        $results->each(fn ($t) => $this->assertEquals($familyA->id, $t->family_id));
    }

    public function test_scope_pending_returns_only_pending_todos(): void
    {
        $user = User::factory()->withFamily()->create();
        Todo::factory()->pending()->create(['family_id' => $user->family_id]);
        Todo::factory()->completed()->create(['family_id' => $user->family_id]);

        $pending = Todo::query()->forFamily($user->family_id)->pending()->get();
        $this->assertCount(1, $pending);
        $this->assertEquals(TodoStatus::Pending, $pending->first()->status);
    }

    public function test_scope_search_matches_title(): void
    {
        $user = User::factory()->withFamily()->create();
        Todo::factory()->create(['family_id' => $user->family_id, 'title' => 'Buy milk']);
        Todo::factory()->create(['family_id' => $user->family_id, 'title' => 'Walk the dog']);

        $results = Todo::query()->forFamily($user->family_id)->search('milk')->get();
        $this->assertCount(1, $results);
        $this->assertEquals('Buy milk', $results->first()->title);
    }
}
