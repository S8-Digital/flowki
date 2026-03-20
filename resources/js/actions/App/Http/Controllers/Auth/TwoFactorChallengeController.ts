import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::store
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:41
* @route '/two-factor-challenge'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/two-factor-challenge',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::store
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:41
* @route '/two-factor-challenge'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::store
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:41
* @route '/two-factor-challenge'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::store
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:41
* @route '/two-factor-challenge'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::store
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:41
* @route '/two-factor-challenge'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::create
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:29
* @route '/two-factor-challenge'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/two-factor-challenge',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::create
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:29
* @route '/two-factor-challenge'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::create
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:29
* @route '/two-factor-challenge'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::create
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:29
* @route '/two-factor-challenge'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::create
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:29
* @route '/two-factor-challenge'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::create
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:29
* @route '/two-factor-challenge'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\TwoFactorChallengeController::create
* @see app/Http/Controllers/Auth/TwoFactorChallengeController.php:29
* @route '/two-factor-challenge'
*/
createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

create.form = createForm

const TwoFactorChallengeController = { store, create }

export default TwoFactorChallengeController