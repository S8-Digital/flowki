import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
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
* @see \App\Http\Controllers\ChoreController::index
* @see app/Http/Controllers/ChoreController.php:20
* @route '/chores'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChoreController::index
* @see app/Http/Controllers/ChoreController.php:20
* @route '/chores'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChoreController::index
* @see app/Http/Controllers/ChoreController.php:20
* @route '/chores'
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
* @see \App\Http\Controllers\ChoreController::store
* @see app/Http/Controllers/ChoreController.php:45
* @route '/chores'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChoreController::store
* @see app/Http/Controllers/ChoreController.php:45
* @route '/chores'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\ChoreController::update
* @see app/Http/Controllers/ChoreController.php:66
* @route '/chores/{chore}'
*/
export const update = (args: { chore: string | number | { id: string | number } } | [chore: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
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
update.url = (args: { chore: string | number | { id: string | number } } | [chore: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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
update.patch = (args: { chore: string | number | { id: string | number } } | [chore: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\ChoreController::update
* @see app/Http/Controllers/ChoreController.php:66
* @route '/chores/{chore}'
*/
const updateForm = (args: { chore: string | number | { id: string | number } } | [chore: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChoreController::update
* @see app/Http/Controllers/ChoreController.php:66
* @route '/chores/{chore}'
*/
updateForm.patch = (args: { chore: string | number | { id: string | number } } | [chore: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\ChoreController::destroy
* @see app/Http/Controllers/ChoreController.php:82
* @route '/chores/{chore}'
*/
export const destroy = (args: { chore: string | number | { id: string | number } } | [chore: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
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
destroy.url = (args: { chore: string | number | { id: string | number } } | [chore: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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
destroy.delete = (args: { chore: string | number | { id: string | number } } | [chore: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ChoreController::destroy
* @see app/Http/Controllers/ChoreController.php:82
* @route '/chores/{chore}'
*/
const destroyForm = (args: { chore: string | number | { id: string | number } } | [chore: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChoreController::destroy
* @see app/Http/Controllers/ChoreController.php:82
* @route '/chores/{chore}'
*/
destroyForm.delete = (args: { chore: string | number | { id: string | number } } | [chore: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\ChoreController::complete
* @see app/Http/Controllers/ChoreController.php:91
* @route '/chores/{chore}/complete'
*/
export const complete = (args: { chore: string | number | { id: string | number } } | [chore: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
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
complete.url = (args: { chore: string | number | { id: string | number } } | [chore: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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
complete.post = (args: { chore: string | number | { id: string | number } } | [chore: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: complete.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChoreController::complete
* @see app/Http/Controllers/ChoreController.php:91
* @route '/chores/{chore}/complete'
*/
const completeForm = (args: { chore: string | number | { id: string | number } } | [chore: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: complete.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChoreController::complete
* @see app/Http/Controllers/ChoreController.php:91
* @route '/chores/{chore}/complete'
*/
completeForm.post = (args: { chore: string | number | { id: string | number } } | [chore: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: complete.url(args, options),
    method: 'post',
})

complete.form = completeForm

const ChoreController = { index, store, update, destroy, complete }

export default ChoreController