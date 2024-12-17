// Nama cache
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';
const ASSETS = [
    '/', // Cache halaman utama
    '/index.html',
    '/manifest.json',
    '/css/style.css',
    '/asset/icon/icon512_maskable.png',
    '/asset/icon/icon512_rounded.png'
];

// Event Install - Cache Static Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('Caching static assets');
            return cache.addAll(ASSETS);
        })
    );
});

// Event Activate - Cleanup Old Caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
                        console.log('Deleting old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// Strategi Cache First untuk Static Assets
const cacheFirst = (request) => {
    return caches.match(request).then((cachedResponse) => {
        console.log("Cache First : "+cachedResponse);
        return cachedResponse || fetch(request);
    });
};

// Strategi Network First untuk Halaman HTML
const networkFirst = (request) => {
    return fetch(request)
        .then((networkResponse) => {
            console.log("Network First : "+networkResponse);
            return caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, networkResponse.clone());
                return networkResponse;
            });
        })
        .catch(() => {
            return caches.match(request);
        });
};

// Strategi Stale-While-Revalidate untuk Aset Dinamis
const staleWhileRevalidate = (request) => {
    console.log("Stale While Revalidate : "+networkResponse);
    return caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
            caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, networkResponse.clone());
            });
            return networkResponse;
        });
        return cachedResponse || fetchPromise;
    });
};

// Strategi Network Only untuk Endpoint Khusus
const networkOnly = (request) => {
    return fetch(request).catch((error) => {
        console.error('Network request failed:', error);
        throw new Error('Network error: Resource unavailable.');
    });
};

// Event Fetch - Menangani Berbagai Strategi
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (url.origin === location.origin) {
        // Cache First untuk Static Assets
        if (ASSETS.includes(url.pathname)) {
            event.respondWith(cacheFirst(request));
        }
    } else {
        // Network Only untuk endpoint JSON
        if (url.href.includes('jsonplaceholder.typicode.com/todos')) {
            // Untuk Network Only
            // event.respondWith(networkOnly(request));

            // Untuk Cache Data
            event.respondWith(fetch(request).then((networkResponse) => {
                return cacheUserData(request, networkResponse);
            }).catch(() => {
                console.log('Network failed, loading user data from cache...');
                return getCachedUserData(request);
            }))
        } else if (request.destination === 'image') {
            // Stale-While-Revalidate untuk resource pihak ketiga
            event.respondWith(staleWhileRevalidate(request));
        } else {
            // Network First untuk konten lainnya
            event.respondWith(networkFirst(request));
        }
    }
});

// Untuk melakukan cache data user
const cacheUserData = async (request, response) => {
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
};

const getCachedUserData = async (request) => {
    const cache = await caches.open(DYNAMIC_CACHE);
    return cache.match(request);
};

// const CACHE_NAME = 'static-cache-v1';
// const ASSETS = [
//     '/',
//     '/index.html',
//     'manifest.json',
//     '/css/style.css',
//     '/asset/icon/icon512_maskable.png',
//     '/asset/icon/icon512_rounded.png'
// ];

// // Install event - cache assets
// self.addEventListener('install', event => {
//     event.waitUntil(
//         caches.open(CACHE_NAME).then(cache => {
//             // console.log('Caching assets');
//             return cache.addAll(ASSETS);
//         })
//     );
// });

// // Activate event - cleanup old caches
// self.addEventListener('activate', event => {
//     event.waitUntil(
//         caches.keys().then(cacheNames => {
//             return Promise.all(
//                 cacheNames.map(cache => {
//                     if (cache !== CACHE_NAME) {
//                         console.log('Clearing old cache:', cache);
//                         return caches.delete(cache);
//                     }
//                 })
//             );
//         })
//     );
// });

// // Fetch event - serve cached content
// self.addEventListener('fetch', event => {
//     event.respondWith(
//         caches.match(event.request).then(response => {
//             return response || fetch(event.request);
//         })
//     );
// });