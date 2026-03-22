// Flowki PWA Service Worker
// Stale-while-revalidate strategy for app shell; network-first for API routes.

const CACHE_NAME = 'flowki-cache-v1';

const APP_SHELL_URLS = ['/'];

const API_ROUTE_PATTERNS = [/^\/api\//, /^\/calendar/, /^\/todos/, /^\/chores/, /^\/shopping/];

// Install: cache the app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(APP_SHELL_URLS).catch(() => {
                // Silently ignore failures (offline during install)
            });
        }),
    );
    self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key)),
            ),
        ),
    );
    self.clients.claim();
});

// Fetch: stale-while-revalidate for navigation & static assets; network-first for API routes
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle same-origin requests
    if (url.origin !== self.location.origin) {
        return;
    }

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    const isApiRoute = API_ROUTE_PATTERNS.some((pattern) => pattern.test(url.pathname));

    if (isApiRoute) {
        // Network-first for API / data routes: update cache in background
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const cloned = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
                    }

                    return response;
                })
                .catch(() =>
                    caches.match(request).then(
                        (cached) =>
                            cached ??
                            new Response('Offline – content unavailable', {
                                status: 503,
                                statusText: 'Service Unavailable',
                            }),
                    ),
                ),
        );
        return;
    }

    // Stale-while-revalidate for everything else (app shell, assets)
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(request).then((cached) => {
                const networkFetch = fetch(request).then((response) => {
                    if (response.ok) {
                        cache.put(request, response.clone());
                    }

                    return response;
                });

                if (cached) {
                    // Revalidate in the background; swallow errors to avoid unhandled rejections
                    event.waitUntil(networkFetch.catch(() => {}));

                    return cached;
                }

                return networkFetch.catch(
                    () =>
                        new Response('Offline – content unavailable', {
                            status: 503,
                            statusText: 'Service Unavailable',
                        }),
                );
            });
        }),
    );
});
