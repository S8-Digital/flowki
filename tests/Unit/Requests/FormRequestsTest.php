<?php

namespace Tests\Unit\Requests;

use App\Http\Requests\AcceptInviteRequest;
use App\Http\Requests\CalendarEvent\StoreCalendarEventRequest;
use App\Http\Requests\CalendarEvent\UpdateCalendarEventRequest;
use App\Http\Requests\Chore\StoreChoreRequest;
use App\Http\Requests\Chore\UpdateChoreRequest;
use App\Http\Requests\ConfirmScheduleRequest;
use App\Http\Requests\Family\AddChildRequest;
use App\Http\Requests\Family\AddFamilyMemberRequest;
use App\Http\Requests\Family\InviteMemberRequest;
use App\Http\Requests\Family\JoinFamilyRequest;
use App\Http\Requests\Family\StoreFamilyRequest;
use App\Http\Requests\Family\UpdateFamilyRequest;
use App\Http\Requests\InboundEmailWebhookRequest;
use App\Http\Requests\Recipe\StoreRecipeRequest;
use App\Http\Requests\Recipe\UpdateRecipeRequest;
use App\Http\Requests\Settings\UpdatePermissionRequest;
use App\Http\Requests\ShoppingItem\StoreShoppingItemRequest;
use App\Http\Requests\ShoppingList\StoreShoppingListRequest;
use App\Http\Requests\StoreFcmTokenRequest;
use App\Http\Requests\Todo\StoreTodoRequest;
use App\Http\Requests\Todo\UpdateTodoRequest;
use App\Http\Requests\UploadScheduleRequest;
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
    // StoreChoreRequest
    // -----------------------------------------------------------------------

    public function test_store_chore_request_authorize_returns_true(): void
    {
        $request = new StoreChoreRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_store_chore_request_has_required_rules(): void
    {
        $request = new StoreChoreRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('title', $rules);
        $this->assertArrayHasKey('frequency', $rules);
        $this->assertArrayHasKey('next_due_date', $rules);
        $this->assertArrayHasKey('assignee_ids', $rules);
        $this->assertArrayHasKey('reminder_enabled', $rules);
        $this->assertArrayHasKey('reminder_lead_time', $rules);
    }

    public function test_store_chore_request_messages_contain_required_keys(): void
    {
        $request = new StoreChoreRequest;
        $messages = $request->messages();

        $this->assertArrayHasKey('title.required', $messages);
        $this->assertArrayHasKey('frequency.required', $messages);
    }

    // -----------------------------------------------------------------------
    // UpdateChoreRequest
    // -----------------------------------------------------------------------

    public function test_update_chore_request_authorize_returns_true(): void
    {
        $request = new UpdateChoreRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_update_chore_request_has_required_rules(): void
    {
        $request = new UpdateChoreRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('title', $rules);
        $this->assertArrayHasKey('frequency', $rules);
        $this->assertArrayHasKey('assignee_ids', $rules);
    }

    // -----------------------------------------------------------------------
    // StoreTodoRequest
    // -----------------------------------------------------------------------

    public function test_store_todo_request_authorize_returns_true(): void
    {
        $request = new StoreTodoRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_store_todo_request_has_required_rules(): void
    {
        $request = new StoreTodoRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('title', $rules);
        $this->assertArrayHasKey('category', $rules);
        $this->assertArrayHasKey('priority', $rules);
        $this->assertArrayHasKey('status', $rules);
        $this->assertArrayHasKey('due_date', $rules);
        $this->assertArrayHasKey('assigned_to', $rules);
        $this->assertArrayHasKey('reminder_enabled', $rules);
        $this->assertArrayHasKey('reminder_lead_time', $rules);
    }

    public function test_store_todo_request_messages_contain_required_keys(): void
    {
        $request = new StoreTodoRequest;
        $messages = $request->messages();

        $this->assertArrayHasKey('title.required', $messages);
        $this->assertArrayHasKey('category.required', $messages);
        $this->assertArrayHasKey('priority.required', $messages);
        $this->assertArrayHasKey('status.required', $messages);
    }

    // -----------------------------------------------------------------------
    // UpdateTodoRequest
    // -----------------------------------------------------------------------

    public function test_update_todo_request_authorize_returns_true(): void
    {
        $request = new UpdateTodoRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_update_todo_request_has_required_rules(): void
    {
        $request = new UpdateTodoRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('title', $rules);
        $this->assertArrayHasKey('category', $rules);
        $this->assertArrayHasKey('priority', $rules);
        $this->assertArrayHasKey('status', $rules);
    }

    // -----------------------------------------------------------------------
    // StoreShoppingItemRequest
    // -----------------------------------------------------------------------

    public function test_store_shopping_item_request_authorize_returns_true(): void
    {
        $request = new StoreShoppingItemRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_store_shopping_item_request_has_required_rules(): void
    {
        $request = new StoreShoppingItemRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('name', $rules);
        $this->assertArrayHasKey('quantity', $rules);
        $this->assertArrayHasKey('category', $rules);
    }

    public function test_store_shopping_item_request_messages_contain_name_key(): void
    {
        $request = new StoreShoppingItemRequest;
        $this->assertArrayHasKey('name.required', $request->messages());
    }

    // -----------------------------------------------------------------------
    // StoreShoppingListRequest
    // -----------------------------------------------------------------------

    public function test_store_shopping_list_request_authorize_returns_true(): void
    {
        $request = new StoreShoppingListRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_store_shopping_list_request_has_required_rules(): void
    {
        $request = new StoreShoppingListRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('name', $rules);
        $this->assertArrayHasKey('is_shared', $rules);
    }

    // -----------------------------------------------------------------------
    // StoreRecipeRequest
    // -----------------------------------------------------------------------

    public function test_store_recipe_request_authorize_returns_true(): void
    {
        $request = new StoreRecipeRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_store_recipe_request_has_required_rules(): void
    {
        $request = new StoreRecipeRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('title', $rules);
        $this->assertArrayHasKey('instructions', $rules);
        $this->assertArrayHasKey('servings', $rules);
        $this->assertArrayHasKey('photo', $rules);
        $this->assertArrayHasKey('rating', $rules);
        $this->assertArrayHasKey('ingredients', $rules);
        $this->assertArrayHasKey('ingredients.*.name', $rules);
    }

    public function test_store_recipe_request_messages_contain_required_keys(): void
    {
        $request = new StoreRecipeRequest;
        $messages = $request->messages();

        $this->assertArrayHasKey('title.required', $messages);
        $this->assertArrayHasKey('instructions.required', $messages);
        $this->assertArrayHasKey('photo.image', $messages);
        $this->assertArrayHasKey('photo.max', $messages);
        $this->assertArrayHasKey('ingredients.*.name.required', $messages);
    }

    // -----------------------------------------------------------------------
    // UpdateRecipeRequest
    // -----------------------------------------------------------------------

    public function test_update_recipe_request_authorize_returns_true(): void
    {
        $request = new UpdateRecipeRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_update_recipe_request_has_required_rules(): void
    {
        $request = new UpdateRecipeRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('title', $rules);
        $this->assertArrayHasKey('instructions', $rules);
        $this->assertArrayHasKey('ingredients.*.name', $rules);
    }

    // -----------------------------------------------------------------------
    // AcceptInviteRequest
    // -----------------------------------------------------------------------

    public function test_accept_invite_request_authorize_returns_true(): void
    {
        $request = new AcceptInviteRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_accept_invite_request_has_required_rules(): void
    {
        $request = new AcceptInviteRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('name', $rules);
        $this->assertArrayHasKey('password', $rules);
    }

    public function test_accept_invite_request_messages_contain_required_keys(): void
    {
        $request = new AcceptInviteRequest;
        $messages = $request->messages();

        $this->assertArrayHasKey('name.required', $messages);
        $this->assertArrayHasKey('password.required', $messages);
        $this->assertArrayHasKey('password.confirmed', $messages);
    }

    // -----------------------------------------------------------------------
    // StoreFcmTokenRequest
    // -----------------------------------------------------------------------

    public function test_store_fcm_token_request_authorize_returns_true(): void
    {
        $request = new StoreFcmTokenRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_store_fcm_token_request_has_required_rules(): void
    {
        $request = new StoreFcmTokenRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('token', $rules);
        $this->assertArrayHasKey('device_type', $rules);
    }

    public function test_store_fcm_token_request_messages_contain_keys(): void
    {
        $request = new StoreFcmTokenRequest;
        $messages = $request->messages();

        $this->assertArrayHasKey('token.required', $messages);
        $this->assertArrayHasKey('token.max', $messages);
        $this->assertArrayHasKey('device_type.in', $messages);
    }

    // -----------------------------------------------------------------------
    // UploadScheduleRequest
    // -----------------------------------------------------------------------

    public function test_upload_schedule_request_has_file_rule(): void
    {
        $request = new UploadScheduleRequest;
        $this->assertArrayHasKey('file', $request->rules());
    }

    public function test_upload_schedule_request_messages_contain_keys(): void
    {
        $request = new UploadScheduleRequest;
        $messages = $request->messages();

        $this->assertArrayHasKey('file.mimes', $messages);
        $this->assertArrayHasKey('file.max', $messages);
    }

    // -----------------------------------------------------------------------
    // ConfirmScheduleRequest
    // -----------------------------------------------------------------------

    public function test_confirm_schedule_request_has_shifts_rules(): void
    {
        $request = new ConfirmScheduleRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('shifts', $rules);
        $this->assertArrayHasKey('shifts.*.title', $rules);
        $this->assertArrayHasKey('shifts.*.start_at', $rules);
        $this->assertArrayHasKey('shifts.*.end_at', $rules);
        $this->assertArrayHasKey('shifts.*.is_all_day', $rules);
    }

    // -----------------------------------------------------------------------
    // InboundEmailWebhookRequest
    // -----------------------------------------------------------------------

    public function test_inbound_email_webhook_request_has_required_rules(): void
    {
        $request = new InboundEmailWebhookRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('token', $rules);
        $this->assertArrayHasKey('to', $rules);
        $this->assertArrayHasKey('from', $rules);
        $this->assertArrayHasKey('subject', $rules);
        $this->assertArrayHasKey('raw', $rules);
    }

    public function test_inbound_email_webhook_request_authorize_fails_without_secret(): void
    {
        $original = config('services.cloudflare.worker_secret');
        config(['services.cloudflare.worker_secret' => null]);
        try {
            $request = new InboundEmailWebhookRequest;
            $this->assertFalse($request->authorize());
        } finally {
            config(['services.cloudflare.worker_secret' => $original]);
        }
    }

    public function test_inbound_email_webhook_request_authorize_fails_with_wrong_secret(): void
    {
        $original = config('services.cloudflare.worker_secret');
        config(['services.cloudflare.worker_secret' => 'correct-secret']);
        try {
            $request = new InboundEmailWebhookRequest;
            $request->headers->set('X-Worker-Secret', 'wrong-secret');
            $this->assertFalse($request->authorize());
        } finally {
            config(['services.cloudflare.worker_secret' => $original]);
        }
    }

    public function test_inbound_email_webhook_request_authorize_passes_with_correct_secret(): void
    {
        $original = config('services.cloudflare.worker_secret');
        config(['services.cloudflare.worker_secret' => 'my-secret']);
        try {
            $request = new InboundEmailWebhookRequest;
            $request->headers->set('X-Worker-Secret', 'my-secret');
            $this->assertTrue($request->authorize());
        } finally {
            config(['services.cloudflare.worker_secret' => $original]);
        }
    }

    // -----------------------------------------------------------------------
    // InviteMemberRequest
    // -----------------------------------------------------------------------

    public function test_invite_member_request_authorize_returns_true(): void
    {
        $request = new InviteMemberRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_invite_member_request_has_required_rules(): void
    {
        $request = new InviteMemberRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('email', $rules);
        $this->assertArrayHasKey('role', $rules);
    }

    public function test_invite_member_request_messages_contain_keys(): void
    {
        $request = new InviteMemberRequest;
        $messages = $request->messages();

        $this->assertArrayHasKey('email.required', $messages);
        $this->assertArrayHasKey('email.email', $messages);
        $this->assertArrayHasKey('role.required', $messages);
        $this->assertArrayHasKey('role.not_in', $messages);
    }

    // -----------------------------------------------------------------------
    // JoinFamilyRequest
    // -----------------------------------------------------------------------

    public function test_join_family_request_authorize_returns_true(): void
    {
        $request = new JoinFamilyRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_join_family_request_has_invite_code_rule(): void
    {
        $request = new JoinFamilyRequest;
        $this->assertArrayHasKey('invite_code', $request->rules());
    }

    public function test_join_family_request_messages_contain_keys(): void
    {
        $request = new JoinFamilyRequest;
        $messages = $request->messages();

        $this->assertArrayHasKey('invite_code.required', $messages);
        $this->assertArrayHasKey('invite_code.size', $messages);
        $this->assertArrayHasKey('invite_code.exists', $messages);
    }

    // -----------------------------------------------------------------------
    // StoreFamilyRequest
    // -----------------------------------------------------------------------

    public function test_store_family_request_authorize_returns_true(): void
    {
        $request = new StoreFamilyRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_store_family_request_has_name_rule(): void
    {
        $request = new StoreFamilyRequest;
        $this->assertArrayHasKey('name', $request->rules());
    }

    public function test_store_family_request_messages_contain_keys(): void
    {
        $request = new StoreFamilyRequest;
        $messages = $request->messages();

        $this->assertArrayHasKey('name.required', $messages);
        $this->assertArrayHasKey('name.max', $messages);
    }

    // -----------------------------------------------------------------------
    // UpdateFamilyRequest
    // -----------------------------------------------------------------------

    public function test_update_family_request_authorize_returns_true(): void
    {
        $request = new UpdateFamilyRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_update_family_request_has_required_rules(): void
    {
        $request = new UpdateFamilyRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('name', $rules);
        $this->assertArrayHasKey('location_name', $rules);
        $this->assertArrayHasKey('latitude', $rules);
        $this->assertArrayHasKey('longitude', $rules);
    }

    public function test_update_family_request_messages_contain_name_key(): void
    {
        $request = new UpdateFamilyRequest;
        $this->assertArrayHasKey('name.required', $request->messages());
    }

    // -----------------------------------------------------------------------
    // AddChildRequest
    // -----------------------------------------------------------------------

    public function test_add_child_request_authorize_returns_true(): void
    {
        $request = new AddChildRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_add_child_request_has_name_rule(): void
    {
        $request = new AddChildRequest;
        $this->assertArrayHasKey('name', $request->rules());
    }

    public function test_add_child_request_messages_contain_keys(): void
    {
        $request = new AddChildRequest;
        $messages = $request->messages();

        $this->assertArrayHasKey('name.required', $messages);
        $this->assertArrayHasKey('name.max', $messages);
    }

    // -----------------------------------------------------------------------
    // UpdatePermissionRequest
    // -----------------------------------------------------------------------

    public function test_update_permission_request_authorize_returns_true(): void
    {
        $request = new UpdatePermissionRequest;
        $this->assertTrue($request->authorize());
    }

    public function test_update_permission_request_has_permissions_rule(): void
    {
        $request = new UpdatePermissionRequest;
        $rules = $request->rules();

        $this->assertArrayHasKey('permissions', $rules);
        $this->assertArrayHasKey('permissions.*', $rules);
    }

    public function test_update_permission_request_messages_contain_key(): void
    {
        $request = new UpdatePermissionRequest;
        $this->assertArrayHasKey('permissions.*.in', $request->messages());
    }
}
