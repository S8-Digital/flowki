import { queryParams, type RouteDefinition, type RouteFormDefinition, type RouteQueryOptions } from './../../../wayfinder';
/**
 * @see \App\Http\Controllers\FamilyController::store
 * @see app/Http/Controllers/FamilyController.php:50
 * @route '/family/join'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
});

store.definition = {
    methods: ['post'],
    url: '/family/join',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\FamilyController::store
 * @see app/Http/Controllers/FamilyController.php:50
 * @route '/family/join'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\FamilyController::store
 * @see app/Http/Controllers/FamilyController.php:50
 * @route '/family/join'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\FamilyController::store
 * @see app/Http/Controllers/FamilyController.php:50
 * @route '/family/join'
 */
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\FamilyController::store
 * @see app/Http/Controllers/FamilyController.php:50
 * @route '/family/join'
 */
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
});

store.form = storeForm;

const join = {
    store: Object.assign(store, store),
};

export default join;
