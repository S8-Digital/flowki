<?php

namespace Tests\Unit\Models;

use App\Models\InboundEmail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InboundEmailModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_gets_inbound_email_token_on_creation(): void
    {
        $user = User::factory()->create();

        $this->assertNotNull($user->inbound_email_token);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
            $user->inbound_email_token
        );
    }

    public function test_inbound_email_address_accessor_returns_correct_format(): void
    {
        $user = User::factory()->create();

        $expected = $user->inbound_email_token.'@in.flowki.family';
        $this->assertEquals($expected, $user->inboundEmailAddress());
    }

    public function test_inbound_email_address_returns_null_when_token_is_null(): void
    {
        $user = new User(['inbound_email_token' => null]);

        $this->assertNull($user->inboundEmailAddress());
    }

    public function test_each_user_gets_a_unique_inbound_email_token(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $this->assertNotEquals($userA->inbound_email_token, $userB->inbound_email_token);
    }

    public function test_inbound_emails_relationship(): void
    {
        $user = User::factory()->create();

        InboundEmail::create([
            'user_id' => $user->id,
            'from' => 'test@example.com',
            'subject' => 'Test',
            'raw' => 'raw content',
            'has_calendar' => false,
            'processed_at' => now(),
        ]);

        $this->assertCount(1, $user->inboundEmails);
    }

    public function test_inbound_email_belongs_to_user(): void
    {
        $user = User::factory()->create();

        $email = InboundEmail::create([
            'user_id' => $user->id,
            'from' => 'test@example.com',
            'raw' => 'raw content',
            'processed_at' => now(),
        ]);

        $this->assertEquals($user->id, $email->user->id);
    }
}
