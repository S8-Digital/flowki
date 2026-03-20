<?php

namespace Tests\Unit\Models;

use App\Enums\FamilyRole;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class InvitationModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_invitation_belongs_to_family(): void
    {
        $user = User::factory()->withFamily()->create();
        $invitation = Invitation::factory()->create(['family_id' => $user->family_id]);

        $this->assertEquals($user->family_id, $invitation->family_id);
    }

    public function test_is_accepted_returns_false_for_pending_invitation(): void
    {
        $invitation = Invitation::factory()->create(['accepted_at' => null]);

        $this->assertFalse($invitation->isAccepted());
    }

    public function test_is_accepted_returns_true_when_accepted(): void
    {
        $invitation = Invitation::factory()->create(['accepted_at' => now()]);

        $this->assertTrue($invitation->isAccepted());
    }

    public function test_is_pending_returns_true_for_pending_invitation(): void
    {
        $invitation = Invitation::factory()->create(['accepted_at' => null]);

        $this->assertTrue($invitation->isPending());
    }

    public function test_is_pending_returns_false_when_accepted(): void
    {
        $invitation = Invitation::factory()->create(['accepted_at' => now()]);

        $this->assertFalse($invitation->isPending());
    }

    public function test_role_is_cast_to_enum(): void
    {
        $invitation = Invitation::factory()->create(['role' => FamilyRole::Member]);

        $this->assertInstanceOf(FamilyRole::class, $invitation->fresh()->role);
    }

    public function test_accepted_at_is_cast_to_datetime(): void
    {
        $invitation = Invitation::factory()->create(['accepted_at' => now()]);

        $this->assertInstanceOf(Carbon::class, $invitation->fresh()->accepted_at);
    }

    public function test_invitation_can_belong_to_a_user(): void
    {
        $user = User::factory()->withFamily()->create();
        $invitation = Invitation::factory()->create([
            'family_id' => $user->family_id,
            'user_id' => $user->id,
        ]);
        $invitation->load('user');

        $this->assertEquals($user->id, $invitation->user->id);
    }

    public function test_invitation_token_is_stored(): void
    {
        $invitation = Invitation::factory()->create(['token' => 'unique-token-value']);

        $this->assertEquals('unique-token-value', $invitation->fresh()->token);
    }
}
