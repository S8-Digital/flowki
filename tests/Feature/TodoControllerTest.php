<?php

namespace Tests\Feature;

use App\Enums\Priority;
use App\Enums\TodoCategory;
use App\Enums\TodoStatus;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoControllerTest extends TestCase
{
    use RefreshDatabase;

    // ── index ─────────────────────────────────────────────────────────────────

    public function test_guests_cannot_view_todos(): void
    {
        $this->get(route('todos.index'))->assertRedirect(route('login'));
    }

    public function test_user_without_family_cannot_view_todos(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user)->get(route('todos.index'))->assertForbidden();
    }

    public function test_authenticated_user_can_view_todos_index(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)->get(route('todos.index'))->assertOk();
    }

    // ── store ──────────────────────────────────────────────────────────────────

    public function test_guests_cannot_create_todos(): void
    {
        $this->post(route('todos.store'), [])->assertRedirect(route('login'));
    }

    public function test_user_without_family_cannot_create_todo(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->actingAs($user)
            ->post(route('todos.store'), $this->validTodoData())
            ->assertForbidden();
    }

    public function test_user_can_create_todo(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('todos.store'), $this->validTodoData())
            ->assertRedirect();

        $this->assertDatabaseHas('todos', [
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Buy groceries',
        ]);
    }

    public function test_todo_store_validates_required_fields(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('todos.store'), [])
            ->assertSessionHasErrors(['title', 'category', 'priority', 'status']);
    }

    public function test_todo_store_validates_enum_values(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('todos.store'), array_merge($this->validTodoData(), ['priority' => 'invalid']))
            ->assertSessionHasErrors('priority');
    }

    // ── update ─────────────────────────────────────────────────────────────────

    public function test_user_can_update_own_todo(): void
    {
        $user = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->patch(route('todos.update', $todo), array_merge($this->validTodoData(), ['title' => 'Updated title']))
            ->assertRedirect();

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

        $this->actingAs($user)
            ->patch(route('todos.update', $todo), $this->validTodoData())
            ->assertForbidden();
    }

    // ── destroy ────────────────────────────────────────────────────────────────

    public function test_user_can_delete_own_todo(): void
    {
        $user = User::factory()->withFamily()->create();
        $todo = Todo::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->delete(route('todos.destroy', $todo))
            ->assertRedirect();

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

        $this->actingAs($user)
            ->delete(route('todos.destroy', $todo))
            ->assertForbidden();
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    /** @return array<string, string> */
    private function validTodoData(): array
    {
        return [
            'title' => 'Buy groceries',
            'description' => null,
            'category' => TodoCategory::Personal->value,
            'priority' => Priority::Medium->value,
            'status' => TodoStatus::Pending->value,
        ];
    }
}
