<?php

namespace Tests\Unit\Mail;

use App\Mail\FamilyInvitationMail;
use App\Models\Invitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FamilyInvitationMailTest extends TestCase
{
    use RefreshDatabase;

    public function test_envelope_subject_contains_family_name(): void
    {
        $invitation = Invitation::factory()->create();
        $invitation->load('family');

        $mail = new FamilyInvitationMail($invitation);
        $envelope = $mail->envelope();

        $this->assertStringContainsString($invitation->family->name, $envelope->subject);
    }

    public function test_content_uses_family_invitation_view(): void
    {
        $invitation = Invitation::factory()->create();

        $mail = new FamilyInvitationMail($invitation);
        $content = $mail->content();

        $this->assertEquals('mail.family-invitation', $content->view);
    }

    public function test_attachments_returns_empty_array(): void
    {
        $invitation = Invitation::factory()->create();

        $mail = new FamilyInvitationMail($invitation);

        $this->assertEmpty($mail->attachments());
    }

    public function test_invitation_is_accessible_on_mail(): void
    {
        $invitation = Invitation::factory()->create();

        $mail = new FamilyInvitationMail($invitation);

        $this->assertSame($invitation->id, $mail->invitation->id);
    }
}
