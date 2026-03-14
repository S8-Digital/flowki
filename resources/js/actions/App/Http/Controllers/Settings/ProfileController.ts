import type { WayfinderUrl } from '@/actions/types';

export function edit(): WayfinderUrl {
    return { url: '/settings/profile', method: 'get' };
}

export function update(): WayfinderUrl {
    return { url: '/settings/profile', method: 'patch' };
}

export function destroy(): WayfinderUrl {
    return { url: '/settings/profile', method: 'delete' };
}
