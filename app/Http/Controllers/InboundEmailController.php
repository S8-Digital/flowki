<?php

namespace App\Http\Controllers;

use App\Http\Requests\InboundEmailWebhookRequest;
use App\Models\User;
use App\Services\InboundEmailService;
use Illuminate\Http\JsonResponse;

class InboundEmailController extends Controller
{
    public function __construct(private readonly InboundEmailService $service) {}

    /**
     * Receive an inbound email from the Cloudflare Email Worker.
     *
     * The worker signs requests with a shared secret in the X-Worker-Secret header.
     * On success, the email is parsed and the AnalyseInboundEmail job is dispatched.
     */
    public function __invoke(InboundEmailWebhookRequest $request): JsonResponse
    {
        $user = User::where('inbound_email_token', $request->validated('token'))->first();

        if (! $user) {
            return response()->json(['message' => 'Unknown token.'], 404);
        }

        $this->service->handle(
            user: $user,
            from: $request->validated('from'),
            subject: $request->validated('subject', ''),
            raw: $request->validated('raw'),
        );

        return response()->json(['message' => 'OK']);
    }
}
