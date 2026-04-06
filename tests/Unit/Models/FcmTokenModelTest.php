<?php

namespace Tests\Unit\Models;

use App\Models\FcmToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FcmTokenModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_fcm_token_belongs_to_user(): void
    {
        $token = FcmToken::factory()->create();
        $this->assertInstanceOf(User::class, $token->user);
    }

    public function test_fcm_token_is_fillable(): void
    {
        $user = User::factory()->withFamily()->create();
        $token = FcmToken::create([
            'user_id' => $user->id,
            'token' => 'my-test-fcm-token',
            'device_type' => 'web',
        ]);

        $this->assertEquals('my-test-fcm-token', $token->token);
        $this->assertEquals('web', $token->device_type);
    }

    public function test_user_has_many_fcm_tokens(): void
    {
        $user = User::factory()->withFamily()->create();
        FcmToken::factory()->count(3)->create(['user_id' => $user->id]);

        $this->assertCount(3, $user->fresh()->fcmTokens);
    }

    public function test_fcm_token_factory_creates_valid_token(): void
    {
        $token = FcmToken::factory()->create();

        $this->assertNotEmpty($token->token);
        $this->assertNotEmpty($token->device_type);
        $this->assertNotNull($token->user_id);
    }

    public function test_fcm_token_device_type_can_be_ios(): void
    {
        $user = User::factory()->withFamily()->create();
        $token = FcmToken::create([
            'user_id' => $user->id,
            'token' => 'ios-token-123',
            'device_type' => 'ios',
        ]);

        $this->assertEquals('ios', $token->device_type);
    }

    public function test_fcm_token_device_type_can_be_android(): void
    {
        $user = User::factory()->withFamily()->create();
        $token = FcmToken::create([
            'user_id' => $user->id,
            'token' => 'android-token-456',
            'device_type' => 'android',
        ]);

        $this->assertEquals('android', $token->device_type);
    }
}
