const swFingerPrint = 1;
const APP_CACHE_NAME = `restaurant-reviews-${swFingerPrint}`;

// Gh-Pages parameters
const ghPagesPagesHostname = 'lon-io.github.io';
const ghPagesPagesBasePathname = '/restaurant-reviews';

// Primary Assets and Routes
const assetsToCache = [
    '/',
    '/restaurant.html',
    '/js/index.js',
    '/js/restaurant.js',
    '/css/styles.css',
];

// Handle the install event
self.addEventListener('install', (event) => {
    // Cache App Assets
    event.waitUntil(
        caches.open(APP_CACHE_NAME)
        .then((cache) => {
            console.log(`{{sw.js}}: Cache ${APP_CACHE_NAME} Opened`);

            // For gh-pages, the `ghPagesPagesBasePathname` part of the route paths
            return cache.addAll(
                location.hostname === ghPagesPagesHostname ?
                assetsToCache.map(asset => `${ghPagesPagesBasePathname}${asset}`) :
                assetsToCache
            );
        })
    );
});

// Handle the activate event
// Delete old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                .filter((cacheName) => cacheName !== APP_CACHE_NAME)
                .map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// Handle Fetch events
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only handle request made by the app's origin
    // We only want to cache requests for assets from our origin
    if (url.origin === location.origin) {

        // Create a clone of the request stream for the fetch action
        const fetchRequest = event.request.clone();
        event.respondWith(
            fetch(fetchRequest).then((response) => {
                // Check if we received a valid response
                if (!response || response.status !== 200) {
                    return response;
                }

                // Clone the response stream for caching
                const responseClone = response.clone();

                // Cache the response
                caches.open(APP_CACHE_NAME)
                    .then((cache) => {
                        cache.put(event.request, responseClone);
                    });

                return response;
            }).catch(() => {
                return caches.match(event.request, { ignoreSearch: true, }).then((response) => {
                    // If the response is in Cache, return it
                    if (response) {
                        return response;
                    }
                })
            })
        );
    }
});