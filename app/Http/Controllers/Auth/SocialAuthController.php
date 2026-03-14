<?php

namespace App\Http\Controllers\Auth;

use App\Enums\SocialProvider;
use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect a guest to the social provider to sign in / register.
     */
    public function redirect(string $provider): RedirectResponse
    {
        $socialProvider = SocialProvider::from($provider);
        $state = $this->generateSignedState(['action' => 'login']);

        return Socialite::driver($socialProvider->value)
            ->stateless()
            ->with(['state' => $state])
            ->redirect();
    }

    /**
     * Redirect an authenticated user to the social provider to link an account.
     */
    public function link(string $provider): RedirectResponse
    {
        $socialProvider = SocialProvider::from($provider);
        $state = $this->generateSignedState(['action' => 'link', 'uid' => Auth::id()]);

        return Socialite::driver($socialProvider->value)
            ->stateless()
            ->with(['state' => $state])
            ->redirect();
    }

    /**
     * Handle the OAuth callback for both sign-in and link flows.
     *
     * This runs at the OAuth redirect URI (e.g. http://localhost:8089/auth/google/callback).
     * After processing it issues a one-time resume token and redirects to APP_URL so
     * the session is set on the correct origin (e.g. https://flowki.test).
     */
    public function callback(string $provider, Request $request): RedirectResponse
    {
        $socialProvider = SocialProvider::from($provider);

        if ($request->has('error') || $request->has('denied')) {
            $stateData = $request->state ? $this->verifySignedState($request->state) : null;
            $failRoute = ($stateData && $stateData['action'] === 'link') ? 'profile.edit' : 'login';

            return $this->bridgeError($failRoute, 'Authentication was cancelled or access was denied.');
        }

        $stateData = $request->state ? $this->verifySignedState($request->state) : null;

        if (! $stateData) {
            return $this->bridgeError('login', 'Invalid security token. Please try again.');
        }

        $socialUser = Socialite::driver($socialProvider->value)->stateless()->user();

        if ($stateData['action'] === 'link') {
            return $this->processLink($socialProvider, $socialUser, (int) $stateData['uid']);
        }

        return $this->processLogin($socialProvider, $socialUser);
    }

    /**
     * Resume the session on the correct domain after the OAuth bridge redirect.
     *
     * For login: performs Auth::login() here on the app domain, then redirects to dashboard.
     * For link: just flashes the success/error message — user's session is already live.
     */
    public function resume(Request $request): RedirectResponse
    {
        $data = Cache::pull('social_resume_'.($request->query('token', '')));

        if (! $data) {
            return redirect()->route('login')
                ->withErrors(['social' => 'The sign-in link expired. Please try again.']);
        }

        if (isset($data['error'])) {
            $route = $data['action'] === 'link' ? 'profile.edit' : 'login';

            return redirect()->route($route)->withErrors(['social' => $data['error']]);
        }

        if ($data['action'] === 'login') {
            Auth::loginUsingId($data['user_id'], remember: true);

            return redirect()->intended(route('dashboard'));
        }

        return redirect()->route('profile.edit')->with('status', $data['message']);
    }

    /**
     * Unlink a social provider from the authenticated user's account.
     */
    public function unlink(string $provider): RedirectResponse
    {
        $socialProvider = SocialProvider::from($provider);

        /** @var User $user */
        $user = Auth::user();

        $remainingProviders = $user->socialAccounts()->count();

        if ($remainingProviders <= 1 && ! $user->hasPasswordSet()) {
            return redirect()->route('profile.edit')->withErrors([
                'social' => 'You cannot unlink your only sign-in method. Please set a password first.',
            ]);
        }

        $user->socialAccounts()
            ->where('provider', $socialProvider->value)
            ->delete();

        return redirect()->route('profile.edit')
            ->with('status', $socialProvider->label().' account unlinked successfully.');
    }

    private function processLogin(SocialProvider $provider, SocialiteUser $socialUser): RedirectResponse
    {
        $socialAccount = SocialAccount::query()
            ->where('provider', $provider->value)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($socialAccount) {
            $this->updateSocialAccount($socialAccount, $socialUser);
            $user = $socialAccount->user;
        } else {
            $existingUser = $socialUser->getEmail()
                ? User::query()->where('email', $socialUser->getEmail())->first()
                : null;

            if ($existingUser) {
                $this->createSocialAccount($existingUser, $provider, $socialUser);

                if (! $existingUser->email_verified_at) {
                    $existingUser->markEmailAsVerified();
                }

                $user = $existingUser;
            } else {
                $user = User::create([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                    'email' => $socialUser->getEmail(),
                    'email_verified_at' => now(),
                ]);

                $this->createSocialAccount($user, $provider, $socialUser);
                event(new Registered($user));
            }
        }

        return $this->bridgeResume(['action' => 'login', 'user_id' => $user->id]);
    }

    private function processLink(SocialProvider $provider, SocialiteUser $socialUser, int $userId): RedirectResponse
    {
        $existingSocialAccount = SocialAccount::query()
            ->where('provider', $provider->value)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($existingSocialAccount && $existingSocialAccount->user_id !== $userId) {
            return $this->bridgeResume([
                'action' => 'link',
                'error' => 'This '.$provider->label().' account is already linked to a different account.',
            ]);
        }

        if (! $existingSocialAccount) {
            $user = User::findOrFail($userId);
            $this->createSocialAccount($user, $provider, $socialUser);
        }

        return $this->bridgeResume([
            'action' => 'link',
            'message' => $provider->label().' account linked successfully.',
        ]);
    }

    /**
     * Store resume data in the cache and redirect to APP_URL to complete the flow.
     *
     * @param  array<string, mixed>  $data
     */
    private function bridgeResume(array $data): RedirectResponse
    {
        $token = Str::random(64);
        Cache::put('social_resume_'.$token, $data, now()->addMinutes(5));

        return redirect(config('app.url').'/auth/social/resume?token='.$token);
    }

    /** Redirect an error back to the correct app-domain route via the bridge. */
    private function bridgeError(string $route, string $message): RedirectResponse
    {
        $token = Str::random(64);
        Cache::put('social_resume_'.$token, ['action' => 'error', 'error' => $message, 'route' => $route], now()->addMinutes(5));

        return redirect(config('app.url').'/auth/social/resume?token='.$token);
    }

    private function createSocialAccount(User $user, SocialProvider $provider, SocialiteUser $socialUser): SocialAccount
    {
        return $user->socialAccounts()->create([
            'provider' => $provider->value,
            'provider_id' => $socialUser->getId(),
            'name' => $socialUser->getName(),
            'email' => $socialUser->getEmail(),
            'avatar' => $socialUser->getAvatar(),
            'token' => $socialUser->token,
            'refresh_token' => $socialUser->refreshToken,
            'token_expires_at' => isset($socialUser->expiresIn)
                ? now()->addSeconds($socialUser->expiresIn)
                : null,
        ]);
    }

    private function updateSocialAccount(SocialAccount $socialAccount, SocialiteUser $socialUser): void
    {
        $socialAccount->update([
            'name' => $socialUser->getName(),
            'email' => $socialUser->getEmail(),
            'avatar' => $socialUser->getAvatar(),
            'token' => $socialUser->token,
            'refresh_token' => $socialUser->refreshToken ?? $socialAccount->refresh_token,
            'token_expires_at' => isset($socialUser->expiresIn)
                ? now()->addSeconds($socialUser->expiresIn)
                : $socialAccount->token_expires_at,
        ]);
    }

    /**
     * Generate an HMAC-signed state string encoding the given data.
     * Replaces Socialite's session-based state — required when the OAuth callback
     * lands on a different origin than the redirect (e.g. localhost vs flowki.test).
     *
     * @param  array<string, mixed>  $data
     */
    private function generateSignedState(array $data): string
    {
        $payload = base64_encode((string) json_encode($data));
        $signature = hash_hmac('sha256', $payload, config('app.key'));

        return $payload.'.'.$signature;
    }

    /**
     * Verify and decode a signed state string.
     *
     * @return array<string, mixed>|null
     */
    private function verifySignedState(string $state): ?array
    {
        $parts = explode('.', $state, 2);

        if (count($parts) !== 2) {
            return null;
        }

        [$payload, $signature] = $parts;

        if (! hash_equals(hash_hmac('sha256', $payload, config('app.key')), $signature)) {
            return null;
        }

        return json_decode(base64_decode($payload), true) ?: null;
    }
}
