<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Actions\ConfirmTwoFactorAuthentication;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;

class TwoFactorController extends Controller
{
    /**
     * Enable two-factor authentication for the authenticated user.
     */
    public function store(Request $request, EnableTwoFactorAuthentication $enable): RedirectResponse
    {
        $enable($request->user());

        return back()->with('status', 'two-factor-authentication-enabled');
    }

    /**
     * Confirm and finalise two-factor authentication setup.
     */
    public function update(Request $request, ConfirmTwoFactorAuthentication $confirm): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $confirm($request->user(), $request->input('code'));

        return back()->with('status', 'two-factor-authentication-confirmed');
    }

    /**
     * Disable two-factor authentication for the authenticated user.
     */
    public function destroy(Request $request, DisableTwoFactorAuthentication $disable): RedirectResponse
    {
        $disable($request->user());

        return back()->with('status', 'two-factor-authentication-disabled');
    }

    /**
     * Return the user's QR code SVG and secret key for setup.
     * Only available while 2FA has not yet been confirmed.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        if (is_null($user->two_factor_secret) || ! is_null($user->two_factor_confirmed_at)) {
            abort(404);
        }

        return response()->json([
            'svg' => $user->twoFactorQrCodeSvg(),
            'secretKey' => decrypt($user->two_factor_secret),
        ]);
    }

    /**
     * Return the user's recovery codes.
     */
    public function recoveryCodes(Request $request): JsonResponse
    {
        $user = $request->user();

        if (is_null($user->two_factor_secret)) {
            abort(404);
        }

        return response()->json($user->recoveryCodes());
    }

    /**
     * Regenerate the user's recovery codes.
     */
    public function regenerateRecoveryCodes(Request $request, GenerateNewRecoveryCodes $generate): RedirectResponse
    {
        if (is_null($request->user()->two_factor_secret)) {
            abort(404);
        }

        $generate($request->user());

        return back()->with('status', 'recovery-codes-regenerated');
    }
}
