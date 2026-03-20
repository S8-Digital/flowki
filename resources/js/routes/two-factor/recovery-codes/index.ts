import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\TwoFactorController::regenerate
* @see app/Http/Controllers/Settings/TwoFactorController.php:85
* @route '/user/two-factor-recovery-codes'
*/
export const regenerate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerate.url(options),
    method: 'post',
})

regenerate.definition = {
    methods: ["post"],
    url: '/user/two-factor-recovery-codes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::regenerate
* @see app/Http/Controllers/Settings/TwoFactorController.php:85
* @route '/user/two-factor-recovery-codes'
*/
regenerate.url = (options?: RouteQueryOptions) => {
    return regenerate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::regenerate
* @see app/Http/Controllers/Settings/TwoFactorController.php:85
* @route '/user/two-factor-recovery-codes'
*/
regenerate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::regenerate
* @see app/Http/Controllers/Settings/TwoFactorController.php:85
* @route '/user/two-factor-recovery-codes'
*/
const regenerateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::regenerate
* @see app/Http/Controllers/Settings/TwoFactorController.php:85
* @route '/user/two-factor-recovery-codes'
*/
regenerateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerate.url(options),
    method: 'post',
})

regenerate.form = regenerateForm

const recoveryCodes = {
    regenerate: Object.assign(regenerate, regenerate),
}

export default recoveryCodes