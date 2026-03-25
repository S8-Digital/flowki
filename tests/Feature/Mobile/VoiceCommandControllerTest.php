<?php

namespace Tests\Feature\Mobile;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VoiceCommandControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_is_rejected(): void
    {
        $this->postJson(route('mobile.voice.command'), ['command' => 'Add milk to shopping list'])
            ->assertUnauthorized();
    }

    public function test_command_is_required(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.voice.command'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('command');
    }

    public function test_command_max_length_is_enforced(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.voice.command'), ['command' => str_repeat('x', 501)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('command');
    }

    public function test_user_without_family_receives_error(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.voice.command'), ['command' => 'Add milk'])
            ->assertUnprocessable()
            ->assertJson(['success' => false]);
    }

    public function test_returns_503_when_ai_not_configured(): void
    {
        config(['ai.providers.anthropic.key' => null, 'ai.providers.gemini.key' => null]);

        $user = User::factory()->withFamily()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson(route('mobile.voice.command'), ['command' => 'Add milk to shopping list'])
            ->assertStatus(503)
            ->assertJson(['success' => false]);
    }
}
