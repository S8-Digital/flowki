import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CalendarEventController::index
* @see app/Http/Controllers/CalendarEventController.php:22
* @route '/calendar'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/calendar',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CalendarEventController::index
* @see app/Http/Controllers/CalendarEventController.php:22
* @route '/calendar'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CalendarEventController::index
* @see app/Http/Controllers/CalendarEventController.php:22
* @route '/calendar'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CalendarEventController::index
* @see app/Http/Controllers/CalendarEventController.php:22
* @route '/calendar'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CalendarEventController::store
* @see app/Http/Controllers/CalendarEventController.php:61
* @route '/calendar'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/calendar',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CalendarEventController::store
* @see app/Http/Controllers/CalendarEventController.php:61
* @route '/calendar'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CalendarEventController::store
* @see app/Http/Controllers/CalendarEventController.php:61
* @route '/calendar'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CalendarEventController::update
* @see app/Http/Controllers/CalendarEventController.php:80
* @route '/calendar/{calendarEvent}'
*/
export const update = (args: { calendarEvent: number | { id: number } } | [calendarEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/calendar/{calendarEvent}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\CalendarEventController::update
* @see app/Http/Controllers/CalendarEventController.php:80
* @route '/calendar/{calendarEvent}'
*/
update.url = (args: { calendarEvent: number | { id: number } } | [calendarEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { calendarEvent: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { calendarEvent: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            calendarEvent: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        calendarEvent: typeof args.calendarEvent === 'object'
        ? args.calendarEvent.id
        : args.calendarEvent,
    }

    return update.definition.url
            .replace('{calendarEvent}', parsedArgs.calendarEvent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CalendarEventController::update
* @see app/Http/Controllers/CalendarEventController.php:80
* @route '/calendar/{calendarEvent}'
*/
update.patch = (args: { calendarEvent: number | { id: number } } | [calendarEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\CalendarEventController::move
* @see app/Http/Controllers/CalendarEventController.php:93
* @route '/calendar/{calendarEvent}/move'
*/
export const move = (args: { calendarEvent: number | { id: number } } | [calendarEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: move.url(args, options),
    method: 'patch',
})

move.definition = {
    methods: ["patch"],
    url: '/calendar/{calendarEvent}/move',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\CalendarEventController::move
* @see app/Http/Controllers/CalendarEventController.php:93
* @route '/calendar/{calendarEvent}/move'
*/
move.url = (args: { calendarEvent: number | { id: number } } | [calendarEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { calendarEvent: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { calendarEvent: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            calendarEvent: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        calendarEvent: typeof args.calendarEvent === 'object'
        ? args.calendarEvent.id
        : args.calendarEvent,
    }

    return move.definition.url
            .replace('{calendarEvent}', parsedArgs.calendarEvent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CalendarEventController::move
* @see app/Http/Controllers/CalendarEventController.php:93
* @route '/calendar/{calendarEvent}/move'
*/
move.patch = (args: { calendarEvent: number | { id: number } } | [calendarEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: move.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\CalendarEventController::destroy
* @see app/Http/Controllers/CalendarEventController.php:102
* @route '/calendar/{calendarEvent}'
*/
export const destroy = (args: { calendarEvent: number | { id: number } } | [calendarEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/calendar/{calendarEvent}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\CalendarEventController::destroy
* @see app/Http/Controllers/CalendarEventController.php:102
* @route '/calendar/{calendarEvent}'
*/
destroy.url = (args: { calendarEvent: number | { id: number } } | [calendarEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { calendarEvent: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { calendarEvent: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            calendarEvent: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        calendarEvent: typeof args.calendarEvent === 'object'
        ? args.calendarEvent.id
        : args.calendarEvent,
    }

    return destroy.definition.url
            .replace('{calendarEvent}', parsedArgs.calendarEvent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CalendarEventController::destroy
* @see app/Http/Controllers/CalendarEventController.php:102
* @route '/calendar/{calendarEvent}'
*/
destroy.delete = (args: { calendarEvent: number | { id: number } } | [calendarEvent: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const CalendarEventController = { index, store, update, move, destroy }

export default CalendarEventController