const dbName = 'audio-guide-db';
const dbVersion = 1;
let db;

const openRequest = indexedDB.open(dbName, dbVersion);

openRequest.onupgradeneeded = event => {
  db = event.target.result;
  if (!db.objectStoreNames.contains('files')) {
    db.createObjectStore('files', { keyPath: 'url' });
  }
};

openRequest.onsuccess = event => {
  db = event.target.result;
  cacheFiles(urlsToCache);
};

function cacheFiles(urls) {
  urls.forEach(url => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const transaction = db.transaction(['files'], 'readwrite');
        const objectStore = transaction.objectStore('files');
        objectStore.put({ url, blob });
      });
  });
}

function getFile(url, callback) {
  const transaction = db.transaction(['files'], 'readonly');
  const objectStore = transaction.objectStore('files');
  const request = objectStore.get(url);

  request.onsuccess = event => {
    if (request.result) {
      callback(request.result.blob);
    }
  };
}
