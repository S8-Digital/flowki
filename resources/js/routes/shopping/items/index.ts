import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ShoppingItemController::store
* @see app/Http/Controllers/ShoppingItemController.php:13
* @route '/shopping/{shoppingList}/items'
*/
export const store = (args: { shoppingList: number | { id: number } } | [shoppingList: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/shopping/{shoppingList}/items',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ShoppingItemController::store
* @see app/Http/Controllers/ShoppingItemController.php:13
* @route '/shopping/{shoppingList}/items'
*/
store.url = (args: { shoppingList: number | { id: number } } | [shoppingList: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { shoppingList: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { shoppingList: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            shoppingList: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        shoppingList: typeof args.shoppingList === 'object'
        ? args.shoppingList.id
        : args.shoppingList,
    }

    return store.definition.url
            .replace('{shoppingList}', parsedArgs.shoppingList.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShoppingItemController::store
* @see app/Http/Controllers/ShoppingItemController.php:13
* @route '/shopping/{shoppingList}/items'
*/
store.post = (args: { shoppingList: number | { id: number } } | [shoppingList: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ShoppingItemController::update
* @see app/Http/Controllers/ShoppingItemController.php:24
* @route '/shopping/{shoppingList}/items/{shoppingItem}'
*/
export const update = (args: { shoppingList: number | { id: number }, shoppingItem: number | { id: number } } | [shoppingList: number | { id: number }, shoppingItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/shopping/{shoppingList}/items/{shoppingItem}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ShoppingItemController::update
* @see app/Http/Controllers/ShoppingItemController.php:24
* @route '/shopping/{shoppingList}/items/{shoppingItem}'
*/
update.url = (args: { shoppingList: number | { id: number }, shoppingItem: number | { id: number } } | [shoppingList: number | { id: number }, shoppingItem: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            shoppingList: args[0],
            shoppingItem: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        shoppingList: typeof args.shoppingList === 'object'
        ? args.shoppingList.id
        : args.shoppingList,
        shoppingItem: typeof args.shoppingItem === 'object'
        ? args.shoppingItem.id
        : args.shoppingItem,
    }

    return update.definition.url
            .replace('{shoppingList}', parsedArgs.shoppingList.toString())
            .replace('{shoppingItem}', parsedArgs.shoppingItem.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShoppingItemController::update
* @see app/Http/Controllers/ShoppingItemController.php:24
* @route '/shopping/{shoppingList}/items/{shoppingItem}'
*/
update.patch = (args: { shoppingList: number | { id: number }, shoppingItem: number | { id: number } } | [shoppingList: number | { id: number }, shoppingItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\ShoppingItemController::toggle
* @see app/Http/Controllers/ShoppingItemController.php:33
* @route '/shopping/{shoppingList}/items/{shoppingItem}/toggle'
*/
export const toggle = (args: { shoppingList: number | { id: number }, shoppingItem: number | { id: number } } | [shoppingList: number | { id: number }, shoppingItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggle.url(args, options),
    method: 'patch',
})

toggle.definition = {
    methods: ["patch"],
    url: '/shopping/{shoppingList}/items/{shoppingItem}/toggle',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ShoppingItemController::toggle
* @see app/Http/Controllers/ShoppingItemController.php:33
* @route '/shopping/{shoppingList}/items/{shoppingItem}/toggle'
*/
toggle.url = (args: { shoppingList: number | { id: number }, shoppingItem: number | { id: number } } | [shoppingList: number | { id: number }, shoppingItem: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            shoppingList: args[0],
            shoppingItem: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        shoppingList: typeof args.shoppingList === 'object'
        ? args.shoppingList.id
        : args.shoppingList,
        shoppingItem: typeof args.shoppingItem === 'object'
        ? args.shoppingItem.id
        : args.shoppingItem,
    }

    return toggle.definition.url
            .replace('{shoppingList}', parsedArgs.shoppingList.toString())
            .replace('{shoppingItem}', parsedArgs.shoppingItem.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShoppingItemController::toggle
* @see app/Http/Controllers/ShoppingItemController.php:33
* @route '/shopping/{shoppingList}/items/{shoppingItem}/toggle'
*/
toggle.patch = (args: { shoppingList: number | { id: number }, shoppingItem: number | { id: number } } | [shoppingList: number | { id: number }, shoppingItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggle.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\ShoppingItemController::destroy
* @see app/Http/Controllers/ShoppingItemController.php:42
* @route '/shopping/{shoppingList}/items/{shoppingItem}'
*/
export const destroy = (args: { shoppingList: number | { id: number }, shoppingItem: number | { id: number } } | [shoppingList: number | { id: number }, shoppingItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/shopping/{shoppingList}/items/{shoppingItem}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ShoppingItemController::destroy
* @see app/Http/Controllers/ShoppingItemController.php:42
* @route '/shopping/{shoppingList}/items/{shoppingItem}'
*/
destroy.url = (args: { shoppingList: number | { id: number }, shoppingItem: number | { id: number } } | [shoppingList: number | { id: number }, shoppingItem: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            shoppingList: args[0],
            shoppingItem: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        shoppingList: typeof args.shoppingList === 'object'
        ? args.shoppingList.id
        : args.shoppingList,
        shoppingItem: typeof args.shoppingItem === 'object'
        ? args.shoppingItem.id
        : args.shoppingItem,
    }

    return destroy.definition.url
            .replace('{shoppingList}', parsedArgs.shoppingList.toString())
            .replace('{shoppingItem}', parsedArgs.shoppingItem.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShoppingItemController::destroy
* @see app/Http/Controllers/ShoppingItemController.php:42
* @route '/shopping/{shoppingList}/items/{shoppingItem}'
*/
destroy.delete = (args: { shoppingList: number | { id: number }, shoppingItem: number | { id: number } } | [shoppingList: number | { id: number }, shoppingItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const items = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    toggle: Object.assign(toggle, toggle),
    destroy: Object.assign(destroy, destroy),
}

export default items