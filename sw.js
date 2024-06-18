const CACHE_NAME = 'offline-map-cache';
const urlsToCache = [
  '/',
  'styles.css',
  'images/Station_1/IMG_0001_1.JPG',
  'images/Station_1/IMG_0002_1.JPG',
  'images/Station_1/IMG_0003_1.JPG',
  'images/Station_1/Wanderkarte_Ueberblick.PNG',
  // Add all resources that need to be available offline
];

// Install the service worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch cached resources
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
