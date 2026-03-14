<x-mail::message>
# You've been invited to join {{ $invitation->family->name }}!

You have been invited to join **{{ $invitation->family->name }}** on Flowki as a **{{ $invitation->role->label() }}**.

Click the button below to set up your account and accept the invitation.

<x-mail::button :url="route('invite.show', $invitation->token)">
Accept Invitation
</x-mail::button>

Or copy and paste this link into your browser:

`{{ route('invite.show', $invitation->token) }}`

This invitation was sent to **{{ $invitation->email }}**.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>

