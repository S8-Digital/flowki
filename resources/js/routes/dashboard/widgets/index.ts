import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\DashboardController::store
* @see app/Http/Controllers/DashboardController.php:57
* @route '/dashboard/widgets'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/dashboard/widgets',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DashboardController::store
* @see app/Http/Controllers/DashboardController.php:57
* @route '/dashboard/widgets'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::store
* @see app/Http/Controllers/DashboardController.php:57
* @route '/dashboard/widgets'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DashboardController::store
* @see app/Http/Controllers/DashboardController.php:57
* @route '/dashboard/widgets'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DashboardController::store
* @see app/Http/Controllers/DashboardController.php:57
* @route '/dashboard/widgets'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\DashboardController::update
* @see app/Http/Controllers/DashboardController.php:76
* @route '/dashboard/widgets/{dashboardWidget}'
*/
export const update = (args: { dashboardWidget: string | number | { id: string | number } } | [dashboardWidget: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/dashboard/widgets/{dashboardWidget}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\DashboardController::update
* @see app/Http/Controllers/DashboardController.php:76
* @route '/dashboard/widgets/{dashboardWidget}'
*/
update.url = (args: { dashboardWidget: string | number | { id: string | number } } | [dashboardWidget: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { dashboardWidget: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { dashboardWidget: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            dashboardWidget: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        dashboardWidget: typeof args.dashboardWidget === 'object'
        ? args.dashboardWidget.id
        : args.dashboardWidget,
    }

    return update.definition.url
            .replace('{dashboardWidget}', parsedArgs.dashboardWidget.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::update
* @see app/Http/Controllers/DashboardController.php:76
* @route '/dashboard/widgets/{dashboardWidget}'
*/
update.patch = (args: { dashboardWidget: string | number | { id: string | number } } | [dashboardWidget: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\DashboardController::update
* @see app/Http/Controllers/DashboardController.php:76
* @route '/dashboard/widgets/{dashboardWidget}'
*/
const updateForm = (args: { dashboardWidget: string | number | { id: string | number } } | [dashboardWidget: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DashboardController::update
* @see app/Http/Controllers/DashboardController.php:76
* @route '/dashboard/widgets/{dashboardWidget}'
*/
updateForm.patch = (args: { dashboardWidget: string | number | { id: string | number } } | [dashboardWidget: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\DashboardController::reorder
* @see app/Http/Controllers/DashboardController.php:89
* @route '/dashboard/widgets/reorder'
*/
export const reorder = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(options),
    method: 'post',
})

reorder.definition = {
    methods: ["post"],
    url: '/dashboard/widgets/reorder',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DashboardController::reorder
* @see app/Http/Controllers/DashboardController.php:89
* @route '/dashboard/widgets/reorder'
*/
reorder.url = (options?: RouteQueryOptions) => {
    return reorder.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::reorder
* @see app/Http/Controllers/DashboardController.php:89
* @route '/dashboard/widgets/reorder'
*/
reorder.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DashboardController::reorder
* @see app/Http/Controllers/DashboardController.php:89
* @route '/dashboard/widgets/reorder'
*/
const reorderForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reorder.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DashboardController::reorder
* @see app/Http/Controllers/DashboardController.php:89
* @route '/dashboard/widgets/reorder'
*/
reorderForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reorder.url(options),
    method: 'post',
})

reorder.form = reorderForm

/**
* @see \App\Http\Controllers\DashboardController::destroy
* @see app/Http/Controllers/DashboardController.php:105
* @route '/dashboard/widgets/{dashboardWidget}'
*/
export const destroy = (args: { dashboardWidget: string | number | { id: string | number } } | [dashboardWidget: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/dashboard/widgets/{dashboardWidget}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DashboardController::destroy
* @see app/Http/Controllers/DashboardController.php:105
* @route '/dashboard/widgets/{dashboardWidget}'
*/
destroy.url = (args: { dashboardWidget: string | number | { id: string | number } } | [dashboardWidget: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { dashboardWidget: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { dashboardWidget: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            dashboardWidget: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        dashboardWidget: typeof args.dashboardWidget === 'object'
        ? args.dashboardWidget.id
        : args.dashboardWidget,
    }

    return destroy.definition.url
            .replace('{dashboardWidget}', parsedArgs.dashboardWidget.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::destroy
* @see app/Http/Controllers/DashboardController.php:105
* @route '/dashboard/widgets/{dashboardWidget}'
*/
destroy.delete = (args: { dashboardWidget: string | number | { id: string | number } } | [dashboardWidget: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DashboardController::destroy
* @see app/Http/Controllers/DashboardController.php:105
* @route '/dashboard/widgets/{dashboardWidget}'
*/
const destroyForm = (args: { dashboardWidget: string | number | { id: string | number } } | [dashboardWidget: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DashboardController::destroy
* @see app/Http/Controllers/DashboardController.php:105
* @route '/dashboard/widgets/{dashboardWidget}'
*/
destroyForm.delete = (args: { dashboardWidget: string | number | { id: string | number } } | [dashboardWidget: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const widgets = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    reorder: Object.assign(reorder, reorder),
    destroy: Object.assign(destroy, destroy),
}

export default widgets