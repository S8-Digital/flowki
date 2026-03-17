import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ScheduleController::upload
* @see app/Http/Controllers/ScheduleController.php:19
* @route '/schedule/upload'
*/
export const upload = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

upload.definition = {
    methods: ["post"],
    url: '/schedule/upload',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ScheduleController::upload
* @see app/Http/Controllers/ScheduleController.php:19
* @route '/schedule/upload'
*/
upload.url = (options?: RouteQueryOptions) => {
    return upload.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ScheduleController::upload
* @see app/Http/Controllers/ScheduleController.php:19
* @route '/schedule/upload'
*/
upload.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ScheduleController::upload
* @see app/Http/Controllers/ScheduleController.php:19
* @route '/schedule/upload'
*/
const uploadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ScheduleController::upload
* @see app/Http/Controllers/ScheduleController.php:19
* @route '/schedule/upload'
*/
uploadForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(options),
    method: 'post',
})

upload.form = uploadForm

/**
* @see \App\Http\Controllers\ScheduleController::confirm
* @see app/Http/Controllers/ScheduleController.php:42
* @route '/schedule/confirm'
*/
export const confirm = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirm.url(options),
    method: 'post',
})

confirm.definition = {
    methods: ["post"],
    url: '/schedule/confirm',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ScheduleController::confirm
* @see app/Http/Controllers/ScheduleController.php:42
* @route '/schedule/confirm'
*/
confirm.url = (options?: RouteQueryOptions) => {
    return confirm.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ScheduleController::confirm
* @see app/Http/Controllers/ScheduleController.php:42
* @route '/schedule/confirm'
*/
confirm.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirm.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ScheduleController::confirm
* @see app/Http/Controllers/ScheduleController.php:42
* @route '/schedule/confirm'
*/
const confirmForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirm.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ScheduleController::confirm
* @see app/Http/Controllers/ScheduleController.php:42
* @route '/schedule/confirm'
*/
confirmForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirm.url(options),
    method: 'post',
})

confirm.form = confirmForm

const schedule = {
    upload: Object.assign(upload, upload),
    confirm: Object.assign(confirm, confirm),
}

export default schedule