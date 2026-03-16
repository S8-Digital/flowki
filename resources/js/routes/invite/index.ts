import { applyUrlDefaults, queryParams, type RouteDefinition, type RouteFormDefinition, type RouteQueryOptions } from './../../wayfinder';
/**
 * @see \App\Http\Controllers\AcceptInviteController::show
 * @see app/Http/Controllers/AcceptInviteController.php:15
 * @route '/invite/{token}'
 */
export const show = (
    args: { token: string | number } | [token: string | number] | string | number,
    options?: RouteQueryOptions,
): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
});

show.definition = {
    methods: ['get', 'head'],
    url: '/invite/{token}',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\AcceptInviteController::show
 * @see app/Http/Controllers/AcceptInviteController.php:15
 * @route '/invite/{token}'
 */
show.url = (args: { token: string | number } | [token: string | number] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args };
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        token: args.token,
    };

    return show.definition.url.replace('{token}', parsedArgs.token.toString()).replace(/\/+$/, '') + queryParams(options);
};

/**
 * @see \App\Http\Controllers\AcceptInviteController::show
 * @see app/Http/Controllers/AcceptInviteController.php:15
 * @route '/invite/{token}'
 */
show.get = (args: { token: string | number } | [token: string | number] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\AcceptInviteController::show
 * @see app/Http/Controllers/AcceptInviteController.php:15
 * @route '/invite/{token}'
 */
show.head = (
    args: { token: string | number } | [token: string | number] | string | number,
    options?: RouteQueryOptions,
): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\AcceptInviteController::show
 * @see app/Http/Controllers/AcceptInviteController.php:15
 * @route '/invite/{token}'
 */
const showForm = (
    args: { token: string | number } | [token: string | number] | string | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\AcceptInviteController::show
 * @see app/Http/Controllers/AcceptInviteController.php:15
 * @route '/invite/{token}'
 */
showForm.get = (
    args: { token: string | number } | [token: string | number] | string | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\AcceptInviteController::show
 * @see app/Http/Controllers/AcceptInviteController.php:15
 * @route '/invite/{token}'
 */
showForm.head = (
    args: { token: string | number } | [token: string | number] | string | number,
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
 * @see \App\Http\Controllers\AcceptInviteController::store
 * @see app/Http/Controllers/AcceptInviteController.php:34
 * @route '/invite/{token}'
 */
export const store = (
    args: { token: string | number } | [token: string | number] | string | number,
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
});

store.definition = {
    methods: ['post'],
    url: '/invite/{token}',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\AcceptInviteController::store
 * @see app/Http/Controllers/AcceptInviteController.php:34
 * @route '/invite/{token}'
 */
store.url = (args: { token: string | number } | [token: string | number] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args };
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        token: args.token,
    };

    return store.definition.url.replace('{token}', parsedArgs.token.toString()).replace(/\/+$/, '') + queryParams(options);
};

/**
 * @see \App\Http\Controllers\AcceptInviteController::store
 * @see app/Http/Controllers/AcceptInviteController.php:34
 * @route '/invite/{token}'
 */
store.post = (
    args: { token: string | number } | [token: string | number] | string | number,
    options?: RouteQueryOptions,
): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\AcceptInviteController::store
 * @see app/Http/Controllers/AcceptInviteController.php:34
 * @route '/invite/{token}'
 */
const storeForm = (
    args: { token: string | number } | [token: string | number] | string | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\AcceptInviteController::store
 * @see app/Http/Controllers/AcceptInviteController.php:34
 * @route '/invite/{token}'
 */
storeForm.post = (
    args: { token: string | number } | [token: string | number] | string | number,
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
});

store.form = storeForm;

const invite = {
    show: Object.assign(show, show),
    store: Object.assign(store, store),
};

export default invite;
