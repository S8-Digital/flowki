import type { WayfinderUrl } from '@/actions/types';

export function index(): WayfinderUrl {
    return { url: '/shopping', method: 'get' };
}

export function store(): WayfinderUrl {
    return { url: '/shopping', method: 'post' };
}

export function show(shoppingList: number | string): WayfinderUrl {
    return { url: `/shopping/${shoppingList}`, method: 'get' };
}

export function destroy(shoppingList: number | string): WayfinderUrl {
    return { url: `/shopping/${shoppingList}`, method: 'delete' };
}
