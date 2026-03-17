<?php

namespace Tests\Feature;

use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ScheduleControllerTest extends TestCase
{
    use RefreshDatabase;

    // -----------------------------------------------------------------------
    // Upload endpoint
    // -----------------------------------------------------------------------

    public function test_upload_requires_authentication(): void
    {
        $file = UploadedFile::fake()->createWithContent('schedule.txt', '2026-03-17 07:00-15:00 Morning Shift');

        $this->postJson(route('schedule.upload'), ['file' => $file])
            ->assertUnauthorized();
    }

    public function test_upload_rejects_user_without_create_events_permission(): void
    {
        $user = User::factory()->withFamily()->create();
        $user->syncRoles('Guest'); // Guests cannot create events

        $file = UploadedFile::fake()->createWithContent('schedule.txt', '2026-03-17 07:00-15:00 Morning Shift');

        $this->actingAs($user)
            ->postJson(route('schedule.upload'), ['file' => $file])
            ->assertForbidden();
    }

    public function test_upload_requires_file(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->postJson(route('schedule.upload'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');
    }

    public function test_upload_rejects_file_exceeding_size_limit(): void
    {
        $user = User::factory()->withFamily()->create();

        // 11 MB – exceeds 10 MB limit
        $file = UploadedFile::fake()->create('big.txt', 11 * 1024);

        $this->actingAs($user)
            ->postJson(route('schedule.upload'), ['file' => $file])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');
    }

    public function test_upload_rejects_invalid_mime_type(): void
    {
        $user = User::factory()->withFamily()->create();

        $file = UploadedFile::fake()->create('schedule.zip', 100, 'application/zip');

        $this->actingAs($user)
            ->postJson(route('schedule.upload'), ['file' => $file])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');
    }

    public function test_upload_parses_plain_text_and_returns_shifts(): void
    {
        $user = User::factory()->withFamily()->create();

        $content = implode("\n", [
            '2026-03-17 07:00-15:00 Morning Shift',
            '2026-03-18 15:00-23:00 Afternoon Shift',
        ]);

        $file = UploadedFile::fake()->createWithContent('schedule.txt', $content);

        $this->actingAs($user)
            ->postJson(route('schedule.upload'), ['file' => $file])
            ->assertOk()
            ->assertJsonStructure(['shifts' => [['title', 'start_at', 'end_at', 'is_all_day']]])
            ->assertJsonCount(2, 'shifts');
    }

    public function test_upload_returns_422_when_no_shifts_parsed(): void
    {
        $user = User::factory()->withFamily()->create();

        $file = UploadedFile::fake()->createWithContent('empty.txt', 'no schedule data here at all');

        $this->actingAs($user)
            ->postJson(route('schedule.upload'), ['file' => $file])
            ->assertStatus(422)
            ->assertJsonStructure(['message', 'shifts']);
    }

    // -----------------------------------------------------------------------
    // Confirm endpoint
    // -----------------------------------------------------------------------

    public function test_confirm_requires_authentication(): void
    {
        $this->post(route('schedule.confirm'), ['shifts' => []])
            ->assertRedirect(route('login'));
    }

    public function test_confirm_requires_shifts(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('schedule.confirm'), ['shifts' => []])
            ->assertSessionHasErrors('shifts');
    }

    public function test_confirm_validates_shift_fields(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('schedule.confirm'), [
                'shifts' => [['title' => '', 'start_at' => 'not-a-date']],
            ])
            ->assertSessionHasErrors(['shifts.0.title', 'shifts.0.start_at']);
    }

    public function test_confirm_creates_calendar_events(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('schedule.confirm'), [
                'shifts' => [
                    [
                        'title' => 'Morning Shift',
                        'start_at' => '2026-03-17T07:00:00',
                        'end_at' => '2026-03-17T15:00:00',
                        'is_all_day' => false,
                    ],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('calendar_events', [
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Morning Shift',
        ]);
    }

    public function test_confirm_assigns_user_as_attendee(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('schedule.confirm'), [
                'shifts' => [
                    [
                        'title' => 'Morning Shift',
                        'start_at' => '2026-03-17T07:00:00',
                        'end_at' => '2026-03-17T15:00:00',
                        'is_all_day' => false,
                    ],
                ],
            ]);

        $event = CalendarEvent::where('title', 'Morning Shift')->first();

        $this->assertNotNull($event);
        $this->assertTrue($event->attendees->contains($user));
    }

    public function test_confirm_skips_duplicate_shifts(): void
    {
        $user = User::factory()->withFamily()->create();

        // Create a pre-existing event
        CalendarEvent::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
            'title' => 'Morning Shift',
            'start_at' => '2026-03-17 07:00:00',
        ]);

        $this->actingAs($user)
            ->post(route('schedule.confirm'), [
                'shifts' => [
                    [
                        'title' => 'Morning Shift',
                        'start_at' => '2026-03-17T07:00:00',
                        'end_at' => '2026-03-17T15:00:00',
                        'is_all_day' => false,
                    ],
                ],
            ]);

        // Should still be only 1 event (duplicate skipped)
        $this->assertDatabaseCount('calendar_events', 1);
    }

    public function test_confirm_creates_multiple_events(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->post(route('schedule.confirm'), [
                'shifts' => [
                    ['title' => 'Morning Shift', 'start_at' => '2026-03-17T07:00:00', 'end_at' => '2026-03-17T15:00:00', 'is_all_day' => false],
                    ['title' => 'Afternoon Shift', 'start_at' => '2026-03-18T15:00:00', 'end_at' => '2026-03-18T23:00:00', 'is_all_day' => false],
                    ['title' => 'REST DAY', 'start_at' => '2026-03-19T00:00:00', 'end_at' => null, 'is_all_day' => true],
                ],
            ]);

        $this->assertDatabaseCount('calendar_events', 3);
    }
}
