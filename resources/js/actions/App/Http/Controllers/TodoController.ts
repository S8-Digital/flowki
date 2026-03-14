import type { WayfinderUrl } from '@/actions/types';

export function index(): WayfinderUrl {
    return { url: '/todos', method: 'get' };
}
index.url = '/todos';

export function store(): WayfinderUrl {
    return { url: '/todos', method: 'post' };
}

export function update(todo: number | string): WayfinderUrl {
    return { url: `/todos/${todo}`, method: 'patch' };
}

export function destroy(todo: number | string): WayfinderUrl {
    return { url: `/todos/${todo}`, method: 'delete' };
}
