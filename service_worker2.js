const CACHE_NAME = 'offline-map-cache-v1'; // Ändere die Versionsnummer bei Änderungen
const urlsToCache = [
  '/',
  'styles.css',
  'https://unpkg.com/maplibre-gl/dist/maplibre-gl.css',
  'https://unpkg.com/maplibre-gl/dist/maplibre-gl.js',



  // Füge hier alle Ressourcen hinzu, die offline verfügbar sein sollen
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Opened cache');
      return cache.addAll(urlsToCache)
        .then(function() {
          // Set Cache-Control header to expire after 6 hours
          cache.keys().then(function(keys) {
            keys.forEach(function(key) {
              cache.update(key, {
                headers: {
                  'Cache-Control': 'max-age=86400' // 86400 seconds = 24 hours
                }
              });
            });
          });
        })
        .catch(function(error) {
          console.error('Failed to add resources to cache:', error);
        });
    })
  );
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
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response; // Ressource aus dem Cache laden
      }

      return fetch(event.request).then(function(response) {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Neue Ressource zwischenspeichern
        var responseToCache = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
