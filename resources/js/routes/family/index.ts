import { queryParams, type RouteDefinition, type RouteFormDefinition, type RouteQueryOptions } from './../../wayfinder';
import children from './children';
import join0c68bd from './join';
import members from './members';
/**
 * @see \App\Http\Controllers\FamilyController::create
 * @see app/Http/Controllers/FamilyController.php:26
 * @route '/family/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
});

create.definition = {
    methods: ['get', 'head'],
    url: '/family/create',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\FamilyController::create
 * @see app/Http/Controllers/FamilyController.php:26
 * @route '/family/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\FamilyController::create
 * @see app/Http/Controllers/FamilyController.php:26
 * @route '/family/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\FamilyController::create
 * @see app/Http/Controllers/FamilyController.php:26
 * @route '/family/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\FamilyController::create
 * @see app/Http/Controllers/FamilyController.php:26
 * @route '/family/create'
 */
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\FamilyController::create
 * @see app/Http/Controllers/FamilyController.php:26
 * @route '/family/create'
 */
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\FamilyController::create
 * @see app/Http/Controllers/FamilyController.php:26
 * @route '/family/create'
 */
createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

create.form = createForm;

/**
 * @see \App\Http\Controllers\FamilyController::store
 * @see app/Http/Controllers/FamilyController.php:31
 * @route '/family'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
});

store.definition = {
    methods: ['post'],
    url: '/family',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\FamilyController::store
 * @see app/Http/Controllers/FamilyController.php:31
 * @route '/family'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\FamilyController::store
 * @see app/Http/Controllers/FamilyController.php:31
 * @route '/family'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\FamilyController::store
 * @see app/Http/Controllers/FamilyController.php:31
 * @route '/family'
 */
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\FamilyController::store
 * @see app/Http/Controllers/FamilyController.php:31
 * @route '/family'
 */
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
});

store.form = storeForm;

/**
 * @see \App\Http\Controllers\FamilyController::join
 * @see app/Http/Controllers/FamilyController.php:45
 * @route '/family/join'
 */
export const join = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: join.url(options),
    method: 'get',
});

join.definition = {
    methods: ['get', 'head'],
    url: '/family/join',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\FamilyController::join
 * @see app/Http/Controllers/FamilyController.php:45
 * @route '/family/join'
 */
join.url = (options?: RouteQueryOptions) => {
    return join.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\FamilyController::join
 * @see app/Http/Controllers/FamilyController.php:45
 * @route '/family/join'
 */
join.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: join.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\FamilyController::join
 * @see app/Http/Controllers/FamilyController.php:45
 * @route '/family/join'
 */
join.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: join.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\FamilyController::join
 * @see app/Http/Controllers/FamilyController.php:45
 * @route '/family/join'
 */
const joinForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: join.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\FamilyController::join
 * @see app/Http/Controllers/FamilyController.php:45
 * @route '/family/join'
 */
joinForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: join.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\FamilyController::join
 * @see app/Http/Controllers/FamilyController.php:45
 * @route '/family/join'
 */
joinForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: join.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

join.form = joinForm;

/**
 * @see \App\Http\Controllers\FamilyController::show
 * @see app/Http/Controllers/FamilyController.php:67
 * @route '/family'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
});

show.definition = {
    methods: ['get', 'head'],
    url: '/family',
} satisfies RouteDefinition<['get', 'head']>;

/**
 * @see \App\Http\Controllers\FamilyController::show
 * @see app/Http/Controllers/FamilyController.php:67
 * @route '/family'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\FamilyController::show
 * @see app/Http/Controllers/FamilyController.php:67
 * @route '/family'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\FamilyController::show
 * @see app/Http/Controllers/FamilyController.php:67
 * @route '/family'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
});

/**
 * @see \App\Http\Controllers\FamilyController::show
 * @see app/Http/Controllers/FamilyController.php:67
 * @route '/family'
 */
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\FamilyController::show
 * @see app/Http/Controllers/FamilyController.php:67
 * @route '/family'
 */
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
});

/**
 * @see \App\Http\Controllers\FamilyController::show
 * @see app/Http/Controllers/FamilyController.php:67
 * @route '/family'
 */
showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'get',
});

show.form = showForm;

/**
 * @see \App\Http\Controllers\FamilyController::update
 * @see app/Http/Controllers/FamilyController.php:89
 * @route '/family'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
});

update.definition = {
    methods: ['patch'],
    url: '/family',
} satisfies RouteDefinition<['patch']>;

/**
 * @see \App\Http\Controllers\FamilyController::update
 * @see app/Http/Controllers/FamilyController.php:89
 * @route '/family'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\FamilyController::update
 * @see app/Http/Controllers/FamilyController.php:89
 * @route '/family'
 */
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
});

/**
 * @see \App\Http\Controllers\FamilyController::update
 * @see app/Http/Controllers/FamilyController.php:89
 * @route '/family'
 */
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\FamilyController::update
 * @see app/Http/Controllers/FamilyController.php:89
 * @route '/family'
 */
updateForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

update.form = updateForm;

const family = {
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    join: Object.assign(join, join0c68bd),
    show: Object.assign(show, show),
    update: Object.assign(update, update),
    members: Object.assign(members, members),
    children: Object.assign(children, children),
};

export default family;
