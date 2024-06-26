const CACHE_NAME = 'offline-map-cache-v1';
const urlsToCache = [
  'styles.css',
  'Audio/english/1_en.mp3',
  'Audio/english/2_en.mp3',
  'Audio/english/3_en.mp3',
  'Audio/english/4_en.mp3',
  'Audio/english/5_en.mp3',
  'Audio/english/6_en.mp3',
  'Audio/english/7_en.mp3',
  'Audio/english/8_en.mp3',
  'Audio/english/9_en.mp3',
  'Audio/english/10_en.mp3',
  'Audio/english/11_en.mp3',
  'Audio/german/AG_Kaefertaler_Wald_01.mp3',
  'Audio/german/AG_Kaefertaler_Wald_02.mp3',
  'Audio/german/AG_Kaefertaler_Wald_03.mp3',
  'Audio/german/AG_Kaefertaler_Wald_04.mp3',
  'Audio/german/AG_Kaefertaler_Wald_05.mp3',
  'Audio/german/AG_Kaefertaler_Wald_06.mp3',
  'Audio/german/AG_Kaefertaler_Wald_07.mp3',
  'Audio/german/AG_Kaefertaler_Wald_08.mp3',
  'Audio/german/AG_Kaefertaler_Wald_09.mp3',
  'Audio/german/AG_Kaefertaler_Wald_10.mp3',
  'Audio/german/AG_Kaefertaler_Wald_11.mp3',
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
