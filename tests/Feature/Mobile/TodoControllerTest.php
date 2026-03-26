<?php

namespace Tests\Feature\Mobile;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoControllerTest extends TestCase
{
    use RefreshDatabase;

    // ── index ──────────────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_list_todos(): void
    {
        $this->getJson(route('mobile.todos.index'))->assertUnauthorized();
    }

    public function test_user_without_family_cannot_list_todos(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.todos.index'))
            ->assertForbidden();
    }

    public function test_user_can_list_family_todos(): void
    {
        $user = User::factory()->withFamily()->create();
        Todo::factory()->count(3)->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.todos.index'));

        $response->assertOk()->assertJsonCount(3, 'data');
    }

    public function test_user_does_not_see_other_family_todos(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();

        Todo::factory()->count(2)->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.todos.index'));

        $response->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_user_can_filter_todos_by_status(): void
    {
        $user = User::factory()->withFamily()->create();
        Todo::factory()->pending()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);
        Todo::factory()->completed()->create(['family_id' => $user->family_id, 'created_by' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.todos.index', ['status' => 'pending']));

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    // ── store ──────────────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_create_todo(): void
    {
        $this->postJson(route('mobile.todos.store'), ['title' => 'Test'])->assertUnauthorized();
    }

    public function test_user_can_create_todo(): void
    {
        $user = User::factory()->withFamily()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.todos.store'), [
                'title' => 'Buy milk',
                'status' => 'pending',
            ]);

        $response->assertCreated()
            ->assertJsonFragment(['title' => 'Buy milk']);

        $this->assertDatabaseHas('todos', [
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Buy milk',
        ]);
    }

    public function test_todo_store_requires_title(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.todos.store'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('title');
    }

    public function test_todo_store_defaults_status_to_pending(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.todos.store'), ['title' => 'Pending task']);

        $this->assertDatabaseHas('todos', [
            'family_id' => $user->family_id,
            'title' => 'Pending task',
            'status' => 'pending',
        ]);
    }

    public function test_todo_store_assigned_to_must_be_family_member(): void
    {
        $user = User::factory()->withFamily()->create();
        $outsider = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.todos.store'), [
                'title' => 'Task',
                'assigned_to' => $outsider->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('assigned_to');
    }

    // ── update ─────────────────────────────────────────────────────────────────

    public function test_user_can_update_own_family_todo(): void
    {
        $user = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Original title',
        ]);

        $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.todos.update', $todo), ['title' => 'Updated title'])
            ->assertOk()
            ->assertJsonFragment(['title' => 'Updated title']);

        $this->assertDatabaseHas('todos', ['id' => $todo->id, 'title' => 'Updated title']);
    }

    public function test_user_cannot_update_another_familys_todo(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.todos.update', $todo), ['title' => 'Hacked'])
            ->assertForbidden();
    }

    public function test_user_can_mark_todo_as_done(): void
    {
        $user = User::factory()->withFamily()->create();
        $todo = Todo::factory()->pending()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->patchJson(route('mobile.todos.update', $todo), ['status' => 'completed'])
            ->assertOk()
            ->assertJsonFragment(['status' => 'completed']);
    }

    // ── destroy ────────────────────────────────────────────────────────────────

    public function test_user_can_delete_own_family_todo(): void
    {
        $user = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson(route('mobile.todos.destroy', $todo))
            ->assertNoContent();

        $this->assertDatabaseMissing('todos', ['id' => $todo->id]);
    }

    public function test_user_cannot_delete_another_familys_todo(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $other->family_id,
            'created_by' => $other->id,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson(route('mobile.todos.destroy', $todo))
            ->assertForbidden();

        $this->assertDatabaseHas('todos', ['id' => $todo->id]);
    }
}
