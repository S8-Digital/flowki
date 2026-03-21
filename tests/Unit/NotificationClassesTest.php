<?php

namespace Tests\Unit;

use App\Models\Chore;
use App\Models\Todo;
use App\Models\User;
use App\Notifications\ChoreAssigned;
use App\Notifications\ChoreCompleted;
use App\Notifications\ChoreDueReminder;
use App\Notifications\TodoAssigned;
use App\Notifications\TodoCompleted;
use App\Notifications\TodoDueReminder;
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

    public function test_chore_completed_includes_mail_when_enabled(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'notification_preferences' => ['email' => true, 'push' => false],
        ]);
        $completedBy = User::factory()->create(['name' => 'Dave']);
        $chore = Chore::factory()->create(['title' => 'Mop floors']);

        $notification = new ChoreCompleted($chore, $completedBy);
        $via = $notification->via($user);

        $this->assertContains('mail', $via);
    }

    public function test_chore_completed_excludes_mail_when_disabled(): void
    {
        $user = User::factory()->create([
            'notification_preferences' => ['email' => false, 'push' => false],
        ]);
        $completedBy = User::factory()->create();
        $chore = Chore::factory()->create();

        $notification = new ChoreCompleted($chore, $completedBy);
        $via = $notification->via($user);

        $this->assertNotContains('mail', $via);
    }

    public function test_chore_completed_to_mail_contains_chore_title(): void
    {
        $user = User::factory()->create(['name' => 'Eve']);
        $completedBy = User::factory()->create(['name' => 'Frank']);
        $chore = Chore::factory()->create(['title' => 'Wash windows']);

        $notification = new ChoreCompleted($chore, $completedBy);
        $mail = $notification->toMail($user);

        $this->assertStringContainsString('Wash windows', $mail->subject);
    }

    public function test_chore_completed_to_fcm_returns_expected_structure(): void
    {
        $user = User::factory()->create();
        $completedBy = User::factory()->create(['name' => 'Grace']);
        $chore = Chore::factory()->create(['title' => 'Cook dinner']);

        $notification = new ChoreCompleted($chore, $completedBy);
        $fcm = $notification->toFcm($user);

        $this->assertEquals('Chore completed', $fcm['title']);
        $this->assertStringContainsString('Cook dinner', $fcm['body']);
        $this->assertEquals('chore_completed', $fcm['data']['type']);
        $this->assertEquals((string) $chore->id, $fcm['data']['chore_id']);
    }

    public function test_todo_completed_includes_mail_when_enabled(): void
    {
        $user = User::factory()->create([
            'email' => 'todo@example.com',
            'notification_preferences' => ['email' => true, 'push' => false],
        ]);
        $completedBy = User::factory()->create();
        $todo = Todo::factory()->create();

        $notification = new TodoCompleted($todo, $completedBy);
        $via = $notification->via($user);

        $this->assertContains('mail', $via);
    }

    public function test_todo_completed_excludes_mail_when_disabled(): void
    {
        $user = User::factory()->create([
            'notification_preferences' => ['email' => false, 'push' => false],
        ]);
        $completedBy = User::factory()->create();
        $todo = Todo::factory()->create();

        $notification = new TodoCompleted($todo, $completedBy);
        $via = $notification->via($user);

        $this->assertNotContains('mail', $via);
    }

    public function test_todo_completed_to_mail_contains_todo_title(): void
    {
        $user = User::factory()->create(['name' => 'Hannah']);
        $completedBy = User::factory()->create(['name' => 'Ivan']);
        $todo = Todo::factory()->create(['title' => 'Book dentist']);

        $notification = new TodoCompleted($todo, $completedBy);
        $mail = $notification->toMail($user);

        $this->assertStringContainsString('Book dentist', $mail->subject);
    }

    public function test_todo_completed_to_fcm_returns_expected_structure(): void
    {
        $user = User::factory()->create();
        $completedBy = User::factory()->create(['name' => 'Jane']);
        $todo = Todo::factory()->create(['title' => 'Fix bike']);

        $notification = new TodoCompleted($todo, $completedBy);
        $fcm = $notification->toFcm($user);

        $this->assertEquals('Task completed', $fcm['title']);
        $this->assertStringContainsString('Fix bike', $fcm['body']);
        $this->assertEquals('todo_completed', $fcm['data']['type']);
        $this->assertEquals((string) $todo->id, $fcm['data']['todo_id']);
    }

    public function test_chore_due_reminder_via_includes_database(): void
    {
        $user = User::factory()->create([
            'notification_preferences' => ['email' => false, 'push' => false],
        ]);
        $chore = Chore::factory()->create();

        $notification = new ChoreDueReminder($chore);
        $via = $notification->via($user);

        $this->assertContains('database', $via);
    }

    public function test_chore_due_reminder_includes_mail_when_enabled(): void
    {
        $user = User::factory()->create([
            'email' => 'chore@example.com',
            'notification_preferences' => ['email' => true, 'push' => false],
        ]);
        $chore = Chore::factory()->create(['title' => 'Water plants']);

        $notification = new ChoreDueReminder($chore);
        $via = $notification->via($user);

        $this->assertContains('mail', $via);
    }

    public function test_chore_due_reminder_excludes_mail_when_disabled(): void
    {
        $user = User::factory()->create([
            'notification_preferences' => ['email' => false, 'push' => false],
        ]);
        $chore = Chore::factory()->create();

        $notification = new ChoreDueReminder($chore);
        $via = $notification->via($user);

        $this->assertNotContains('mail', $via);
    }

    public function test_chore_due_reminder_to_mail_contains_chore_title(): void
    {
        $user = User::factory()->create(['name' => 'Karl']);
        $chore = Chore::factory()->create(['title' => 'Clean oven']);

        $notification = new ChoreDueReminder($chore);
        $mail = $notification->toMail($user);

        $this->assertStringContainsString('Clean oven', $mail->subject);
    }

    public function test_chore_due_reminder_to_fcm_returns_expected_structure(): void
    {
        $user = User::factory()->create();
        $chore = Chore::factory()->create(['title' => 'Iron clothes']);

        $notification = new ChoreDueReminder($chore);
        $fcm = $notification->toFcm($user);

        $this->assertEquals('Chore due soon', $fcm['title']);
        $this->assertStringContainsString('Iron clothes', $fcm['body']);
        $this->assertEquals('chore_reminder', $fcm['data']['type']);
        $this->assertEquals((string) $chore->id, $fcm['data']['chore_id']);
    }

    public function test_chore_due_reminder_to_array_returns_expected_data(): void
    {
        $user = User::factory()->create();
        $chore = Chore::factory()->create(['title' => 'Sweep porch']);

        $notification = new ChoreDueReminder($chore);
        $data = $notification->toArray($user);

        $this->assertEquals('chore_reminder', $data['type']);
        $this->assertEquals($chore->id, $data['chore_id']);
        $this->assertEquals('Sweep porch', $data['chore_title']);
    }

    public function test_todo_due_reminder_via_includes_database(): void
    {
        $user = User::factory()->create([
            'notification_preferences' => ['email' => false, 'push' => false],
        ]);
        $todo = Todo::factory()->create();

        $notification = new TodoDueReminder($todo);
        $via = $notification->via($user);

        $this->assertContains('database', $via);
    }

    public function test_todo_due_reminder_includes_mail_when_enabled(): void
    {
        $user = User::factory()->create([
            'email' => 'todo-due@example.com',
            'notification_preferences' => ['email' => true, 'push' => false],
        ]);
        $todo = Todo::factory()->create(['title' => 'Call doctor']);

        $notification = new TodoDueReminder($todo);
        $via = $notification->via($user);

        $this->assertContains('mail', $via);
    }

    public function test_todo_due_reminder_excludes_mail_when_disabled(): void
    {
        $user = User::factory()->create([
            'notification_preferences' => ['email' => false, 'push' => false],
        ]);
        $todo = Todo::factory()->create();

        $notification = new TodoDueReminder($todo);
        $via = $notification->via($user);

        $this->assertNotContains('mail', $via);
    }

    public function test_todo_due_reminder_to_mail_contains_todo_title(): void
    {
        $user = User::factory()->create(['name' => 'Lara']);
        $todo = Todo::factory()->create(['title' => 'Pay bills']);

        $notification = new TodoDueReminder($todo);
        $mail = $notification->toMail($user);

        $this->assertStringContainsString('Pay bills', $mail->subject);
    }

    public function test_todo_due_reminder_to_fcm_returns_expected_structure(): void
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->create(['title' => 'Submit report']);

        $notification = new TodoDueReminder($todo);
        $fcm = $notification->toFcm($user);

        $this->assertEquals('Task due soon', $fcm['title']);
        $this->assertStringContainsString('Submit report', $fcm['body']);
        $this->assertEquals('todo_reminder', $fcm['data']['type']);
        $this->assertEquals((string) $todo->id, $fcm['data']['todo_id']);
    }

    public function test_todo_due_reminder_to_array_returns_expected_data(): void
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->create(['title' => 'Renew licence']);

        $notification = new TodoDueReminder($todo);
        $data = $notification->toArray($user);

        $this->assertEquals('todo_reminder', $data['type']);
        $this->assertEquals($todo->id, $data['todo_id']);
        $this->assertEquals('Renew licence', $data['todo_title']);
    }
}
