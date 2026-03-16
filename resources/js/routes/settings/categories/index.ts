import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
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

const categories = {
    update: Object.assign(update, update),
}

export default categories