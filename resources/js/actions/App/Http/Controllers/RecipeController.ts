import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\RecipeController::index
* @see app/Http/Controllers/RecipeController.php:16
* @route '/recipes'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/recipes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RecipeController::index
* @see app/Http/Controllers/RecipeController.php:16
* @route '/recipes'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipeController::index
* @see app/Http/Controllers/RecipeController.php:16
* @route '/recipes'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RecipeController::index
* @see app/Http/Controllers/RecipeController.php:16
* @route '/recipes'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RecipeController::index
* @see app/Http/Controllers/RecipeController.php:16
* @route '/recipes'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RecipeController::index
* @see app/Http/Controllers/RecipeController.php:16
* @route '/recipes'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RecipeController::index
* @see app/Http/Controllers/RecipeController.php:16
* @route '/recipes'
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
* @see \App\Http\Controllers\RecipeController::store
* @see app/Http/Controllers/RecipeController.php:49
* @route '/recipes'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/recipes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RecipeController::store
* @see app/Http/Controllers/RecipeController.php:49
* @route '/recipes'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipeController::store
* @see app/Http/Controllers/RecipeController.php:49
* @route '/recipes'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RecipeController::store
* @see app/Http/Controllers/RecipeController.php:49
* @route '/recipes'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RecipeController::store
* @see app/Http/Controllers/RecipeController.php:49
* @route '/recipes'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\RecipeController::show
* @see app/Http/Controllers/RecipeController.php:40
* @route '/recipes/{recipe}'
*/
export const show = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/recipes/{recipe}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RecipeController::show
* @see app/Http/Controllers/RecipeController.php:40
* @route '/recipes/{recipe}'
*/
show.url = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { recipe: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { recipe: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            recipe: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        recipe: typeof args.recipe === 'object'
        ? args.recipe.id
        : args.recipe,
    }

    return show.definition.url
            .replace('{recipe}', parsedArgs.recipe.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipeController::show
* @see app/Http/Controllers/RecipeController.php:40
* @route '/recipes/{recipe}'
*/
show.get = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RecipeController::show
* @see app/Http/Controllers/RecipeController.php:40
* @route '/recipes/{recipe}'
*/
show.head = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RecipeController::show
* @see app/Http/Controllers/RecipeController.php:40
* @route '/recipes/{recipe}'
*/
const showForm = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RecipeController::show
* @see app/Http/Controllers/RecipeController.php:40
* @route '/recipes/{recipe}'
*/
showForm.get = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RecipeController::show
* @see app/Http/Controllers/RecipeController.php:40
* @route '/recipes/{recipe}'
*/
showForm.head = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\RecipeController::update
* @see app/Http/Controllers/RecipeController.php:75
* @route '/recipes/{recipe}'
*/
export const update = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/recipes/{recipe}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\RecipeController::update
* @see app/Http/Controllers/RecipeController.php:75
* @route '/recipes/{recipe}'
*/
update.url = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { recipe: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { recipe: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            recipe: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        recipe: typeof args.recipe === 'object'
        ? args.recipe.id
        : args.recipe,
    }

    return update.definition.url
            .replace('{recipe}', parsedArgs.recipe.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipeController::update
* @see app/Http/Controllers/RecipeController.php:75
* @route '/recipes/{recipe}'
*/
update.patch = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\RecipeController::update
* @see app/Http/Controllers/RecipeController.php:75
* @route '/recipes/{recipe}'
*/
const updateForm = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RecipeController::update
* @see app/Http/Controllers/RecipeController.php:75
* @route '/recipes/{recipe}'
*/
updateForm.patch = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\RecipeController::destroy
* @see app/Http/Controllers/RecipeController.php:99
* @route '/recipes/{recipe}'
*/
export const destroy = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/recipes/{recipe}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\RecipeController::destroy
* @see app/Http/Controllers/RecipeController.php:99
* @route '/recipes/{recipe}'
*/
destroy.url = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { recipe: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { recipe: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            recipe: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        recipe: typeof args.recipe === 'object'
        ? args.recipe.id
        : args.recipe,
    }

    return destroy.definition.url
            .replace('{recipe}', parsedArgs.recipe.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipeController::destroy
* @see app/Http/Controllers/RecipeController.php:99
* @route '/recipes/{recipe}'
*/
destroy.delete = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\RecipeController::destroy
* @see app/Http/Controllers/RecipeController.php:99
* @route '/recipes/{recipe}'
*/
const destroyForm = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RecipeController::destroy
* @see app/Http/Controllers/RecipeController.php:99
* @route '/recipes/{recipe}'
*/
destroyForm.delete = (args: { recipe: string | number | { id: string | number } } | [recipe: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const RecipeController = { index, store, show, update, destroy }

export default RecipeController