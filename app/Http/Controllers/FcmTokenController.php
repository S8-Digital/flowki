<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFcmTokenRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FcmTokenController extends Controller
{
    public function store(StoreFcmTokenRequest $request): JsonResponse
    {
        $request->user()->fcmTokens()->updateOrCreate(
            ['token' => $request->validated('token')],
            ['device_type' => $request->validated('device_type', 'web')],
        );

        return response()->json(['message' => 'FCM token registered.']);
    }

    public function destroy(Request $request, string $token): JsonResponse
    {
        $request->user()
            ->fcmTokens()
            ->where('token', $token)
            ->delete();

        return response()->json(['message' => 'FCM token removed.']);
    }
}
