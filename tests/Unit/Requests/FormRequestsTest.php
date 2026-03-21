<?php

namespace Tests\Unit\Requests;

use App\Http\Requests\CalendarEvent\MoveCalendarEventRequest;
use App\Http\Requests\CalendarEvent\StoreCalendarEventRequest;
use App\Http\Requests\CalendarEvent\UpdateCalendarEventRequest;
use App\Http\Requests\Family\AddFamilyMemberRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Unit tests for form request authorize() / rules() / messages() methods.
 * These classes are exercised via controller feature tests (CalendarEventController,
 * FamilyController) as well as directly here to ensure complete code coverage.
 */
class FormRequestsTest extends TestCase
{
    use RefreshDatabase;

    // -----------------------------------------------------------------------
    // AddFamilyMemberRequest
    // -----------------------------------------------------------------------

    public function test_add_family_member_request_authorize_returns_true(): void
    {
        $request = new AddFamilyMemberRequest;

        $this->assertTrue($request->authorize());
    }

    public function test_add_family_member_request_has_email_rule(): void
    {
        $request = new AddFamilyMemberRequest;

        $this->assertArrayHasKey('email', $request->rules());
    }

    public function test_add_family_member_request_messages_contain_email_keys(): void
    {
        $request = new AddFamilyMemberRequest;
        $messages = $request->messages();

        $this->assertArrayHasKey('email.required', $messages);
        $this->assertArrayHasKey('email.email', $messages);
        $this->assertArrayHasKey('email.exists', $messages);
    }

    // -----------------------------------------------------------------------
    // StoreCalendarEventRequest
    // -----------------------------------------------------------------------

    public function test_store_calendar_event_request_authorize_returns_true(): void
    {
        $request = new StoreCalendarEventRequest;

        $this->assertTrue($request->authorize());
    }

    public function test_store_calendar_event_request_has_required_rules(): void
    {
        $request = new StoreCalendarEventRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('title', $rules);
        $this->assertArrayHasKey('start_at', $rules);
        $this->assertArrayHasKey('end_at', $rules);
        $this->assertArrayHasKey('attendee_ids', $rules);
    }

    public function test_store_calendar_event_request_messages_contain_required_keys(): void
    {
        $request = new StoreCalendarEventRequest;
        $messages = $request->messages();

        $this->assertArrayHasKey('title.required', $messages);
        $this->assertArrayHasKey('start_at.required', $messages);
        $this->assertArrayHasKey('end_at.after_or_equal', $messages);
    }

    // -----------------------------------------------------------------------
    // UpdateCalendarEventRequest
    // -----------------------------------------------------------------------

    public function test_update_calendar_event_request_authorize_returns_true(): void
    {
        $request = new UpdateCalendarEventRequest;

        $this->assertTrue($request->authorize());
    }

    public function test_update_calendar_event_request_has_required_rules(): void
    {
        $request = new UpdateCalendarEventRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('title', $rules);
        $this->assertArrayHasKey('start_at', $rules);
    }

    // -----------------------------------------------------------------------
    // MoveCalendarEventRequest
    // -----------------------------------------------------------------------

    public function test_move_calendar_event_request_authorize_returns_true(): void
    {
        $request = new MoveCalendarEventRequest;

        $this->assertTrue($request->authorize());
    }

    public function test_move_calendar_event_request_has_start_at_rule(): void
    {
        $request = new MoveCalendarEventRequest;

        $this->assertArrayHasKey('start_at', $request->rules());
    }

    public function test_move_calendar_event_request_messages_contain_keys(): void
    {
        $request = new MoveCalendarEventRequest;
        $messages = $request->messages();

        $this->assertArrayHasKey('start_at.required', $messages);
        $this->assertArrayHasKey('end_at.after_or_equal', $messages);
    }
}
