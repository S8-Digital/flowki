import type { WayfinderUrl } from '@/actions/types';

export function index(): WayfinderUrl {
    return { url: '/calendar', method: 'get' };
}

export function store(): WayfinderUrl {
    return { url: '/calendar', method: 'post' };
}

export function update(calendarEvent: number | string): WayfinderUrl {
    return { url: `/calendar/${calendarEvent}`, method: 'patch' };
}

export function move(calendarEvent: number | string): WayfinderUrl {
    return { url: `/calendar/${calendarEvent}/move`, method: 'patch' };
}

export function destroy(calendarEvent: number | string): WayfinderUrl {
    return { url: `/calendar/${calendarEvent}`, method: 'delete' };
}
