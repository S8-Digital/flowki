import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\FirebaseServiceWorkerController::__invoke
* @see app/Http/Controllers/FirebaseServiceWorkerController.php:9
* @route '/firebase-messaging-sw.js'
*/
export const sw = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sw.url(options),
    method: 'get',
})

sw.definition = {
    methods: ["get","head"],
    url: '/firebase-messaging-sw.js',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FirebaseServiceWorkerController::__invoke
* @see app/Http/Controllers/FirebaseServiceWorkerController.php:9
* @route '/firebase-messaging-sw.js'
*/
sw.url = (options?: RouteQueryOptions) => {
    return sw.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FirebaseServiceWorkerController::__invoke
* @see app/Http/Controllers/FirebaseServiceWorkerController.php:9
* @route '/firebase-messaging-sw.js'
*/
sw.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: sw.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FirebaseServiceWorkerController::__invoke
* @see app/Http/Controllers/FirebaseServiceWorkerController.php:9
* @route '/firebase-messaging-sw.js'
*/
sw.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: sw.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\FirebaseServiceWorkerController::__invoke
* @see app/Http/Controllers/FirebaseServiceWorkerController.php:9
* @route '/firebase-messaging-sw.js'
*/
const swForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: sw.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FirebaseServiceWorkerController::__invoke
* @see app/Http/Controllers/FirebaseServiceWorkerController.php:9
* @route '/firebase-messaging-sw.js'
*/
swForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: sw.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FirebaseServiceWorkerController::__invoke
* @see app/Http/Controllers/FirebaseServiceWorkerController.php:9
* @route '/firebase-messaging-sw.js'
*/
swForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: sw.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

sw.form = swForm

const firebase = {
    sw: Object.assign(sw, sw),
}

export default firebase