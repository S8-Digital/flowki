import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\CategoriesController::edit
* @see app/Http/Controllers/Settings/CategoriesController.php:13
* @route '/settings/categories'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/settings/categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\CategoriesController::edit
* @see app/Http/Controllers/Settings/CategoriesController.php:13
* @route '/settings/categories'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\CategoriesController::edit
* @see app/Http/Controllers/Settings/CategoriesController.php:13
* @route '/settings/categories'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\CategoriesController::edit
* @see app/Http/Controllers/Settings/CategoriesController.php:13
* @route '/settings/categories'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\CategoriesController::update
* @see app/Http/Controllers/Settings/CategoriesController.php:26
* @route '/settings/categories'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/settings/categories',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\CategoriesController::update
* @see app/Http/Controllers/Settings/CategoriesController.php:26
* @route '/settings/categories'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\CategoriesController::update
* @see app/Http/Controllers/Settings/CategoriesController.php:26
* @route '/settings/categories'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

const CategoriesController = { edit, update }

export default CategoriesController