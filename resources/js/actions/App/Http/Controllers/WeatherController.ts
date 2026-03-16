import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\WeatherController::index
* @see app/Http/Controllers/WeatherController.php:18
* @route '/weather'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/weather',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WeatherController::index
* @see app/Http/Controllers/WeatherController.php:18
* @route '/weather'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WeatherController::index
* @see app/Http/Controllers/WeatherController.php:18
* @route '/weather'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WeatherController::index
* @see app/Http/Controllers/WeatherController.php:18
* @route '/weather'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WeatherController::index
* @see app/Http/Controllers/WeatherController.php:18
* @route '/weather'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WeatherController::index
* @see app/Http/Controllers/WeatherController.php:18
* @route '/weather'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WeatherController::index
* @see app/Http/Controllers/WeatherController.php:18
* @route '/weather'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

const WeatherController = { index }

export default WeatherController
