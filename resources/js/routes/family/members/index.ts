import { applyUrlDefaults, queryParams, type RouteDefinition, type RouteFormDefinition, type RouteQueryOptions } from './../../../wayfinder';
/**
 * @see \App\Http\Controllers\FamilyController::invite
 * @see app/Http/Controllers/FamilyController.php:100
 * @route '/family/members'
 */
export const invite = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: invite.url(options),
    method: 'post',
});

invite.definition = {
    methods: ['post'],
    url: '/family/members',
} satisfies RouteDefinition<['post']>;

/**
 * @see \App\Http\Controllers\FamilyController::invite
 * @see app/Http/Controllers/FamilyController.php:100
 * @route '/family/members'
 */
invite.url = (options?: RouteQueryOptions) => {
    return invite.definition.url + queryParams(options);
};

/**
 * @see \App\Http\Controllers\FamilyController::invite
 * @see app/Http/Controllers/FamilyController.php:100
 * @route '/family/members'
 */
invite.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: invite.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\FamilyController::invite
 * @see app/Http/Controllers/FamilyController.php:100
 * @route '/family/members'
 */
const inviteForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: invite.url(options),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\FamilyController::invite
 * @see app/Http/Controllers/FamilyController.php:100
 * @route '/family/members'
 */
inviteForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: invite.url(options),
    method: 'post',
});

invite.form = inviteForm;

/**
 * @see \App\Http\Controllers\FamilyController::role
 * @see app/Http/Controllers/FamilyController.php:161
 * @route '/family/{family}/members/{userId}/role'
 */
export const role = (
    args: { family: number | { id: number }; userId: string | number } | [family: number | { id: number }, userId: string | number],
    options?: RouteQueryOptions,
): RouteDefinition<'patch'> => ({
    url: role.url(args, options),
    method: 'patch',
});

role.definition = {
    methods: ['patch'],
    url: '/family/{family}/members/{userId}/role',
} satisfies RouteDefinition<['patch']>;

/**
 * @see \App\Http\Controllers\FamilyController::role
 * @see app/Http/Controllers/FamilyController.php:161
 * @route '/family/{family}/members/{userId}/role'
 */
role.url = (
    args: { family: number | { id: number }; userId: string | number } | [family: number | { id: number }, userId: string | number],
    options?: RouteQueryOptions,
) => {
    if (Array.isArray(args)) {
        args = {
            family: args[0],
            userId: args[1],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        family: typeof args.family === 'object' ? args.family.id : args.family,
        userId: args.userId,
    };

    return (
        role.definition.url.replace('{family}', parsedArgs.family.toString()).replace('{userId}', parsedArgs.userId.toString()).replace(/\/+$/, '') +
        queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\FamilyController::role
 * @see app/Http/Controllers/FamilyController.php:161
 * @route '/family/{family}/members/{userId}/role'
 */
role.patch = (
    args: { family: number | { id: number }; userId: string | number } | [family: number | { id: number }, userId: string | number],
    options?: RouteQueryOptions,
): RouteDefinition<'patch'> => ({
    url: role.url(args, options),
    method: 'patch',
});

/**
 * @see \App\Http\Controllers\FamilyController::role
 * @see app/Http/Controllers/FamilyController.php:161
 * @route '/family/{family}/members/{userId}/role'
 */
const roleForm = (
    args: { family: number | { id: number }; userId: string | number } | [family: number | { id: number }, userId: string | number],
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: role.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\FamilyController::role
 * @see app/Http/Controllers/FamilyController.php:161
 * @route '/family/{family}/members/{userId}/role'
 */
roleForm.patch = (
    args: { family: number | { id: number }; userId: string | number } | [family: number | { id: number }, userId: string | number],
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: role.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

role.form = roleForm;

/**
 * @see \App\Http\Controllers\FamilyController::remove
 * @see app/Http/Controllers/FamilyController.php:177
 * @route '/family/{family}/members/{userId}'
 */
export const remove = (
    args: { family: number | { id: number }; userId: string | number } | [family: number | { id: number }, userId: string | number],
    options?: RouteQueryOptions,
): RouteDefinition<'delete'> => ({
    url: remove.url(args, options),
    method: 'delete',
});

remove.definition = {
    methods: ['delete'],
    url: '/family/{family}/members/{userId}',
} satisfies RouteDefinition<['delete']>;

/**
 * @see \App\Http\Controllers\FamilyController::remove
 * @see app/Http/Controllers/FamilyController.php:177
 * @route '/family/{family}/members/{userId}'
 */
remove.url = (
    args: { family: number | { id: number }; userId: string | number } | [family: number | { id: number }, userId: string | number],
    options?: RouteQueryOptions,
) => {
    if (Array.isArray(args)) {
        args = {
            family: args[0],
            userId: args[1],
        };
    }

    args = applyUrlDefaults(args);

    const parsedArgs = {
        family: typeof args.family === 'object' ? args.family.id : args.family,
        userId: args.userId,
    };

    return (
        remove.definition.url
            .replace('{family}', parsedArgs.family.toString())
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
    );
};

/**
 * @see \App\Http\Controllers\FamilyController::remove
 * @see app/Http/Controllers/FamilyController.php:177
 * @route '/family/{family}/members/{userId}'
 */
remove.delete = (
    args: { family: number | { id: number }; userId: string | number } | [family: number | { id: number }, userId: string | number],
    options?: RouteQueryOptions,
): RouteDefinition<'delete'> => ({
    url: remove.url(args, options),
    method: 'delete',
});

/**
 * @see \App\Http\Controllers\FamilyController::remove
 * @see app/Http/Controllers/FamilyController.php:177
 * @route '/family/{family}/members/{userId}'
 */
const removeForm = (
    args: { family: number | { id: number }; userId: string | number } | [family: number | { id: number }, userId: string | number],
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: remove.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

/**
 * @see \App\Http\Controllers\FamilyController::remove
 * @see app/Http/Controllers/FamilyController.php:177
 * @route '/family/{family}/members/{userId}'
 */
removeForm.delete = (
    args: { family: number | { id: number }; userId: string | number } | [family: number | { id: number }, userId: string | number],
    options?: RouteQueryOptions,
): RouteFormDefinition<'post'> => ({
    action: remove.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        },
    }),
    method: 'post',
});

remove.form = removeForm;

const members = {
    invite: Object.assign(invite, invite),
    role: Object.assign(role, role),
    remove: Object.assign(remove, remove),
};

export default members;
