import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\FamilyController::create
* @see app/Http/Controllers/FamilyController.php:26
* @route '/family/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/family/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FamilyController::create
* @see app/Http/Controllers/FamilyController.php:26
* @route '/family/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FamilyController::create
* @see app/Http/Controllers/FamilyController.php:26
* @route '/family/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FamilyController::create
* @see app/Http/Controllers/FamilyController.php:26
* @route '/family/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\FamilyController::store
* @see app/Http/Controllers/FamilyController.php:31
* @route '/family'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/family',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FamilyController::store
* @see app/Http/Controllers/FamilyController.php:31
* @route '/family'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FamilyController::store
* @see app/Http/Controllers/FamilyController.php:31
* @route '/family'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FamilyController::join
* @see app/Http/Controllers/FamilyController.php:45
* @route '/family/join'
*/
export const join = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: join.url(options),
    method: 'get',
})

join.definition = {
    methods: ["get","head"],
    url: '/family/join',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FamilyController::join
* @see app/Http/Controllers/FamilyController.php:45
* @route '/family/join'
*/
join.url = (options?: RouteQueryOptions) => {
    return join.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FamilyController::join
* @see app/Http/Controllers/FamilyController.php:45
* @route '/family/join'
*/
join.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: join.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FamilyController::join
* @see app/Http/Controllers/FamilyController.php:45
* @route '/family/join'
*/
join.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: join.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\FamilyController::joinStore
* @see app/Http/Controllers/FamilyController.php:50
* @route '/family/join'
*/
export const joinStore = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: joinStore.url(options),
    method: 'post',
})

joinStore.definition = {
    methods: ["post"],
    url: '/family/join',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FamilyController::joinStore
* @see app/Http/Controllers/FamilyController.php:50
* @route '/family/join'
*/
joinStore.url = (options?: RouteQueryOptions) => {
    return joinStore.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FamilyController::joinStore
* @see app/Http/Controllers/FamilyController.php:50
* @route '/family/join'
*/
joinStore.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: joinStore.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FamilyController::show
* @see app/Http/Controllers/FamilyController.php:67
* @route '/family'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/family',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FamilyController::show
* @see app/Http/Controllers/FamilyController.php:67
* @route '/family'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FamilyController::show
* @see app/Http/Controllers/FamilyController.php:67
* @route '/family'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FamilyController::show
* @see app/Http/Controllers/FamilyController.php:67
* @route '/family'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\FamilyController::update
* @see app/Http/Controllers/FamilyController.php:89
* @route '/family'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/family',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\FamilyController::update
* @see app/Http/Controllers/FamilyController.php:89
* @route '/family'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FamilyController::update
* @see app/Http/Controllers/FamilyController.php:89
* @route '/family'
*/
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\FamilyController::inviteMember
* @see app/Http/Controllers/FamilyController.php:100
* @route '/family/members'
*/
export const inviteMember = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: inviteMember.url(options),
    method: 'post',
})

inviteMember.definition = {
    methods: ["post"],
    url: '/family/members',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FamilyController::inviteMember
* @see app/Http/Controllers/FamilyController.php:100
* @route '/family/members'
*/
inviteMember.url = (options?: RouteQueryOptions) => {
    return inviteMember.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FamilyController::inviteMember
* @see app/Http/Controllers/FamilyController.php:100
* @route '/family/members'
*/
inviteMember.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: inviteMember.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FamilyController::addChild
* @see app/Http/Controllers/FamilyController.php:143
* @route '/family/children'
*/
export const addChild = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addChild.url(options),
    method: 'post',
})

addChild.definition = {
    methods: ["post"],
    url: '/family/children',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FamilyController::addChild
* @see app/Http/Controllers/FamilyController.php:143
* @route '/family/children'
*/
addChild.url = (options?: RouteQueryOptions) => {
    return addChild.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FamilyController::addChild
* @see app/Http/Controllers/FamilyController.php:143
* @route '/family/children'
*/
addChild.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addChild.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FamilyController::updateMemberRole
* @see app/Http/Controllers/FamilyController.php:161
* @route '/family/{family}/members/{userId}/role'
*/
export const updateMemberRole = (args: { family: number | { id: number }, userId: string | number } | [family: number | { id: number }, userId: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateMemberRole.url(args, options),
    method: 'patch',
})

updateMemberRole.definition = {
    methods: ["patch"],
    url: '/family/{family}/members/{userId}/role',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\FamilyController::updateMemberRole
* @see app/Http/Controllers/FamilyController.php:161
* @route '/family/{family}/members/{userId}/role'
*/
updateMemberRole.url = (args: { family: number | { id: number }, userId: string | number } | [family: number | { id: number }, userId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            family: args[0],
            userId: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        family: typeof args.family === 'object'
        ? args.family.id
        : args.family,
        userId: args.userId,
    }

    return updateMemberRole.definition.url
            .replace('{family}', parsedArgs.family.toString())
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FamilyController::updateMemberRole
* @see app/Http/Controllers/FamilyController.php:161
* @route '/family/{family}/members/{userId}/role'
*/
updateMemberRole.patch = (args: { family: number | { id: number }, userId: string | number } | [family: number | { id: number }, userId: string | number ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateMemberRole.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\FamilyController::removeMember
* @see app/Http/Controllers/FamilyController.php:177
* @route '/family/{family}/members/{userId}'
*/
export const removeMember = (args: { family: number | { id: number }, userId: string | number } | [family: number | { id: number }, userId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeMember.url(args, options),
    method: 'delete',
})

removeMember.definition = {
    methods: ["delete"],
    url: '/family/{family}/members/{userId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\FamilyController::removeMember
* @see app/Http/Controllers/FamilyController.php:177
* @route '/family/{family}/members/{userId}'
*/
removeMember.url = (args: { family: number | { id: number }, userId: string | number } | [family: number | { id: number }, userId: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            family: args[0],
            userId: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        family: typeof args.family === 'object'
        ? args.family.id
        : args.family,
        userId: args.userId,
    }

    return removeMember.definition.url
            .replace('{family}', parsedArgs.family.toString())
            .replace('{userId}', parsedArgs.userId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FamilyController::removeMember
* @see app/Http/Controllers/FamilyController.php:177
* @route '/family/{family}/members/{userId}'
*/
removeMember.delete = (args: { family: number | { id: number }, userId: string | number } | [family: number | { id: number }, userId: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: removeMember.url(args, options),
    method: 'delete',
})

const FamilyController = { create, store, join, joinStore, show, update, inviteMember, addChild, updateMemberRole, removeMember }

export default FamilyController