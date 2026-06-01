// Flowki PWA Service Worker
// Stale-while-revalidate strategy for static assets; network-first for all page/API routes.

const CACHE_NAME = 'flowki-cache-v1';

const APP_SHELL_URLS = ['/'];

const API_ROUTE_PATTERNS = [
    /^\/api\//,
    /^\/calendar/,
    /^\/todos/,
    /^\/chores/,
    /^\/shopping/,
    /^\/recipes/,
    /^\/meals/,
    /^\/assistant/,
    /^\/family/,
    /^\/dashboard/,
    /^\/search/,
    /^\/notifications/,
    /^\/weather/,
    /^\/settings/,
];

// Matches static asset file extensions that are safe to cache
const STATIC_ASSET_PATTERN = /\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif)$/;

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

// Fetch: skip Inertia/API requests; stale-while-revalidate for static assets only
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

    // Skip Inertia XHR requests — they have per-request headers and must not be served
    // from cache (initial responses vs. deferred-prop responses differ for the same URL)
    if (request.headers.get('X-Inertia')) {
        return;
    }

    const isApiRoute = API_ROUTE_PATTERNS.some((pattern) => pattern.test(url.pathname));
    const isStaticAsset = STATIC_ASSET_PATTERN.test(url.pathname);

    if (isApiRoute) {
        // Network-first for app page routes: always fetch fresh, fall back to cache
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

    if (isStaticAsset) {
        // Stale-while-revalidate for static assets (JS, CSS, images, fonts)
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
        return;
    }

    // For all other GET requests (app shell, manifest, etc.): stale-while-revalidate
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
