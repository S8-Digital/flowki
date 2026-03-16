import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\FcmTokenController::store
* @see app/Http/Controllers/FcmTokenController.php:12
* @route '/fcm-tokens'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/fcm-tokens',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FcmTokenController::store
* @see app/Http/Controllers/FcmTokenController.php:12
* @route '/fcm-tokens'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FcmTokenController::store
* @see app/Http/Controllers/FcmTokenController.php:12
* @route '/fcm-tokens'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FcmTokenController::destroy
* @see app/Http/Controllers/FcmTokenController.php:22
* @route '/fcm-tokens/{token}'
*/
export const destroy = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/fcm-tokens/{token}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\FcmTokenController::destroy
* @see app/Http/Controllers/FcmTokenController.php:22
* @route '/fcm-tokens/{token}'
*/
destroy.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return destroy.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FcmTokenController::destroy
* @see app/Http/Controllers/FcmTokenController.php:22
* @route '/fcm-tokens/{token}'
*/
destroy.delete = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const fcmTokens = {
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default fcmTokens