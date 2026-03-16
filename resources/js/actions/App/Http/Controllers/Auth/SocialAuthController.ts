import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\SocialAuthController::redirect
* @see app/Http/Controllers/Auth/SocialAuthController.php:23
* @route '/auth/{provider}/redirect'
*/
export const redirect = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: redirect.url(args, options),
    method: 'get',
})

redirect.definition = {
    methods: ["get","head"],
    url: '/auth/{provider}/redirect',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::redirect
* @see app/Http/Controllers/Auth/SocialAuthController.php:23
* @route '/auth/{provider}/redirect'
*/
redirect.url = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { provider: args }
    }

    if (Array.isArray(args)) {
        args = {
            provider: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        provider: args.provider,
    }

    return redirect.definition.url
            .replace('{provider}', parsedArgs.provider.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::redirect
* @see app/Http/Controllers/Auth/SocialAuthController.php:23
* @route '/auth/{provider}/redirect'
*/
redirect.get = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: redirect.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::redirect
* @see app/Http/Controllers/Auth/SocialAuthController.php:23
* @route '/auth/{provider}/redirect'
*/
redirect.head = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: redirect.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::callback
* @see app/Http/Controllers/Auth/SocialAuthController.php:55
* @route '/auth/{provider}/callback'
*/
export const callback = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: callback.url(args, options),
    method: 'get',
})

callback.definition = {
    methods: ["get","post","head"],
    url: '/auth/{provider}/callback',
} satisfies RouteDefinition<["get","post","head"]>

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::callback
* @see app/Http/Controllers/Auth/SocialAuthController.php:55
* @route '/auth/{provider}/callback'
*/
callback.url = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { provider: args }
    }

    if (Array.isArray(args)) {
        args = {
            provider: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        provider: args.provider,
    }

    return callback.definition.url
            .replace('{provider}', parsedArgs.provider.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::callback
* @see app/Http/Controllers/Auth/SocialAuthController.php:55
* @route '/auth/{provider}/callback'
*/
callback.get = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: callback.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::callback
* @see app/Http/Controllers/Auth/SocialAuthController.php:55
* @route '/auth/{provider}/callback'
*/
callback.post = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: callback.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::callback
* @see app/Http/Controllers/Auth/SocialAuthController.php:55
* @route '/auth/{provider}/callback'
*/
callback.head = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: callback.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::resume
* @see app/Http/Controllers/Auth/SocialAuthController.php:87
* @route '/auth/social/resume'
*/
export const resume = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: resume.url(options),
    method: 'get',
})

resume.definition = {
    methods: ["get","head"],
    url: '/auth/social/resume',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::resume
* @see app/Http/Controllers/Auth/SocialAuthController.php:87
* @route '/auth/social/resume'
*/
resume.url = (options?: RouteQueryOptions) => {
    return resume.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::resume
* @see app/Http/Controllers/Auth/SocialAuthController.php:87
* @route '/auth/social/resume'
*/
resume.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: resume.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::resume
* @see app/Http/Controllers/Auth/SocialAuthController.php:87
* @route '/auth/social/resume'
*/
resume.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: resume.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::link
* @see app/Http/Controllers/Auth/SocialAuthController.php:37
* @route '/auth/{provider}/link'
*/
export const link = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: link.url(args, options),
    method: 'get',
})

link.definition = {
    methods: ["get","head"],
    url: '/auth/{provider}/link',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::link
* @see app/Http/Controllers/Auth/SocialAuthController.php:37
* @route '/auth/{provider}/link'
*/
link.url = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { provider: args }
    }

    if (Array.isArray(args)) {
        args = {
            provider: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        provider: args.provider,
    }

    return link.definition.url
            .replace('{provider}', parsedArgs.provider.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::link
* @see app/Http/Controllers/Auth/SocialAuthController.php:37
* @route '/auth/{provider}/link'
*/
link.get = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: link.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::link
* @see app/Http/Controllers/Auth/SocialAuthController.php:37
* @route '/auth/{provider}/link'
*/
link.head = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: link.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::unlink
* @see app/Http/Controllers/Auth/SocialAuthController.php:114
* @route '/auth/{provider}/unlink'
*/
export const unlink = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unlink.url(args, options),
    method: 'delete',
})

unlink.definition = {
    methods: ["delete"],
    url: '/auth/{provider}/unlink',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::unlink
* @see app/Http/Controllers/Auth/SocialAuthController.php:114
* @route '/auth/{provider}/unlink'
*/
unlink.url = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { provider: args }
    }

    if (Array.isArray(args)) {
        args = {
            provider: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        provider: args.provider,
    }

    return unlink.definition.url
            .replace('{provider}', parsedArgs.provider.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\SocialAuthController::unlink
* @see app/Http/Controllers/Auth/SocialAuthController.php:114
* @route '/auth/{provider}/unlink'
*/
unlink.delete = (args: { provider: string | number } | [provider: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: unlink.url(args, options),
    method: 'delete',
})

const SocialAuthController = { redirect, callback, resume, link, unlink }

export default SocialAuthController