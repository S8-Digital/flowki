<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationPreferencesControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_view_notification_settings(): void
    {
        $this->get(route('settings.notifications.edit'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_notification_settings(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->get(route('settings.notifications.edit'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('settings/Notifications')
                ->has('preferences')
            );
    }

    public function test_preferences_default_to_true_when_not_set(): void
    {
        $user = User::factory()->withFamily()->create(['notification_preferences' => null]);

        $this->actingAs($user)
            ->get(route('settings.notifications.edit'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('settings/Notifications')
                ->where('preferences.email', true)
                ->where('preferences.push', true)
            );
    }

    public function test_user_can_update_notification_preferences(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->put(route('settings.notifications.update'), [
                'email' => false,
                'push' => true,
            ])
            ->assertRedirect()
            ->assertSessionHas('status', 'notification-preferences-updated');

        $preferences = $user->fresh()->notification_preferences;
        $this->assertFalse($preferences['email']);
        $this->assertTrue($preferences['push']);
    }

    public function test_updating_preferences_requires_email_field(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->put(route('settings.notifications.update'), [
                'push' => true,
            ])
            ->assertSessionHasErrors('email');
    }

    public function test_updating_preferences_requires_push_field(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->put(route('settings.notifications.update'), [
                'email' => true,
            ])
            ->assertSessionHasErrors('push');
    }

    public function test_email_field_must_be_boolean(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->put(route('settings.notifications.update'), [
                'email' => 'yes',
                'push' => true,
            ])
            ->assertSessionHasErrors('email');
    }

    public function test_user_can_disable_all_notifications(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->put(route('settings.notifications.update'), [
                'email' => false,
                'push' => false,
            ])
            ->assertRedirect()
            ->assertSessionHas('status', 'notification-preferences-updated');

        $this->assertFalse($user->fresh()->wantsEmailNotifications());
        $this->assertFalse($user->fresh()->wantsPushNotifications());
    }
}
