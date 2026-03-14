import type { WayfinderUrl } from '@/actions/types';

export function index(): WayfinderUrl {
    return { url: '/assistant', method: 'get' };
}

export function chat(): WayfinderUrl {
    return { url: '/assistant/chat', method: 'post' };
}
