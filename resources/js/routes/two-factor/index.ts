import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import recoveryCodes250571 from './recovery-codes'
/**
* @see \App\Http\Controllers\Settings\TwoFactorController::enable
* @see app/Http/Controllers/Settings/TwoFactorController.php:19
* @route '/user/two-factor-authentication'
*/
export const enable = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enable.url(options),
    method: 'post',
})

enable.definition = {
    methods: ["post"],
    url: '/user/two-factor-authentication',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::enable
* @see app/Http/Controllers/Settings/TwoFactorController.php:19
* @route '/user/two-factor-authentication'
*/
enable.url = (options?: RouteQueryOptions) => {
    return enable.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::enable
* @see app/Http/Controllers/Settings/TwoFactorController.php:19
* @route '/user/two-factor-authentication'
*/
enable.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enable.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::enable
* @see app/Http/Controllers/Settings/TwoFactorController.php:19
* @route '/user/two-factor-authentication'
*/
const enableForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: enable.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::enable
* @see app/Http/Controllers/Settings/TwoFactorController.php:19
* @route '/user/two-factor-authentication'
*/
enableForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: enable.url(options),
    method: 'post',
})

enable.form = enableForm

/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmedTwoFactorAuthenticationController::confirm
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmedTwoFactorAuthenticationController.php:19
* @route '/user/confirmed-two-factor-authentication'
*/
export const confirm = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirm.url(options),
    method: 'post',
})

confirm.definition = {
    methods: ["post"],
    url: '/user/confirmed-two-factor-authentication',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmedTwoFactorAuthenticationController::confirm
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmedTwoFactorAuthenticationController.php:19
* @route '/user/confirmed-two-factor-authentication'
*/
confirm.url = (options?: RouteQueryOptions) => {
    return confirm.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmedTwoFactorAuthenticationController::confirm
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmedTwoFactorAuthenticationController.php:19
* @route '/user/confirmed-two-factor-authentication'
*/
confirm.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirm.url(options),
    method: 'post',
})

/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmedTwoFactorAuthenticationController::confirm
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmedTwoFactorAuthenticationController.php:19
* @route '/user/confirmed-two-factor-authentication'
*/
const confirmForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirm.url(options),
    method: 'post',
})

/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmedTwoFactorAuthenticationController::confirm
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmedTwoFactorAuthenticationController.php:19
* @route '/user/confirmed-two-factor-authentication'
*/
confirmForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirm.url(options),
    method: 'post',
})

confirm.form = confirmForm

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::confirm
* @see app/Http/Controllers/Settings/TwoFactorController.php:29
* @route '/user/confirmed-two-factor-authentication'
*/
export const confirm = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: confirm.url(options),
    method: 'put',
})

confirm.definition = {
    methods: ["put"],
    url: '/user/confirmed-two-factor-authentication',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::confirm
* @see app/Http/Controllers/Settings/TwoFactorController.php:29
* @route '/user/confirmed-two-factor-authentication'
*/
confirm.url = (options?: RouteQueryOptions) => {
    return confirm.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::confirm
* @see app/Http/Controllers/Settings/TwoFactorController.php:29
* @route '/user/confirmed-two-factor-authentication'
*/
confirm.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: confirm.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::confirm
* @see app/Http/Controllers/Settings/TwoFactorController.php:29
* @route '/user/confirmed-two-factor-authentication'
*/
const confirmForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirm.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::confirm
* @see app/Http/Controllers/Settings/TwoFactorController.php:29
* @route '/user/confirmed-two-factor-authentication'
*/
confirmForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirm.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

confirm.form = confirmForm

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::disable
* @see app/Http/Controllers/Settings/TwoFactorController.php:43
* @route '/user/two-factor-authentication'
*/
export const disable = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disable.url(options),
    method: 'delete',
})

disable.definition = {
    methods: ["delete"],
    url: '/user/two-factor-authentication',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::disable
* @see app/Http/Controllers/Settings/TwoFactorController.php:43
* @route '/user/two-factor-authentication'
*/
disable.url = (options?: RouteQueryOptions) => {
    return disable.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::disable
* @see app/Http/Controllers/Settings/TwoFactorController.php:43
* @route '/user/two-factor-authentication'
*/
disable.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disable.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::disable
* @see app/Http/Controllers/Settings/TwoFactorController.php:43
* @route '/user/two-factor-authentication'
*/
const disableForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disable.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::disable
* @see app/Http/Controllers/Settings/TwoFactorController.php:43
* @route '/user/two-factor-authentication'
*/
disableForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disable.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

disable.form = disableForm

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::qrCode
* @see app/Http/Controllers/Settings/TwoFactorController.php:54
* @route '/user/two-factor-qr-code'
*/
export const qrCode = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: qrCode.url(options),
    method: 'get',
})

