import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\GoogleCalendarController::redirect
* @see app/Http/Controllers/GoogleCalendarController.php:14
* @route '/auth/google/calendar'
*/
export const redirect = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: redirect.url(options),
    method: 'get',
})

redirect.definition = {
    methods: ["get","head"],
    url: '/auth/google/calendar',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GoogleCalendarController::redirect
* @see app/Http/Controllers/GoogleCalendarController.php:14
* @route '/auth/google/calendar'
*/
redirect.url = (options?: RouteQueryOptions) => {
    return redirect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GoogleCalendarController::redirect
* @see app/Http/Controllers/GoogleCalendarController.php:14
* @route '/auth/google/calendar'
*/
redirect.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: redirect.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GoogleCalendarController::redirect
* @see app/Http/Controllers/GoogleCalendarController.php:14
* @route '/auth/google/calendar'
*/
redirect.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: redirect.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GoogleCalendarController::redirect
* @see app/Http/Controllers/GoogleCalendarController.php:14
* @route '/auth/google/calendar'
*/
const redirectForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: redirect.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GoogleCalendarController::redirect
* @see app/Http/Controllers/GoogleCalendarController.php:14
* @route '/auth/google/calendar'
*/
redirectForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: redirect.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GoogleCalendarController::redirect
* @see app/Http/Controllers/GoogleCalendarController.php:14
* @route '/auth/google/calendar'
*/
redirectForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: redirect.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

redirect.form = redirectForm

/**
* @see \App\Http\Controllers\GoogleCalendarController::callback
* @see app/Http/Controllers/GoogleCalendarController.php:22
* @route '/auth/google/calendar/callback'
*/
export const callback = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: callback.url(options),
    method: 'get',
})

callback.definition = {
    methods: ["get","head"],
    url: '/auth/google/calendar/callback',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GoogleCalendarController::callback
* @see app/Http/Controllers/GoogleCalendarController.php:22
* @route '/auth/google/calendar/callback'
*/
callback.url = (options?: RouteQueryOptions) => {
    return callback.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GoogleCalendarController::callback
* @see app/Http/Controllers/GoogleCalendarController.php:22
* @route '/auth/google/calendar/callback'
*/
callback.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: callback.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GoogleCalendarController::callback
* @see app/Http/Controllers/GoogleCalendarController.php:22
* @route '/auth/google/calendar/callback'
*/
callback.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: callback.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GoogleCalendarController::callback
* @see app/Http/Controllers/GoogleCalendarController.php:22
* @route '/auth/google/calendar/callback'
*/
const callbackForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: callback.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GoogleCalendarController::callback
* @see app/Http/Controllers/GoogleCalendarController.php:22
* @route '/auth/google/calendar/callback'
*/
callbackForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: callback.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GoogleCalendarController::callback
* @see app/Http/Controllers/GoogleCalendarController.php:22
* @route '/auth/google/calendar/callback'
*/
callbackForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: callback.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

callback.form = callbackForm

/**
* @see \App\Http\Controllers\GoogleCalendarController::disconnect
* @see app/Http/Controllers/GoogleCalendarController.php:47
* @route '/auth/google/calendar'
*/
export const disconnect = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disconnect.url(options),
    method: 'delete',
})

disconnect.definition = {
    methods: ["delete"],
    url: '/auth/google/calendar',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\GoogleCalendarController::disconnect
* @see app/Http/Controllers/GoogleCalendarController.php:47
* @route '/auth/google/calendar'
*/
disconnect.url = (options?: RouteQueryOptions) => {
    return disconnect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GoogleCalendarController::disconnect
* @see app/Http/Controllers/GoogleCalendarController.php:47
* @route '/auth/google/calendar'
*/
disconnect.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disconnect.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\GoogleCalendarController::disconnect
* @see app/Http/Controllers/GoogleCalendarController.php:47
* @route '/auth/google/calendar'
*/
const disconnectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disconnect.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GoogleCalendarController::disconnect
* @see app/Http/Controllers/GoogleCalendarController.php:47
* @route '/auth/google/calendar'
*/
disconnectForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disconnect.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

disconnect.form = disconnectForm

const GoogleCalendarController = { redirect, callback, disconnect }

export default GoogleCalendarController