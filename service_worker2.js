const CACHE_NAME = 'offline-map-cache-v1'; // Ändere die Versionsnummer bei Änderungen
const urlsToCache = [
  '/',
  'index.html',
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
  'images/*/*.jpg',
  'images/*/*.JPG',

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
          return response;
        }
  
        return fetch(event.request).then(function(response) {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
  
          var responseToCache = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseToCache);
          });
  
          return response;
        }).catch(function() {
          return new Promise(function(resolve, reject) {
            const openRequest = indexedDB.open(dbName, dbVersion);
            openRequest.onsuccess = function(event) {
              db = event.target.result;
              const transaction = db.transaction(['files'], 'readonly');
              const objectStore = transaction.objectStore('files');
              const request = objectStore.get(event.request.url);
              request.onsuccess = function(event) {
                if (request.result) {
                  const response = new Response(request.result.blob);
                  resolve(response);
                } else {
                  reject('Datei nicht gefunden in IndexedDB');
                }
              };
              request.onerror = function(event) {
                reject('Fehler beim Abrufen der Datei aus IndexedDB');
              };
            };
          });
        });
      })
    );
  });
  
