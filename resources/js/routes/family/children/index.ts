import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\FamilyController::add
* @see app/Http/Controllers/FamilyController.php:143
* @route '/family/children'
*/
export const add = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(options),
    method: 'post',
})

add.definition = {
    methods: ["post"],
    url: '/family/children',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FamilyController::add
* @see app/Http/Controllers/FamilyController.php:143
* @route '/family/children'
*/
add.url = (options?: RouteQueryOptions) => {
    return add.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FamilyController::add
* @see app/Http/Controllers/FamilyController.php:143
* @route '/family/children'
*/
add.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: add.url(options),
    method: 'post',
})

const children = {
    add: Object.assign(add, add),
}

export default children