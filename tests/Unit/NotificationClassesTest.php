<?php

namespace Tests\Unit;

use App\Models\Chore;
use App\Models\Todo;
use App\Models\User;
use App\Notifications\ChoreAssigned;
use App\Notifications\ChoreCompleted;
use App\Notifications\TodoAssigned;
use App\Notifications\TodoCompleted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationClassesTest extends TestCase
{
    use RefreshDatabase;

    public function test_todo_assigned_via_includes_database(): void
    {
        $user = User::factory()->create([
            'notification_preferences' => ['email' => false, 'push' => false],
        ]);
        $todo = Todo::factory()->create();

        $notification = new TodoAssigned($todo);
        $via = $notification->via($user);

        $this->assertContains('database', $via);
    }

    public function test_todo_assigned_includes_mail_when_enabled(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'notification_preferences' => ['email' => true, 'push' => false],
        ]);
        $todo = Todo::factory()->create();

        $notification = new TodoAssigned($todo);
        $via = $notification->via($user);

        $this->assertContains('mail', $via);
    }

    public function test_todo_assigned_excludes_mail_when_disabled(): void
    {
        $user = User::factory()->create([
            'notification_preferences' => ['email' => false, 'push' => false],
        ]);
        $todo = Todo::factory()->create();

        $notification = new TodoAssigned($todo);
        $via = $notification->via($user);

        $this->assertNotContains('mail', $via);
    }

    public function test_todo_assigned_to_array_contains_expected_keys(): void
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->create(['title' => 'Buy milk']);

        $notification = new TodoAssigned($todo);
        $data = $notification->toArray($user);

        $this->assertEquals('todo_assigned', $data['type']);
        $this->assertEquals($todo->id, $data['todo_id']);
        $this->assertEquals('Buy milk', $data['todo_title']);
    }

    public function test_todo_completed_to_array_contains_expected_keys(): void
    {
        $user = User::factory()->create();
        $creator = User::factory()->create(['name' => 'Alice']);
        $completedBy = User::factory()->create(['name' => 'Bob']);
        $todo = Todo::factory()->create(['title' => 'Clean dishes', 'created_by' => $creator->id]);

        $notification = new TodoCompleted($todo, $completedBy);
        $data = $notification->toArray($user);

        $this->assertEquals('todo_completed', $data['type']);
        $this->assertEquals($todo->id, $data['todo_id']);
        $this->assertEquals('Bob', $data['completed_by_name']);
    }

    public function test_chore_assigned_to_array_contains_expected_keys(): void
    {
        $user = User::factory()->create();
        $chore = Chore::factory()->create(['title' => 'Vacuum living room']);

        $notification = new ChoreAssigned($chore);
        $data = $notification->toArray($user);

        $this->assertEquals('chore_assigned', $data['type']);
        $this->assertEquals($chore->id, $data['chore_id']);
        $this->assertEquals('Vacuum living room', $data['chore_title']);
    }

    public function test_chore_completed_to_array_contains_expected_keys(): void
    {
        $user = User::factory()->create();
        $creator = User::factory()->create(['name' => 'Alice']);
        $completedBy = User::factory()->create(['name' => 'Charlie']);
        $chore = Chore::factory()->create(['title' => 'Take out trash', 'created_by' => $creator->id]);

        $notification = new ChoreCompleted($chore, $completedBy);
        $data = $notification->toArray($user);

        $this->assertEquals('chore_completed', $data['type']);
        $this->assertEquals($chore->id, $data['chore_id']);
        $this->assertEquals('Charlie', $data['completed_by_name']);
    }
}
