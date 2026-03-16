import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
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

const calendar = {
    redirect: Object.assign(redirect, redirect),
    callback: Object.assign(callback, callback),
    disconnect: Object.assign(disconnect, disconnect),
}

export default calendar