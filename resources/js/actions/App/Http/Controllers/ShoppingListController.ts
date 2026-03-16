import { applyUrlDefaults, queryParams, type RouteDefinition, type RouteFormDefinition, type RouteQueryOptions } from './../../../../wayfinder';
/**
 * @see \App\Http\Controllers\ShoppingListController::index
 * @see app/Http/Controllers/ShoppingListController.php:15
 * @route '/shopping'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});

index.definition = {
    methods: ['get', 'head'],
    url: '/shopping',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\ShoppingListController::index
 * @see app/Http/Controllers/ShoppingListController.php:15
 * @route '/shopping'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\ShoppingListController::index
 * @see app/Http/Controllers/ShoppingListController.php:15
 * @route '/shopping'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\ShoppingListController::index
 * @see app/Http/Controllers/ShoppingListController.php:15
 * @route '/shopping'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\ShoppingListController::index
 * @see app/Http/Controllers/ShoppingListController.php:15
 * @route '/shopping'
 */
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\ShoppingListController::index
 * @see app/Http/Controllers/ShoppingListController.php:15
 * @route '/shopping'
 */
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\ShoppingListController::index
 * @see app/Http/Controllers/ShoppingListController.php:15
 * @route '/shopping'
 */
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

index.form = indexForm;

/**
 * @see \App\Http\Controllers\ShoppingListController::store
 * @see app/Http/Controllers/ShoppingListController.php:44
 * @route '/shopping'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
});

store.definition = {
    methods: ['post'],
    url: '/shopping',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\ShoppingListController::store
 * @see app/Http/Controllers/ShoppingListController.php:44
 * @route '/shopping'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\ShoppingListController::store
 * @see app/Http/Controllers/ShoppingListController.php:44
 * @route '/shopping'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\ShoppingListController::store
 * @see app/Http/Controllers/ShoppingListController.php:44
 * @route '/shopping'
 */
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\ShoppingListController::store
 * @see app/Http/Controllers/ShoppingListController.php:44
 * @route '/shopping'
 */
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
});

store.form = storeForm;

/**
 * @see \App\Http\Controllers\ShoppingListController::show
 * @see app/Http/Controllers/ShoppingListController.php:35
 * @route '/shopping/{shoppingList}'
 */
export const show = (
    args: { shoppingList: number | { id: number } } | [shoppingList: number | { id: number }] | number | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
});

show.definition = {
    methods: ['get', 'head'],
    url: '/shopping/{shoppingList}',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\ShoppingListController::show
 * @see app/Http/Controllers/ShoppingListController.php:35
 * @route '/shopping/{shoppingList}'
 */
show.url = (
    args: { shoppingList: number | { id: number } } | [shoppingList: number | { id: number }] | number | { id: number },
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { shoppingList: args };
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { shoppingList: args.id };
    }

    if (Array.isArray(args)) {
        args = {
            shoppingList: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        shoppingList: typeof args.shoppingList === 'object' ? args.shoppingList.id : args.shoppingList,
    };

    return show.definition.url.replace('{shoppingList}', parsedArgs.shoppingList.toString()).replace(/\/+$/, '') + queryParams(options);
};

/**
 * @see \App\Http\Controllers\ShoppingListController::show
 * @see app/Http/Controllers/ShoppingListController.php:35
 * @route '/shopping/{shoppingList}'
 */
show.get = (
    args: { shoppingList: number | { id: number } } | [shoppingList: number | { id: number }] | number | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\ShoppingListController::show
 * @see app/Http/Controllers/ShoppingListController.php:35
 * @route '/shopping/{shoppingList}'
 */
show.head = (
    args: { shoppingList: number | { id: number } } | [shoppingList: number | { id: number }] | number | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\ShoppingListController::show
 * @see app/Http/Controllers/ShoppingListController.php:35
 * @route '/shopping/{shoppingList}'
 */
const showForm = (
    args: { shoppingList: number | { id: number } } | [shoppingList: number | { id: number }] | number | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\ShoppingListController::show
 * @see app/Http/Controllers/ShoppingListController.php:35
 * @route '/shopping/{shoppingList}'
 */
showForm.get = (
    args: { shoppingList: number | { id: number } } | [shoppingList: number | { id: number }] | number | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\ShoppingListController::show
 * @see app/Http/Controllers/ShoppingListController.php:35
 * @route '/shopping/{shoppingList}'
 */
showForm.head = (
    args: { shoppingList: number | { id: number } } | [shoppingList: number | { id: number }] | number | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

show.form = showForm;

/**
 * @see \App\Http\Controllers\ShoppingListController::destroy
 * @see app/Http/Controllers/ShoppingListController.php:56
 * @route '/shopping/{shoppingList}'
 */
export const destroy = (
    args: { shoppingList: number | { id: number } } | [shoppingList: number | { id: number }] | number | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
});

destroy.definition = {
    methods: ['delete'],
    url: '/shopping/{shoppingList}',
} satisfies RouteDefinition<['delete']>;

/**
 * @see \App\Http\Controllers\ShoppingListController::destroy
 * @see app/Http/Controllers/ShoppingListController.php:56
 * @route '/shopping/{shoppingList}'
 */
destroy.url = (
    args: { shoppingList: number | { id: number } } | [shoppingList: number | { id: number }] | number | { id: number },
    options?: RouteQueryOptions,
) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { shoppingList: args };
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { shoppingList: args.id };
    }

    if (Array.isArray(args)) {
        args = {
            shoppingList: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        shoppingList: typeof args.shoppingList === 'object' ? args.shoppingList.id : args.shoppingList,
    };

    return destroy.definition.url.replace('{shoppingList}', parsedArgs.shoppingList.toString()).replace(/\/+$/, '') + queryParams(options);
};

/**
 * @see \App\Http\Controllers\ShoppingListController::destroy
 * @see app/Http/Controllers/ShoppingListController.php:56
 * @route '/shopping/{shoppingList}'
 */
destroy.delete = (
    args: { shoppingList: number | { id: number } } | [shoppingList: number | { id: number }] | number | { id: number },
    options?: RouteQueryOptions,
): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
});

/**
 * @see \App\Http\Controllers\ShoppingListController::destroy
 * @see app/Http/Controllers/ShoppingListController.php:56
 * @route '/shopping/{shoppingList}'
 */
const destroyForm = (
    args: { shoppingList: number | { id: number } } | [shoppingList: number | { id: number }] | number | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\ShoppingListController::destroy
 * @see app/Http/Controllers/ShoppingListController.php:56
 * @route '/shopping/{shoppingList}'
 */
destroyForm.delete = (
    args: { shoppingList: number | { id: number } } | [shoppingList: number | { id: number }] | number | { id: number },
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

destroy.form = destroyForm;

const ShoppingListController = { index, store, show, destroy };

export default ShoppingListController;
