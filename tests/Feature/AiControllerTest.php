<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_assistant_page(): void
    {
        $this->get(route('assistant.index'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_assistant_page(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)->get(route('assistant.index'))->assertOk();
    }

    public function test_guests_cannot_post_to_chat(): void
    {
        $this->postJson(route('assistant.chat'), ['message' => 'hello'])->assertUnauthorized();
    }

    public function test_chat_requires_message(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->postJson(route('assistant.chat'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('message');
    }

    public function test_chat_rejects_message_exceeding_max_length(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->postJson(route('assistant.chat'), ['message' => str_repeat('x', 2001)])
            ->assertUnprocessable();
    }

    public function test_chat_rejects_invalid_history_role(): void
    {
        $user = User::factory()->withFamily()->create();

        $this->actingAs($user)
            ->postJson(route('assistant.chat'), [
                'message' => 'hello',
                'history' => [['role' => 'bot', 'content' => 'hi']],
            ])
            ->assertUnprocessable();
    }

    public function test_chat_returns_sse_response_when_ai_unconfigured(): void
    {
        config(['ai.providers.openai.key' => null, 'ai.providers.anthropic.key' => null]);

        $user = User::factory()->withFamily()->create();

        $response = $this->actingAs($user)
            ->post(route('assistant.chat'), ['message' => 'hello'], ['Accept' => 'text/event-stream']);

        $response->assertOk();
        $this->assertStringContainsString('AI is not configured', $response->getContent());
    }
}
