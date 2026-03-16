import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\AiController::index
* @see app/Http/Controllers/AiController.php:13
* @route '/assistant'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/assistant',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AiController::index
* @see app/Http/Controllers/AiController.php:13
* @route '/assistant'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AiController::index
* @see app/Http/Controllers/AiController.php:13
* @route '/assistant'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AiController::index
* @see app/Http/Controllers/AiController.php:13
* @route '/assistant'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AiController::chat
* @see app/Http/Controllers/AiController.php:18
* @route '/assistant/chat'
*/
export const chat = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat.url(options),
    method: 'post',
})

chat.definition = {
    methods: ["post"],
    url: '/assistant/chat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AiController::chat
* @see app/Http/Controllers/AiController.php:18
* @route '/assistant/chat'
*/
chat.url = (options?: RouteQueryOptions) => {
    return chat.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AiController::chat
* @see app/Http/Controllers/AiController.php:18
* @route '/assistant/chat'
*/
chat.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat.url(options),
    method: 'post',
})

const assistant = {
    index: Object.assign(index, index),
    chat: Object.assign(chat, chat),
}

export default assistant