<?php

namespace Tests\Unit\Observers;

use App\Jobs\SyncModelToRtdb;
use App\Models\CalendarEvent;
use App\Models\Chore;
use App\Models\Meal;
use App\Models\ShoppingItem;
use App\Models\ShoppingList;
use App\Models\Todo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class RtdbObserversTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Simulate a configured RTDB URL so observers dispatch jobs in tests.
        config(['firebase.projects.app.database.url' => 'https://test-default-rtdb.firebaseio.com']);
    }

    // ── Todo ──────────────────────────────────────────────────────────────────

    public function test_creating_a_todo_dispatches_sync_job(): void
    {
        Queue::fake();

        $todo = Todo::factory()->create();

        Queue::assertPushed(SyncModelToRtdb::class, function (SyncModelToRtdb $job) use ($todo) {
            return $job->path === "families/{$todo->family_id}/todos/{$todo->id}"
                && $job->data !== null
                && $job->data['id'] === $todo->id;
        });
    }

    public function test_updating_a_todo_dispatches_sync_job(): void
    {
        Queue::fake();

        $todo = Todo::factory()->create();
        Queue::assertPushed(SyncModelToRtdb::class);

        Queue::fake(); // reset
        $todo->update(['title' => 'Updated title']);

        Queue::assertPushed(SyncModelToRtdb::class, function (SyncModelToRtdb $job) use ($todo) {
            return $job->path === "families/{$todo->family_id}/todos/{$todo->id}"
                && $job->data['title'] === 'Updated title';
        });
    }

    public function test_deleting_a_todo_dispatches_remove_job(): void
    {
        Queue::fake();

        $todo = Todo::factory()->create();
        $familyId = $todo->family_id;
        $todoId = $todo->id;

        Queue::fake(); // reset after create
        $todo->delete();

        Queue::assertPushed(SyncModelToRtdb::class, function (SyncModelToRtdb $job) use ($familyId, $todoId) {
            return $job->path === "families/{$familyId}/todos/{$todoId}"
                && $job->data === null;
        });
    }

    public function test_todo_to_sync_array_contains_expected_keys(): void
    {
        Queue::fake();

        $todo = Todo::factory()->create();

        $array = $todo->toSyncArray();

        foreach (['id', 'family_id', 'created_by', 'title', 'status', 'priority', 'updated_at'] as $key) {
            $this->assertArrayHasKey($key, $array, "toSyncArray() is missing key: {$key}");
        }
    }

    // ── Chore ─────────────────────────────────────────────────────────────────

    public function test_creating_a_chore_dispatches_sync_job(): void
    {
        Queue::fake();

        $chore = Chore::factory()->create();

        Queue::assertPushed(SyncModelToRtdb::class, function (SyncModelToRtdb $job) use ($chore) {
            return $job->path === "families/{$chore->family_id}/chores/{$chore->id}"
                && $job->data !== null;
        });
    }

    public function test_deleting_a_chore_dispatches_remove_job(): void
    {
        Queue::fake();

        $chore = Chore::factory()->create();
        $familyId = $chore->family_id;
        $choreId = $chore->id;

        Queue::fake();
        $chore->delete();

        Queue::assertPushed(SyncModelToRtdb::class, function (SyncModelToRtdb $job) use ($familyId, $choreId) {
            return $job->path === "families/{$familyId}/chores/{$choreId}"
                && $job->data === null;
        });
    }

    public function test_chore_to_sync_array_contains_expected_keys(): void
    {
        Queue::fake();

        $chore = Chore::factory()->create();

        $array = $chore->toSyncArray();

        foreach (['id', 'family_id', 'title', 'frequency', 'updated_at'] as $key) {
            $this->assertArrayHasKey($key, $array, "toSyncArray() is missing key: {$key}");
        }
    }

    // ── ShoppingList ──────────────────────────────────────────────────────────

    public function test_creating_a_shopping_list_dispatches_sync_job(): void
    {
        Queue::fake();

        $list = ShoppingList::factory()->create();

        Queue::assertPushed(SyncModelToRtdb::class, function (SyncModelToRtdb $job) use ($list) {
            return $job->path === "families/{$list->family_id}/shopping_lists/{$list->id}"
                && $job->data !== null;
        });
    }

    public function test_updating_a_shopping_list_dispatches_sync_job(): void
    {
        Queue::fake();

        $list = ShoppingList::factory()->create();
        Queue::assertPushed(SyncModelToRtdb::class);

        Queue::fake(); // reset
        $list->update(['name' => 'Updated Groceries']);

        Queue::assertPushed(SyncModelToRtdb::class, function (SyncModelToRtdb $job) use ($list) {
            return $job->path === "families/{$list->family_id}/shopping_lists/{$list->id}"
                && $job->data['name'] === 'Updated Groceries';
        });
    }

    public function test_deleting_a_shopping_list_dispatches_remove_job(): void
    {
        Queue::fake();

        $list = ShoppingList::factory()->create();
        $familyId = $list->family_id;
        $listId = $list->id;

        Queue::fake();
        $list->delete();

        Queue::assertPushed(SyncModelToRtdb::class, function (SyncModelToRtdb $job) use ($familyId, $listId) {
            return $job->path === "families/{$familyId}/shopping_lists/{$listId}"
                && $job->data === null;
        });
    }

    public function test_deleting_a_shopping_list_also_removes_orphaned_item_nodes(): void
    {
        Queue::fake();

        $list = ShoppingList::factory()->create();
        $item = ShoppingItem::factory()->create(['shopping_list_id' => $list->id]);
        $familyId = $list->family_id;
        $itemId = $item->id;

        Queue::fake(); // reset after create
        $list->delete();

        // The ShoppingListObserver::deleting() hook must dispatch a remove for
        // each child item so RTDB doesn't keep orphans after the cascade delete.
        Queue::assertPushed(SyncModelToRtdb::class, function (SyncModelToRtdb $job) use ($familyId, $itemId) {
            return $job->path === "families/{$familyId}/shopping_items/{$itemId}"
                && $job->data === null;
        });
    }

    public function test_shopping_list_to_sync_array_contains_expected_keys(): void
    {
        Queue::fake();

        $list = ShoppingList::factory()->create();

        $array = $list->toSyncArray();

        foreach (['id', 'family_id', 'created_by', 'name', 'is_shared', 'updated_at'] as $key) {
            $this->assertArrayHasKey($key, $array, "toSyncArray() is missing key: {$key}");
        }
    }

    // ── ShoppingItem ──────────────────────────────────────────────────────────

    public function test_creating_a_shopping_item_dispatches_sync_job(): void
    {
        Queue::fake();

        $item = ShoppingItem::factory()->create();
        $familyId = $item->shoppingList->family_id;

        Queue::assertPushed(SyncModelToRtdb::class, function (SyncModelToRtdb $job) use ($familyId, $item) {
            return $job->path === "families/{$familyId}/shopping_items/{$item->id}"
                && $job->data !== null;
        });
    }

    public function test_deleting_a_shopping_item_dispatches_remove_job(): void
    {
        Queue::fake();

        $item = ShoppingItem::factory()->create();
        $familyId = $item->shoppingList->family_id;
        $itemId = $item->id;

        Queue::fake();
        $item->delete();

        Queue::assertPushed(SyncModelToRtdb::class, function (SyncModelToRtdb $job) use ($familyId, $itemId) {
            return $job->path === "families/{$familyId}/shopping_items/{$itemId}"
                && $job->data === null;
        });
    }

    public function test_shopping_item_to_sync_array_contains_expected_keys(): void
    {
        Queue::fake();

        $item = ShoppingItem::factory()->create();

        $array = $item->toSyncArray();

        foreach (['id', 'shopping_list_id', 'name', 'is_checked', 'updated_at'] as $key) {
            $this->assertArrayHasKey($key, $array, "toSyncArray() is missing key: {$key}");
        }
    }

    // ── CalendarEvent ─────────────────────────────────────────────────────────

    public function test_creating_a_calendar_event_dispatches_sync_job(): void
    {
        Queue::fake();

        $event = CalendarEvent::factory()->create();

        Queue::assertPushed(SyncModelToRtdb::class, function (SyncModelToRtdb $job) use ($event) {
            return $job->path === "families/{$event->family_id}/events/{$event->id}"
                && $job->data !== null;
        });
    }

    public function test_deleting_a_calendar_event_dispatches_remove_job(): void
    {
        Queue::fake();

        $event = CalendarEvent::factory()->create();
        $familyId = $event->family_id;
        $eventId = $event->id;

        Queue::fake();
        $event->delete();

        Queue::assertPushed(SyncModelToRtdb::class, function (SyncModelToRtdb $job) use ($familyId, $eventId) {
            return $job->path === "families/{$familyId}/events/{$eventId}"
                && $job->data === null;
        });
    }

    public function test_calendar_event_to_sync_array_contains_expected_keys(): void
    {
        Queue::fake();

        $event = CalendarEvent::factory()->create();

        $array = $event->toSyncArray();

        foreach (['id', 'family_id', 'title', 'start_at', 'end_at', 'updated_at'] as $key) {
            $this->assertArrayHasKey($key, $array, "toSyncArray() is missing key: {$key}");
        }
    }

    // ── Meal ──────────────────────────────────────────────────────────────────

    public function test_creating_a_meal_dispatches_sync_job(): void
    {
        Queue::fake();

        $meal = Meal::factory()->create();

        Queue::assertPushed(SyncModelToRtdb::class, function (SyncModelToRtdb $job) use ($meal) {
            return $job->path === "families/{$meal->family_id}/meals/{$meal->id}"
                && $job->data !== null
                && $job->data['id'] === $meal->id;
        });
    }

    public function test_deleting_a_meal_dispatches_remove_job(): void
    {
        Queue::fake();

        $meal = Meal::factory()->create();
        $familyId = $meal->family_id;
        $mealId = $meal->id;

        Queue::fake();
        $meal->delete();

        Queue::assertPushed(SyncModelToRtdb::class, function (SyncModelToRtdb $job) use ($familyId, $mealId) {
            return $job->path === "families/{$familyId}/meals/{$mealId}"
                && $job->data === null;
        });
    }

    public function test_meal_to_sync_array_contains_expected_keys(): void
    {
        Queue::fake();

        $meal = Meal::factory()->create();

        $array = $meal->toSyncArray();

        foreach (['id', 'family_id', 'recipe_id', 'planned_date', 'meal_type', 'updated_at'] as $key) {
            $this->assertArrayHasKey($key, $array, "toSyncArray() is missing key: {$key}");
        }
    }
}
