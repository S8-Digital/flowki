<?php

namespace Tests\Feature\Mobile;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_view_notifications(): void
    {
        $this->getJson(route('mobile.notifications.index'))->assertUnauthorized();
    }

    public function test_user_can_list_their_notifications(): void
    {
        $user = User::factory()->withFamily()->create();

        $user->notifications()->create([
            'id' => (string) \Str::uuid(),
            'type' => 'App\\Notifications\\TodoAssigned',
            'data' => ['type' => 'todo_assigned', 'todo_id' => 1, 'todo_title' => 'Test todo'],
            'read_at' => null,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.notifications.index'));

        $response->assertOk()
            ->assertJsonStructure([
                'notifications' => [['id', 'type', 'data', 'read_at', 'created_at']],
                'unread_count',
            ])
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('notifications.0.data.todo_title', 'Test todo');
    }

    public function test_notifications_list_only_includes_current_users_notifications(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();

        $user->notifications()->create([
            'id' => (string) \Str::uuid(),
            'type' => 'App\\Notifications\\TodoAssigned',
            'data' => ['type' => 'todo_assigned', 'todo_id' => 1, 'todo_title' => 'Mine'],
            'read_at' => null,
        ]);

        $other->notifications()->create([
            'id' => (string) \Str::uuid(),
            'type' => 'App\\Notifications\\TodoAssigned',
            'data' => ['type' => 'todo_assigned', 'todo_id' => 2, 'todo_title' => 'Theirs'],
            'read_at' => null,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson(route('mobile.notifications.index'));

        $response->assertOk()
            ->assertJsonCount(1, 'notifications')
            ->assertJsonPath('notifications.0.data.todo_title', 'Mine');
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $user = User::factory()->withFamily()->create();

        $notification = $user->notifications()->create([
            'id' => (string) \Str::uuid(),
            'type' => 'App\\Notifications\\TodoAssigned',
            'data' => ['type' => 'todo_assigned', 'todo_id' => 1, 'todo_title' => 'Test todo'],
            'read_at' => null,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.notifications.read', $notification->id))
            ->assertOk()
            ->assertJsonPath('notification.id', $notification->id);

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $user = User::factory()->withFamily()->create();

        foreach (range(1, 3) as $index) {
            $user->notifications()->create([
                'id' => (string) \Str::uuid(),
                'type' => 'App\\Notifications\\TodoAssigned',
                'data' => ['type' => 'todo_assigned', 'todo_id' => $index, 'todo_title' => "Todo {$index}"],
                'read_at' => null,
            ]);
        }

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.notifications.read-all'))
            ->assertOk()
            ->assertJsonPath('unread_count', 0);

        $this->assertSame(0, $user->unreadNotifications()->count());
    }

    public function test_user_can_delete_notification(): void
    {
        $user = User::factory()->withFamily()->create();

        $id = (string) \Str::uuid();
        $user->notifications()->create([
            'id' => $id,
            'type' => 'App\\Notifications\\TodoAssigned',
            'data' => ['type' => 'todo_assigned', 'todo_id' => 1, 'todo_title' => 'Delete me'],
            'read_at' => null,
        ]);

        $this->actingAs($user, 'sanctum')
            ->deleteJson(route('mobile.notifications.destroy', $id))
            ->assertNoContent();

        $this->assertDatabaseMissing('notifications', ['id' => $id]);
    }

    public function test_user_cannot_read_another_users_notification(): void
    {
        $user = User::factory()->withFamily()->create();
        $other = User::factory()->withFamily()->create();

        $notification = $other->notifications()->create([
            'id' => (string) \Str::uuid(),
            'type' => 'App\\Notifications\\TodoAssigned',
            'data' => ['type' => 'todo_assigned', 'todo_id' => 1, 'todo_title' => 'Nope'],
            'read_at' => null,
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.notifications.read', $notification->id))
            ->assertNotFound();
    }
}
