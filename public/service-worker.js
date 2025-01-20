const CACHE_NAME = 'portfolio-cache-v1';

// Assets to cache
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/retro-powerup.mp3',
];

// CSS and JS files will be cached automatically based on their extensions
const CACHEABLE_EXTENSIONS = ['.js', '.css', '.woff2', '.jpg', '.png', '.svg', '.gif'];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...', event);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate worker immediately
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...', event);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[Service Worker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Ensure service worker takes control immediately
  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('[Service Worker] Serving offline page for navigation');
          return caches.match('/offline');
        })
        .then((response) => response || caches.match('/offline'))
    );
    return;
  }

  // For other requests, try the cache first, then network
  const isAssetRequest = CACHEABLE_EXTENSIONS.some(ext => 
    event.request.url.toLowerCase().endsWith(ext)
  );

  if (isAssetRequest) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached response if found
          if (response) {
            console.log('[Service Worker] Serving from cache:', event.request.url);
            return response;
          }

          // Otherwise, fetch from network and cache
          console.log('[Service Worker] Fetching from network:', event.request.url);
          return fetch(event.request)
            .then((response) => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response as it can only be consumed once
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                  console.log('[Service Worker] Cached new resource:', event.request.url);
                });

              return response;
            })
            .catch(() => {
              // If both cache and network fail, return offline page for HTML requests
              if (event.request.headers.get('accept')?.includes('text/html')) {
                console.log('[Service Worker] Serving offline page due to error');
                return caches.match('/offline');
              }
              console.log('[Service Worker] Failed to fetch:', event.request.url);
              return new Response('Offline content not available');
            });
        })
    );
  }
}); 