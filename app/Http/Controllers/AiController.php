<?php

namespace App\Http\Controllers;

use App\Ai\FamilyAssistantAgent;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AiController extends Controller
{
    public function index(): \Inertia\Response
    {
        return Inertia::render('Assistant/Index');
    }

    public function chat(Request $request): Response|StreamedResponse
    {
        $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'history' => ['nullable', 'array', 'max:50'],
            'history.*.role' => ['required', 'string', 'in:user,assistant'],
            'history.*.content' => ['required', 'string', 'max:10000'],
        ]);

        $user = $request->user();

        if (! config('ai.providers.openai.key') && ! config('ai.providers.anthropic.key')) {
            return response('data: {"text":"AI is not configured. Please add an API key to your .env file."}'."\n\ndata: [DONE]\n\n", 200, [
                'Content-Type' => 'text/event-stream',
                'Cache-Control' => 'no-cache',
            ]);
        }

        $agent = new FamilyAssistantAgent($user, $request->history ?? []);

        return $agent->stream($request->message)->toResponse($request);
    }
}
