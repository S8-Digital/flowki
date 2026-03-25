<?php

declare(strict_types=1);

namespace App\Http\Controllers\Mobile;

use App\Ai\FamilyAssistantAgent;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoiceCommandController extends Controller
{
    /**
     * Process a natural-language voice command and execute it via the AI agent.
     *
     * The agent dispatches the appropriate tool (create_todo, add_shopping_item,
     * complete_chore, etc.), which saves to Postgres. Model observers then push
     * the change to Firebase Realtime Database for instant sync across devices.
     *
     * Rate-limited to 20 requests per minute per user (see routes/mobile.php).
     */
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'command' => ['required', 'string', 'max:500'],
        ]);

        $user = $request->user();

        if (! $user->family_id) {
            return response()->json([
                'success' => false,
                'response' => 'You must be part of a family before using voice commands.',
            ], 422);
        }

        if (! config('ai.providers.anthropic.key') && ! config('ai.providers.gemini.key')) {
            return response()->json([
                'success' => false,
                'response' => 'AI is not configured on this server.',
            ], 503);
        }

        $agent = new FamilyAssistantAgent($user);
        $result = $agent->prompt($request->string('command')->toString());

        return response()->json([
            'success' => true,
            'response' => $result->text,
        ]);
    }
}
