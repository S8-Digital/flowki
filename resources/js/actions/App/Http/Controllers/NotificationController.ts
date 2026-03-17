import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\NotificationController::index
* @see app/Http/Controllers/NotificationController.php:13
* @route '/notifications'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\NotificationController::index
* @see app/Http/Controllers/NotificationController.php:13
* @route '/notifications'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\NotificationController::index
* @see app/Http/Controllers/NotificationController.php:13
* @route '/notifications'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\NotificationController::index
* @see app/Http/Controllers/NotificationController.php:13
* @route '/notifications'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\NotificationController::index
* @see app/Http/Controllers/NotificationController.php:13
* @route '/notifications'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\NotificationController::index
* @see app/Http/Controllers/NotificationController.php:13
* @route '/notifications'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\NotificationController::index
* @see app/Http/Controllers/NotificationController.php:13
* @route '/notifications'
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

/**
* @see \App\Http\Controllers\NotificationController::recent
* @see app/Http/Controllers/NotificationController.php:28
* @route '/notifications/recent'
*/
export const recent = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recent.url(options),
    method: 'get',
})

recent.definition = {
    methods: ["get","head"],
    url: '/notifications/recent',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\NotificationController::recent
* @see app/Http/Controllers/NotificationController.php:28
* @route '/notifications/recent'
*/
recent.url = (options?: RouteQueryOptions) => {
    return recent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\NotificationController::recent
* @see app/Http/Controllers/NotificationController.php:28
* @route '/notifications/recent'
*/
recent.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recent.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\NotificationController::recent
* @see app/Http/Controllers/NotificationController.php:28
* @route '/notifications/recent'
*/
recent.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: recent.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\NotificationController::recent
* @see app/Http/Controllers/NotificationController.php:28
* @route '/notifications/recent'
*/
const recentForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: recent.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\NotificationController::recent
* @see app/Http/Controllers/NotificationController.php:28
* @route '/notifications/recent'
*/
recentForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: recent.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\NotificationController::recent
* @see app/Http/Controllers/NotificationController.php:28
* @route '/notifications/recent'
*/
recentForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: recent.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

recent.form = recentForm

/**
* @see \App\Http\Controllers\NotificationController::unreadCount
* @see app/Http/Controllers/NotificationController.php:81
* @route '/notifications/unread-count'
*/
export const unreadCount = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: unreadCount.url(options),
    method: 'get',
})

unreadCount.definition = {
    methods: ["get","head"],
    url: '/notifications/unread-count',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\NotificationController::unreadCount
* @see app/Http/Controllers/NotificationController.php:81
* @route '/notifications/unread-count'
*/
unreadCount.url = (options?: RouteQueryOptions) => {
    return unreadCount.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\NotificationController::unreadCount
* @see app/Http/Controllers/NotificationController.php:81
* @route '/notifications/unread-count'
*/
unreadCount.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: unreadCount.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\NotificationController::unreadCount
* @see app/Http/Controllers/NotificationController.php:81
* @route '/notifications/unread-count'
*/
unreadCount.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: unreadCount.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\NotificationController::unreadCount
* @see app/Http/Controllers/NotificationController.php:81
* @route '/notifications/unread-count'
*/
const unreadCountForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: unreadCount.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\NotificationController::unreadCount
* @see app/Http/Controllers/NotificationController.php:81
* @route '/notifications/unread-count'
*/
unreadCountForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: unreadCount.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\NotificationController::unreadCount
* @see app/Http/Controllers/NotificationController.php:81
* @route '/notifications/unread-count'
*/
unreadCountForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: unreadCount.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

unreadCount.form = unreadCountForm

/**
* @see \App\Http\Controllers\NotificationController::markAllRead
* @see app/Http/Controllers/NotificationController.php:61
* @route '/notifications/read-all'
*/
export const markAllRead = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead.url(options),
    method: 'post',
})

markAllRead.definition = {
    methods: ["post"],
    url: '/notifications/read-all',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\NotificationController::markAllRead
* @see app/Http/Controllers/NotificationController.php:61
* @route '/notifications/read-all'
*/
markAllRead.url = (options?: RouteQueryOptions) => {
    return markAllRead.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\NotificationController::markAllRead
* @see app/Http/Controllers/NotificationController.php:61
* @route '/notifications/read-all'
*/
markAllRead.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markAllRead.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\NotificationController::markAllRead
* @see app/Http/Controllers/NotificationController.php:61
* @route '/notifications/read-all'
*/
const markAllReadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAllRead.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\NotificationController::markAllRead
* @see app/Http/Controllers/NotificationController.php:61
* @route '/notifications/read-all'
*/
markAllReadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markAllRead.url(options),
    method: 'post',
})

markAllRead.form = markAllReadForm

/**
* @see \App\Http\Controllers\NotificationController::markRead
* @see app/Http/Controllers/NotificationController.php:49
* @route '/notifications/{id}/read'
*/
export const markRead = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

markRead.definition = {
    methods: ["post"],
    url: '/notifications/{id}/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\NotificationController::markRead
* @see app/Http/Controllers/NotificationController.php:49
* @route '/notifications/{id}/read'
*/
markRead.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return markRead.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\NotificationController::markRead
* @see app/Http/Controllers/NotificationController.php:49
* @route '/notifications/{id}/read'
*/
markRead.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\NotificationController::markRead
* @see app/Http/Controllers/NotificationController.php:49
* @route '/notifications/{id}/read'
*/
const markReadForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markRead.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\NotificationController::markRead
* @see app/Http/Controllers/NotificationController.php:49
* @route '/notifications/{id}/read'
*/
markReadForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: markRead.url(args, options),
    method: 'post',
})

markRead.form = markReadForm

/**
* @see \App\Http\Controllers\NotificationController::destroy
* @see app/Http/Controllers/NotificationController.php:68
* @route '/notifications/{id}'
*/
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/notifications/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\NotificationController::destroy
* @see app/Http/Controllers/NotificationController.php:68
* @route '/notifications/{id}'
*/
destroy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return destroy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\NotificationController::destroy
* @see app/Http/Controllers/NotificationController.php:68
* @route '/notifications/{id}'
*/
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\NotificationController::destroy
* @see app/Http/Controllers/NotificationController.php:68
* @route '/notifications/{id}'
*/
const destroyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\NotificationController::destroy
* @see app/Http/Controllers/NotificationController.php:68
* @route '/notifications/{id}'
*/
destroyForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const NotificationController = { index, recent, unreadCount, markAllRead, markRead, destroy }

export default NotificationController