import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\MemberOrderController::update
* @see app/Http/Controllers/Settings/MemberOrderController.php:11
* @route '/settings/members/order'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/settings/members/order',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Settings\MemberOrderController::update
* @see app/Http/Controllers/Settings/MemberOrderController.php:11
* @route '/settings/members/order'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\MemberOrderController::update
* @see app/Http/Controllers/Settings/MemberOrderController.php:11
* @route '/settings/members/order'
*/
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Settings\MemberOrderController::update
* @see app/Http/Controllers/Settings/MemberOrderController.php:11
* @route '/settings/members/order'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\MemberOrderController::update
* @see app/Http/Controllers/Settings/MemberOrderController.php:11
* @route '/settings/members/order'
*/
updateForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const MemberOrderController = { update }

export default MemberOrderController