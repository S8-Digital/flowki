<?php

namespace Tests\Unit\Models;

use App\Enums\SocialProvider;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SocialAccountModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_social_account_belongs_to_user(): void
    {
        $account = SocialAccount::factory()->create();
        $this->assertInstanceOf(User::class, $account->user);
    }

    public function test_social_account_casts_provider_to_enum(): void
    {
        $account = SocialAccount::factory()->google()->create();
        $this->assertInstanceOf(SocialProvider::class, $account->fresh()->provider);
        $this->assertEquals(SocialProvider::Google, $account->fresh()->provider);
    }

    public function test_social_account_casts_token_expires_at_to_datetime(): void
    {
        $expiresAt = now()->addHour();
        $account = SocialAccount::factory()->create(['token_expires_at' => $expiresAt]);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $account->fresh()->token_expires_at);
    }

    public function test_social_account_factory_google_state(): void
    {
        $account = SocialAccount::factory()->google()->create();
        $this->assertEquals(SocialProvider::Google, $account->fresh()->provider);
    }

    public function test_social_account_factory_apple_state(): void
    {
        $account = SocialAccount::factory()->apple()->create();
        $this->assertEquals(SocialProvider::Apple, $account->fresh()->provider);
    }

    public function test_social_account_is_fillable(): void
    {
        $user = User::factory()->withFamily()->create();
        $account = SocialAccount::create([
            'user_id' => $user->id,
            'provider' => SocialProvider::Google,
            'provider_id' => '12345',
            'name' => 'Test User',
            'email' => 'test@example.com',
            'avatar' => null,
            'token' => 'access-token',
            'refresh_token' => null,
            'token_expires_at' => null,
        ]);

        $this->assertEquals('12345', $account->provider_id);
        $this->assertEquals('Test User', $account->name);
    }

    public function test_user_has_many_social_accounts(): void
    {
        $user = User::factory()->withFamily()->create();
        SocialAccount::factory()->count(2)->create(['user_id' => $user->id]);

        $this->assertCount(2, $user->fresh()->socialAccounts);
    }

    public function test_social_provider_labels(): void
    {
        $this->assertEquals('Google', SocialProvider::Google->label());
        $this->assertEquals('Apple', SocialProvider::Apple->label());
    }
}
