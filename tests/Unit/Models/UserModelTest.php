<?php

namespace Tests\Unit\Models;

use App\Models\FcmToken;
use App\Models\SocialAccount;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_belongs_to_family(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->assertNotNull($user->family);
    }

    public function test_user_without_family_has_null_family(): void
    {
        $user = User::factory()->create(['family_id' => null]);

        $this->assertNull($user->family);
    }

    public function test_wants_email_notifications_returns_true_by_default(): void
    {
        $user = User::factory()->create(['notification_preferences' => null]);

        $this->assertTrue($user->wantsEmailNotifications());
    }

    public function test_wants_push_notifications_returns_true_by_default(): void
    {
        $user = User::factory()->create(['notification_preferences' => null]);

        $this->assertTrue($user->wantsPushNotifications());
    }

    public function test_wants_email_notifications_returns_false_when_disabled(): void
    {
        $user = User::factory()->create([
            'notification_preferences' => ['email' => false, 'push' => true],
        ]);

        $this->assertFalse($user->wantsEmailNotifications());
    }

    public function test_wants_push_notifications_returns_false_when_disabled(): void
    {
        $user = User::factory()->create([
            'notification_preferences' => ['email' => true, 'push' => false],
        ]);

        $this->assertFalse($user->wantsPushNotifications());
    }

    public function test_user_has_fcm_tokens_relationship(): void
    {
        $user = User::factory()->withFamily()->create();
        FcmToken::factory()->create(['user_id' => $user->id]);

        $this->assertCount(1, $user->fcmTokens);
    }

    public function test_user_has_social_accounts_relationship(): void
    {
        $user = User::factory()->withFamily()->create();
        SocialAccount::factory()->create(['user_id' => $user->id]);

        $this->assertCount(1, $user->socialAccounts);
    }

    public function test_user_has_todos_relationship(): void
    {
        $user = User::factory()->withFamily()->create();
        Todo::factory()->create([
            'family_id' => $user->family_id,
            'created_by' => $user->id,
        ]);

        $this->assertCount(1, $user->todos);
    }

    public function test_profile_color_is_fillable(): void
    {
        $user = User::factory()->create(['profile_color' => '#abc123']);

        $this->assertEquals('#abc123', $user->profile_color);
    }

    public function test_google_calendar_token_is_cast_to_array(): void
    {
        $user = User::factory()->create([
            'google_calendar_token' => ['access_token' => 'token123'],
        ]);

        $this->assertIsArray($user->fresh()->google_calendar_token);
        $this->assertEquals('token123', $user->fresh()->google_calendar_token['access_token']);
    }

    public function test_notification_preferences_are_cast_to_array(): void
    {
        $user = User::factory()->create([
            'notification_preferences' => ['email' => true, 'push' => false],
        ]);

        $this->assertIsArray($user->fresh()->notification_preferences);
    }
}
