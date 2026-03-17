<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_notifications(): void
    {
        $this->get(route('notifications.index'))->assertRedirect(route('login'));
    }

    public function test_user_can_view_notifications_page(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->get(route('notifications.index'))
            ->assertOk();
    }

    public function test_recent_notifications_returns_json(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->getJson(route('notifications.recent'))
            ->assertOk()
            ->assertJsonStructure(['notifications', 'unread_count']);
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $user = User::factory()->withFamily()->create();

        /** @var DatabaseNotification $notification */
        $notification = $user->notifications()->create([
            'id' => (string) \Str::uuid(),
            'type' => 'App\\Notifications\\TodoAssigned',
            'data' => ['type' => 'todo_assigned', 'todo_id' => 1, 'todo_title' => 'Test'],
            'read_at' => null,
        ]);

        $this->actingAs($user)
            ->post(route('notifications.read', $notification->id))
            ->assertRedirect();

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_user_can_mark_all_notifications_read(): void
    {
        $user = User::factory()->withFamily()->create();

        for ($i = 0; $i < 3; $i++) {
            $user->notifications()->create([
                'id' => (string) \Str::uuid(),
                'type' => 'App\\Notifications\\TodoAssigned',
                'data' => ['type' => 'todo_assigned', 'todo_id' => $i, 'todo_title' => "Todo {$i}"],
                'read_at' => null,
            ]);
        }

        $this->actingAs($user)
            ->post(route('notifications.read-all'))
            ->assertRedirect();

        $this->assertEquals(0, $user->unreadNotifications()->count());
    }

    public function test_user_can_delete_notification(): void
    {
        $user = User::factory()->withFamily()->create();

        $id = (string) \Str::uuid();

        $user->notifications()->create([
            'id' => $id,
            'type' => 'App\\Notifications\\TodoAssigned',
            'data' => ['type' => 'todo_assigned', 'todo_id' => 1, 'todo_title' => 'Test'],
            'read_at' => null,
        ]);

        $this->actingAs($user)
            ->delete(route('notifications.destroy', $id))
            ->assertRedirect();

        $this->assertDatabaseMissing('notifications', ['id' => $id]);
    }

    public function test_user_cannot_read_another_users_notification(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();

        $id = (string) \Str::uuid();
        $other->notifications()->create([
            'id' => $id,
            'type' => 'App\\Notifications\\TodoAssigned',
            'data' => ['type' => 'todo_assigned', 'todo_id' => 1, 'todo_title' => 'Test'],
            'read_at' => null,
        ]);

        $this->actingAs($user)
            ->post(route('notifications.read', $id))
            ->assertNotFound();
    }
}
