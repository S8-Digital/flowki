import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ChoreController::index
* @see app/Http/Controllers/ChoreController.php:20
* @route '/chores'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/chores',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChoreController::index
* @see app/Http/Controllers/ChoreController.php:20
* @route '/chores'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChoreController::index
* @see app/Http/Controllers/ChoreController.php:20
* @route '/chores'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChoreController::index
* @see app/Http/Controllers/ChoreController.php:20
* @route '/chores'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChoreController::store
* @see app/Http/Controllers/ChoreController.php:45
* @route '/chores'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/chores',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChoreController::store
* @see app/Http/Controllers/ChoreController.php:45
* @route '/chores'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChoreController::store
* @see app/Http/Controllers/ChoreController.php:45
* @route '/chores'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChoreController::update
* @see app/Http/Controllers/ChoreController.php:66
* @route '/chores/{chore}'
*/
export const update = (args: { chore: number | { id: number } } | [chore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/chores/{chore}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ChoreController::update
* @see app/Http/Controllers/ChoreController.php:66
* @route '/chores/{chore}'
*/
update.url = (args: { chore: number | { id: number } } | [chore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { chore: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { chore: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            chore: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        chore: typeof args.chore === 'object'
        ? args.chore.id
        : args.chore,
    }

    return update.definition.url
            .replace('{chore}', parsedArgs.chore.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChoreController::update
* @see app/Http/Controllers/ChoreController.php:66
* @route '/chores/{chore}'
*/
update.patch = (args: { chore: number | { id: number } } | [chore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\ChoreController::destroy
* @see app/Http/Controllers/ChoreController.php:82
* @route '/chores/{chore}'
*/
export const destroy = (args: { chore: number | { id: number } } | [chore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/chores/{chore}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ChoreController::destroy
* @see app/Http/Controllers/ChoreController.php:82
* @route '/chores/{chore}'
*/
destroy.url = (args: { chore: number | { id: number } } | [chore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { chore: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { chore: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            chore: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        chore: typeof args.chore === 'object'
        ? args.chore.id
        : args.chore,
    }

    return destroy.definition.url
            .replace('{chore}', parsedArgs.chore.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChoreController::destroy
* @see app/Http/Controllers/ChoreController.php:82
* @route '/chores/{chore}'
*/
destroy.delete = (args: { chore: number | { id: number } } | [chore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ChoreController::complete
* @see app/Http/Controllers/ChoreController.php:91
* @route '/chores/{chore}/complete'
*/
export const complete = (args: { chore: number | { id: number } } | [chore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: complete.url(args, options),
    method: 'post',
})

complete.definition = {
    methods: ["post"],
    url: '/chores/{chore}/complete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChoreController::complete
* @see app/Http/Controllers/ChoreController.php:91
* @route '/chores/{chore}/complete'
*/
complete.url = (args: { chore: number | { id: number } } | [chore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { chore: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { chore: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            chore: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        chore: typeof args.chore === 'object'
        ? args.chore.id
        : args.chore,
    }

    return complete.definition.url
            .replace('{chore}', parsedArgs.chore.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChoreController::complete
* @see app/Http/Controllers/ChoreController.php:91
* @route '/chores/{chore}/complete'
*/
complete.post = (args: { chore: number | { id: number } } | [chore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: complete.url(args, options),
    method: 'post',
})

const ChoreController = { index, store, update, destroy, complete }

export default ChoreController