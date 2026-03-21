<?php

namespace Tests\Unit\Jobs;

use App\Jobs\SendDueItemReminders;
use App\Jobs\SyncItemToGoogleCalendar;
use App\Models\Chore;
use App\Models\Todo;
use App\Models\User;
use App\Notifications\ChoreDueReminder;
use App\Notifications\TodoDueReminder;
use App\Services\GoogleCalendarService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Mockery;
use Tests\TestCase;

class JobsTest extends TestCase
{
    use RefreshDatabase;

    // -----------------------------------------------------------------------
    // SendDueItemReminders
    // -----------------------------------------------------------------------

    public function test_send_due_item_reminders_sends_todo_reminder_in_window(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'notification_preferences' => ['email' => false, 'push' => false],
        ]);

        Todo::factory()->create([
            'assigned_to' => $user->id,
            'reminder_enabled' => true,
            'reminder_lead_time' => 0,
            'due_date' => now()->toDateTimeString(),
            'status' => 'pending',
        ]);

        (new SendDueItemReminders)->handle();

        Notification::assertSentTo($user, TodoDueReminder::class);
    }

    public function test_send_due_item_reminders_skips_todo_outside_window(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        Todo::factory()->create([
            'assigned_to' => $user->id,
            'reminder_enabled' => true,
            'reminder_lead_time' => 60,
            'due_date' => now()->addHours(3)->toDateTimeString(),
            'status' => 'pending',
        ]);

        (new SendDueItemReminders)->handle();

        Notification::assertNotSentTo($user, TodoDueReminder::class);
    }

    public function test_send_due_item_reminders_skips_completed_todos(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        Todo::factory()->create([
            'assigned_to' => $user->id,
            'reminder_enabled' => true,
            'reminder_lead_time' => 0,
            'due_date' => now()->toDateTimeString(),
            'status' => 'completed',
        ]);

        (new SendDueItemReminders)->handle();

        Notification::assertNotSentTo($user, TodoDueReminder::class);
    }

    public function test_send_due_item_reminders_sends_chore_reminder_in_window(): void
    {
        Notification::fake();

        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'reminder_enabled' => true,
            'reminder_lead_time' => 0,
            'next_due_date' => now()->toDateTimeString(),
        ]);
        $chore->assignees()->attach($user->id);

        (new SendDueItemReminders)->handle();

        Notification::assertSentTo($user, ChoreDueReminder::class);
    }

    public function test_send_due_item_reminders_skips_chore_outside_window(): void
    {
        Notification::fake();

        $user = User::factory()->withFamily()->create();
        $chore = Chore::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'reminder_enabled' => true,
            'reminder_lead_time' => 60,
            'next_due_date' => now()->addHours(3)->toDateTimeString(),
        ]);
        $chore->assignees()->attach($user->id);

        (new SendDueItemReminders)->handle();

        Notification::assertNotSentTo($user, ChoreDueReminder::class);
    }

    // -----------------------------------------------------------------------
    // SyncItemToGoogleCalendar
    // -----------------------------------------------------------------------

    public function test_sync_item_to_google_calendar_calls_service_when_connected(): void
    {
        $user = User::factory()->create([
            'google_calendar_token' => [
                'access_token' => 'token',
                'refresh_token' => 'refresh',
                'expires_at' => now()->addHour()->timestamp,
            ],
        ]);

        $mock = Mockery::mock(GoogleCalendarService::class);
        $mock->shouldReceive('createOrUpdateEvent')
            ->once()
            ->with($user, null, Mockery::type('array'))
            ->andReturn('google-event-id');

        $eventData = [
            'summary' => 'Dentist Appointment',
            'start' => now()->toIso8601String(),
            'end' => now()->addHour()->toIso8601String(),
        ];

        $job = new SyncItemToGoogleCalendar($user, $eventData, null);
        $job->handle($mock);
    }

    public function test_sync_item_to_google_calendar_skips_when_not_connected(): void
    {
        $user = User::factory()->create([
            'google_calendar_token' => null,
        ]);

        $mock = Mockery::mock(GoogleCalendarService::class);
        $mock->shouldNotReceive('createOrUpdateEvent');

        $eventData = [
            'summary' => 'Meeting',
            'start' => now()->toIso8601String(),
            'end' => now()->addHour()->toIso8601String(),
        ];

        $job = new SyncItemToGoogleCalendar($user, $eventData, null);
        $job->handle($mock);
    }

    public function test_sync_item_passes_google_event_id_when_provided(): void
    {
        $user = User::factory()->create([
            'google_calendar_token' => [
                'access_token' => 'token',
                'refresh_token' => 'refresh',
                'expires_at' => now()->addHour()->timestamp,
            ],
        ]);

        $mock = Mockery::mock(GoogleCalendarService::class);
        $mock->shouldReceive('createOrUpdateEvent')
            ->once()
            ->with($user, 'existing-id', Mockery::type('array'))
            ->andReturn('existing-id');

        $eventData = [
            'summary' => 'Updated Meeting',
            'start' => now()->toIso8601String(),
            'end' => now()->addHour()->toIso8601String(),
        ];

        $job = new SyncItemToGoogleCalendar($user, $eventData, 'existing-id');
        $job->handle($mock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