qrCode.definition = {
    methods: ["get","head"],
    url: '/user/two-factor-qr-code',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::qrCode
* @see app/Http/Controllers/Settings/TwoFactorController.php:54
* @route '/user/two-factor-qr-code'
*/
qrCode.url = (options?: RouteQueryOptions) => {
    return qrCode.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::qrCode
* @see app/Http/Controllers/Settings/TwoFactorController.php:54
* @route '/user/two-factor-qr-code'
*/
qrCode.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: qrCode.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::qrCode
* @see app/Http/Controllers/Settings/TwoFactorController.php:54
* @route '/user/two-factor-qr-code'
*/
qrCode.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: qrCode.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::qrCode
* @see app/Http/Controllers/Settings/TwoFactorController.php:54
* @route '/user/two-factor-qr-code'
*/
const qrCodeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: qrCode.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::qrCode
* @see app/Http/Controllers/Settings/TwoFactorController.php:54
* @route '/user/two-factor-qr-code'
*/
qrCodeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: qrCode.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::qrCode
* @see app/Http/Controllers/Settings/TwoFactorController.php:54
* @route '/user/two-factor-qr-code'
*/
qrCodeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: qrCode.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

qrCode.form = qrCodeForm

/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController::secretKey
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorSecretKeyController.php:17
* @route '/user/two-factor-secret-key'
*/
export const secretKey = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: secretKey.url(options),
    method: 'get',
})

secretKey.definition = {
    methods: ["get","head"],
    url: '/user/two-factor-secret-key',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController::secretKey
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorSecretKeyController.php:17
* @route '/user/two-factor-secret-key'
*/
secretKey.url = (options?: RouteQueryOptions) => {
    return secretKey.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController::secretKey
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorSecretKeyController.php:17
* @route '/user/two-factor-secret-key'
*/
secretKey.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: secretKey.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController::secretKey
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorSecretKeyController.php:17
* @route '/user/two-factor-secret-key'
*/
secretKey.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: secretKey.url(options),
    method: 'head',
})

/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController::secretKey
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorSecretKeyController.php:17
* @route '/user/two-factor-secret-key'
*/
const secretKeyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: secretKey.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController::secretKey
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorSecretKeyController.php:17
* @route '/user/two-factor-secret-key'
*/
secretKeyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: secretKey.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController::secretKey
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorSecretKeyController.php:17
* @route '/user/two-factor-secret-key'
*/
secretKeyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: secretKey.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

secretKey.form = secretKeyForm

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::recoveryCodes
* @see app/Http/Controllers/Settings/TwoFactorController.php:71
* @route '/user/two-factor-recovery-codes'
*/
export const recoveryCodes = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recoveryCodes.url(options),
    method: 'get',
})

recoveryCodes.definition = {
    methods: ["get","head"],
    url: '/user/two-factor-recovery-codes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::recoveryCodes
* @see app/Http/Controllers/Settings/TwoFactorController.php:71
* @route '/user/two-factor-recovery-codes'
*/
recoveryCodes.url = (options?: RouteQueryOptions) => {
    return recoveryCodes.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::recoveryCodes
* @see app/Http/Controllers/Settings/TwoFactorController.php:71
* @route '/user/two-factor-recovery-codes'
*/
recoveryCodes.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recoveryCodes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::recoveryCodes
* @see app/Http/Controllers/Settings/TwoFactorController.php:71
* @route '/user/two-factor-recovery-codes'
*/
recoveryCodes.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: recoveryCodes.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::recoveryCodes
* @see app/Http/Controllers/Settings/TwoFactorController.php:71
* @route '/user/two-factor-recovery-codes'
*/
const recoveryCodesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: recoveryCodes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::recoveryCodes
* @see app/Http/Controllers/Settings/TwoFactorController.php:71
* @route '/user/two-factor-recovery-codes'
*/
recoveryCodesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: recoveryCodes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::recoveryCodes
* @see app/Http/Controllers/Settings/TwoFactorController.php:71
* @route '/user/two-factor-recovery-codes'
*/
recoveryCodesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: recoveryCodes.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

recoveryCodes.form = recoveryCodesForm

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::login
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:29
* @route '/two-factor-challenge'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/two-factor-challenge',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::login
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:29
* @route '/two-factor-challenge'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::login
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:29
* @route '/two-factor-challenge'
*/
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::login
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:29
* @route '/two-factor-challenge'
*/
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::login
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:29
* @route '/two-factor-challenge'
*/
const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::login
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:29
* @route '/two-factor-challenge'
*/
loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::login
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:29
* @route '/two-factor-challenge'
*/
loginForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

login.form = loginForm

const twoFactor = {
    login: Object.assign(login, login),
    enable: Object.assign(enable, enable),
    confirm: Object.assign(confirm, confirm),
    disable: Object.assign(disable, disable),
    qrCode: Object.assign(qrCode, qrCode),
    secretKey: Object.assign(secretKey, secretKey),
    recoveryCodes: Object.assign(recoveryCodes, recoveryCodes250571),
}

export default twoFactor