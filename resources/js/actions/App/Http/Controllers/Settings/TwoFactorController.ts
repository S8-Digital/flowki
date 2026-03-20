import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\TwoFactorController::store
* @see app/Http/Controllers/Settings/TwoFactorController.php:19
* @route '/user/two-factor-authentication'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/user/two-factor-authentication',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::store
* @see app/Http/Controllers/Settings/TwoFactorController.php:19
* @route '/user/two-factor-authentication'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::store
* @see app/Http/Controllers/Settings/TwoFactorController.php:19
* @route '/user/two-factor-authentication'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::store
* @see app/Http/Controllers/Settings/TwoFactorController.php:19
* @route '/user/two-factor-authentication'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::store
* @see app/Http/Controllers/Settings/TwoFactorController.php:19
* @route '/user/two-factor-authentication'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::destroy
* @see app/Http/Controllers/Settings/TwoFactorController.php:43
* @route '/user/two-factor-authentication'
*/
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/user/two-factor-authentication',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::destroy
* @see app/Http/Controllers/Settings/TwoFactorController.php:43
* @route '/user/two-factor-authentication'
*/
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::destroy
* @see app/Http/Controllers/Settings/TwoFactorController.php:43
* @route '/user/two-factor-authentication'
*/
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::destroy
* @see app/Http/Controllers/Settings/TwoFactorController.php:43
* @route '/user/two-factor-authentication'
*/
const destroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::destroy
* @see app/Http/Controllers/Settings/TwoFactorController.php:43
* @route '/user/two-factor-authentication'
*/
destroyForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::show
* @see app/Http/Controllers/Settings/TwoFactorController.php:54
* @route '/user/two-factor-qr-code'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/user/two-factor-qr-code',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::show
* @see app/Http/Controllers/Settings/TwoFactorController.php:54
* @route '/user/two-factor-qr-code'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::show
* @see app/Http/Controllers/Settings/TwoFactorController.php:54
* @route '/user/two-factor-qr-code'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::show
* @see app/Http/Controllers/Settings/TwoFactorController.php:54
* @route '/user/two-factor-qr-code'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::show
* @see app/Http/Controllers/Settings/TwoFactorController.php:54
* @route '/user/two-factor-qr-code'
*/
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::show
* @see app/Http/Controllers/Settings/TwoFactorController.php:54
* @route '/user/two-factor-qr-code'
*/
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::show
* @see app/Http/Controllers/Settings/TwoFactorController.php:54
* @route '/user/two-factor-qr-code'
*/
showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

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
* @see \App\Http\Controllers\Settings\TwoFactorController::regenerateRecoveryCodes
* @see app/Http/Controllers/Settings/TwoFactorController.php:85
* @route '/user/two-factor-recovery-codes'
*/
export const regenerateRecoveryCodes = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateRecoveryCodes.url(options),
    method: 'post',
})

regenerateRecoveryCodes.definition = {
    methods: ["post"],
    url: '/user/two-factor-recovery-codes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::regenerateRecoveryCodes
* @see app/Http/Controllers/Settings/TwoFactorController.php:85
* @route '/user/two-factor-recovery-codes'
*/
regenerateRecoveryCodes.url = (options?: RouteQueryOptions) => {
    return regenerateRecoveryCodes.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::regenerateRecoveryCodes
* @see app/Http/Controllers/Settings/TwoFactorController.php:85
* @route '/user/two-factor-recovery-codes'
*/
regenerateRecoveryCodes.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateRecoveryCodes.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::regenerateRecoveryCodes
* @see app/Http/Controllers/Settings/TwoFactorController.php:85
* @route '/user/two-factor-recovery-codes'
*/
const regenerateRecoveryCodesForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerateRecoveryCodes.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::regenerateRecoveryCodes
* @see app/Http/Controllers/Settings/TwoFactorController.php:85
* @route '/user/two-factor-recovery-codes'
*/
regenerateRecoveryCodesForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: regenerateRecoveryCodes.url(options),
    method: 'post',
})

regenerateRecoveryCodes.form = regenerateRecoveryCodesForm

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::update
* @see app/Http/Controllers/Settings/TwoFactorController.php:29
* @route '/user/confirmed-two-factor-authentication'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/user/confirmed-two-factor-authentication',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::update
* @see app/Http/Controllers/Settings/TwoFactorController.php:29
* @route '/user/confirmed-two-factor-authentication'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::update
* @see app/Http/Controllers/Settings/TwoFactorController.php:29
* @route '/user/confirmed-two-factor-authentication'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::update
* @see app/Http/Controllers/Settings/TwoFactorController.php:29
* @route '/user/confirmed-two-factor-authentication'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\TwoFactorController::update
* @see app/Http/Controllers/Settings/TwoFactorController.php:29
* @route '/user/confirmed-two-factor-authentication'
*/
updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const TwoFactorController = { store, destroy, show, recoveryCodes, regenerateRecoveryCodes, update }

export default TwoFactorController