import type { WayfinderUrl } from '@/actions/types';

export function index(): WayfinderUrl {
    return { url: '/recipes', method: 'get' };
}

export function store(): WayfinderUrl {
    return { url: '/recipes', method: 'post' };
}

export function show(recipe: number | string): WayfinderUrl {
    return { url: `/recipes/${recipe}`, method: 'get' };
}

export function update(recipe: number | string): WayfinderUrl {
    return { url: `/recipes/${recipe}`, method: 'patch' };
}

export function destroy(recipe: number | string): WayfinderUrl {
    return { url: `/recipes/${recipe}`, method: 'delete' };
}
