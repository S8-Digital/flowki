import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TodoController::index
* @see app/Http/Controllers/TodoController.php:19
* @route '/todos'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/todos',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TodoController::index
* @see app/Http/Controllers/TodoController.php:19
* @route '/todos'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TodoController::index
* @see app/Http/Controllers/TodoController.php:19
* @route '/todos'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TodoController::index
* @see app/Http/Controllers/TodoController.php:19
* @route '/todos'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TodoController::index
* @see app/Http/Controllers/TodoController.php:19
* @route '/todos'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TodoController::index
* @see app/Http/Controllers/TodoController.php:19
* @route '/todos'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TodoController::index
* @see app/Http/Controllers/TodoController.php:19
* @route '/todos'
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
* @see \App\Http\Controllers\TodoController::store
* @see app/Http/Controllers/TodoController.php:48
* @route '/todos'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/todos',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TodoController::store
* @see app/Http/Controllers/TodoController.php:48
* @route '/todos'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TodoController::store
* @see app/Http/Controllers/TodoController.php:48
* @route '/todos'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TodoController::store
* @see app/Http/Controllers/TodoController.php:48
* @route '/todos'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TodoController::store
* @see app/Http/Controllers/TodoController.php:48
* @route '/todos'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\TodoController::update
* @see app/Http/Controllers/TodoController.php:62
* @route '/todos/{todo}'
*/
export const update = (args: { todo: string | number | { id: string | number } } | [todo: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/todos/{todo}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\TodoController::update
* @see app/Http/Controllers/TodoController.php:62
* @route '/todos/{todo}'
*/
update.url = (args: { todo: string | number | { id: string | number } } | [todo: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { todo: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { todo: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            todo: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        todo: typeof args.todo === 'object'
        ? args.todo.id
        : args.todo,
    }

    return update.definition.url
            .replace('{todo}', parsedArgs.todo.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TodoController::update
* @see app/Http/Controllers/TodoController.php:62
* @route '/todos/{todo}'
*/
update.patch = (args: { todo: string | number | { id: string | number } } | [todo: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\TodoController::update
* @see app/Http/Controllers/TodoController.php:62
* @route '/todos/{todo}'
*/
const updateForm = (args: { todo: string | number | { id: string | number } } | [todo: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TodoController::update
* @see app/Http/Controllers/TodoController.php:62
* @route '/todos/{todo}'
*/
updateForm.patch = (args: { todo: string | number | { id: string | number } } | [todo: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\TodoController::destroy
* @see app/Http/Controllers/TodoController.php:74
* @route '/todos/{todo}'
*/
export const destroy = (args: { todo: string | number | { id: string | number } } | [todo: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/todos/{todo}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TodoController::destroy
* @see app/Http/Controllers/TodoController.php:74
* @route '/todos/{todo}'
*/
destroy.url = (args: { todo: string | number | { id: string | number } } | [todo: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { todo: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { todo: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            todo: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        todo: typeof args.todo === 'object'
        ? args.todo.id
        : args.todo,
    }

    return destroy.definition.url
            .replace('{todo}', parsedArgs.todo.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TodoController::destroy
* @see app/Http/Controllers/TodoController.php:74
* @route '/todos/{todo}'
*/
destroy.delete = (args: { todo: string | number | { id: string | number } } | [todo: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\TodoController::destroy
* @see app/Http/Controllers/TodoController.php:74
* @route '/todos/{todo}'
*/
const destroyForm = (args: { todo: string | number | { id: string | number } } | [todo: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TodoController::destroy
* @see app/Http/Controllers/TodoController.php:74
* @route '/todos/{todo}'
*/
destroyForm.delete = (args: { todo: string | number | { id: string | number } } | [todo: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const TodoController = { index, store, update, destroy }

export default TodoController