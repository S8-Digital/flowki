import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import categories08bc8d from './categories'
/**
* @see \App\Http\Controllers\Settings\CategoriesController::categories
* @see app/Http/Controllers/Settings/CategoriesController.php:13
* @route '/settings/categories'
*/
export const categories = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: categories.url(options),
    method: 'get',
})

categories.definition = {
    methods: ["get","head"],
    url: '/settings/categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\CategoriesController::categories
* @see app/Http/Controllers/Settings/CategoriesController.php:13
* @route '/settings/categories'
*/
categories.url = (options?: RouteQueryOptions) => {
    return categories.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\CategoriesController::categories
* @see app/Http/Controllers/Settings/CategoriesController.php:13
* @route '/settings/categories'
*/
categories.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: categories.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\CategoriesController::categories
* @see app/Http/Controllers/Settings/CategoriesController.php:13
* @route '/settings/categories'
*/
categories.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: categories.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\CategoriesController::categories
* @see app/Http/Controllers/Settings/CategoriesController.php:13
* @route '/settings/categories'
*/
const categoriesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: categories.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\CategoriesController::categories
* @see app/Http/Controllers/Settings/CategoriesController.php:13
* @route '/settings/categories'
*/
categoriesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: categories.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\CategoriesController::categories
* @see app/Http/Controllers/Settings/CategoriesController.php:13
* @route '/settings/categories'
*/
categoriesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: categories.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

categories.form = categoriesForm

const settings = {
    categories: Object.assign(categories, categories08bc8d),
}

export default settings