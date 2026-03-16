import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\FirebaseServiceWorkerController::__invoke
* @see app/Http/Controllers/FirebaseServiceWorkerController.php:9
* @route '/firebase-messaging-sw.js'
*/
const FirebaseServiceWorkerController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: FirebaseServiceWorkerController.url(options),
    method: 'get',
})

FirebaseServiceWorkerController.definition = {
    methods: ["get","head"],
    url: '/firebase-messaging-sw.js',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FirebaseServiceWorkerController::__invoke
* @see app/Http/Controllers/FirebaseServiceWorkerController.php:9
* @route '/firebase-messaging-sw.js'
*/
FirebaseServiceWorkerController.url = (options?: RouteQueryOptions) => {
    return FirebaseServiceWorkerController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FirebaseServiceWorkerController::__invoke
* @see app/Http/Controllers/FirebaseServiceWorkerController.php:9
* @route '/firebase-messaging-sw.js'
*/
FirebaseServiceWorkerController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: FirebaseServiceWorkerController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FirebaseServiceWorkerController::__invoke
* @see app/Http/Controllers/FirebaseServiceWorkerController.php:9
* @route '/firebase-messaging-sw.js'
*/
FirebaseServiceWorkerController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: FirebaseServiceWorkerController.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\FirebaseServiceWorkerController::__invoke
* @see app/Http/Controllers/FirebaseServiceWorkerController.php:9
* @route '/firebase-messaging-sw.js'
*/
const FirebaseServiceWorkerControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: FirebaseServiceWorkerController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FirebaseServiceWorkerController::__invoke
* @see app/Http/Controllers/FirebaseServiceWorkerController.php:9
* @route '/firebase-messaging-sw.js'
*/
FirebaseServiceWorkerControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: FirebaseServiceWorkerController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FirebaseServiceWorkerController::__invoke
* @see app/Http/Controllers/FirebaseServiceWorkerController.php:9
* @route '/firebase-messaging-sw.js'
*/
FirebaseServiceWorkerControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: FirebaseServiceWorkerController.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

FirebaseServiceWorkerController.form = FirebaseServiceWorkerControllerForm

export default FirebaseServiceWorkerController