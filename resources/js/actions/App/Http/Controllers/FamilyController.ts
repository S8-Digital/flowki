import type { WayfinderUrl } from '@/actions/types';

export function show(): WayfinderUrl {
    return { url: '/family', method: 'get' };
}

export function create(): WayfinderUrl {
    return { url: '/family/create', method: 'get' };
}

export function store(): WayfinderUrl {
    return { url: '/family', method: 'post' };
}

export function join(): WayfinderUrl {
    return { url: '/family/join', method: 'get' };
}

export function joinStore(): WayfinderUrl {
    return { url: '/family/join', method: 'post' };
}

export function update(): WayfinderUrl {
    return { url: '/family', method: 'patch' };
}

export function inviteMember(): WayfinderUrl {
    return { url: '/family/members', method: 'post' };
}

export function addChild(): WayfinderUrl {
    return { url: '/family/children', method: 'post' };
}

export function updateMemberRole(family: number | string, userId: number | string): WayfinderUrl {
    return { url: `/family/${family}/members/${userId}/role`, method: 'patch' };
}

export function removeMember(family: number | string, userId: number | string): WayfinderUrl {
    return { url: `/family/${family}/members/${userId}`, method: 'delete' };
}
