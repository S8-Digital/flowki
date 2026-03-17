import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'

/**
 * @see \App\Http\Controllers\RosterController::upload
 * @see app/Http/Controllers/RosterController.php
 * @route '/schedule/upload'
 */
export const upload = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

upload.definition = {
    methods: ['post'],
    url: '/schedule/upload',
} satisfies RouteDefinition<['post']>

upload.url = (options?: RouteQueryOptions) => {
    return upload.definition.url + queryParams(options)
}

upload.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

const uploadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(options),
    method: 'post',
})

uploadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(options),
    method: 'post',
})

upload.form = uploadForm

/**
 * @see \App\Http\Controllers\RosterController::confirm
 * @see app/Http/Controllers/RosterController.php
 * @route '/schedule/confirm'
 */
export const confirm = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirm.url(options),
    method: 'post',
})

confirm.definition = {
    methods: ['post'],
    url: '/schedule/confirm',
} satisfies RouteDefinition<['post']>

confirm.url = (options?: RouteQueryOptions) => {
    return confirm.definition.url + queryParams(options)
}

confirm.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirm.url(options),
    method: 'post',
})

const confirmForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirm.url(options),
    method: 'post',
})

confirmForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirm.url(options),
    method: 'post',
})

confirm.form = confirmForm

const RosterController = { upload, confirm }

export default RosterController
