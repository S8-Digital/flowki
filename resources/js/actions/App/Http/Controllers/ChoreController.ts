import type { WayfinderUrl } from '@/actions/types';

export function index(): WayfinderUrl {
    return { url: '/chores', method: 'get' };
}

export function store(): WayfinderUrl {
    return { url: '/chores', method: 'post' };
}

export function update(chore: number | string): WayfinderUrl {
    return { url: `/chores/${chore}`, method: 'patch' };
}

export function destroy(chore: number | string): WayfinderUrl {
    return { url: `/chores/${chore}`, method: 'delete' };
}

export function complete(chore: number | string): WayfinderUrl {
    return { url: `/chores/${chore}/complete`, method: 'post' };
}
