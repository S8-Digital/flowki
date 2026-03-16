import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
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
* @see \App\Http\Controllers\DashboardController::update
* @see app/Http/Controllers/DashboardController.php:76
* @route '/dashboard/widgets/{dashboardWidget}'
*/
export const update = (args: { dashboardWidget: number | { id: number } } | [dashboardWidget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
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
update.url = (args: { dashboardWidget: number | { id: number } } | [dashboardWidget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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
update.patch = (args: { dashboardWidget: number | { id: number } } | [dashboardWidget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

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
* @see \App\Http\Controllers\DashboardController::destroy
* @see app/Http/Controllers/DashboardController.php:105
* @route '/dashboard/widgets/{dashboardWidget}'
*/
export const destroy = (args: { dashboardWidget: number | { id: number } } | [dashboardWidget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
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
destroy.url = (args: { dashboardWidget: number | { id: number } } | [dashboardWidget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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
destroy.delete = (args: { dashboardWidget: number | { id: number } } | [dashboardWidget: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const widgets = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    reorder: Object.assign(reorder, reorder),
    destroy: Object.assign(destroy, destroy),
}

export default widgets