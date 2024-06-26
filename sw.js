const CACHE_NAME = 'offline-map-cache-v1';
const urlsToCache = [
  '/',
  'index.html',
  'styles.css',
];

self.addEventListener('install', function(event) {
  self.skipWaiting(); // Ensure the new service worker is activated immediately
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('offline-map-cache-') && cacheName !== CACHE_NAME;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response; // Return resource from cache
      }

      return fetch(event.request).then(function(response) {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Cache the new resource
        var responseToCache = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data.action === 'cache-resources') {
    caches.open(CACHE_NAME).then(function(cache) {
      cache.addAll(urlsToCache).then(function() {
        self.clients.matchAll().then(function(clients) {
          clients.forEach(function(client) {
            client.postMessage('cache-complete');
          });
        });
      }).catch(function(error) {
        console.error('Failed to add resources to cache:', error);
      });
    });
  }
});
