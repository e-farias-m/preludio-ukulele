// Service worker for Preludio Ukulele.
// Static assets are cached on install; navigations prefer the network and
// fall back to the cached app shell so lessons work offline after first load.

'use strict';

var CACHE = 'preludio-ukulele-v9';

var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './logo.svg',
  './logo-dark.svg',
  './css/styles.css',
  './js/i18n.js',
  './js/curriculum.js',
  './js/progress.js',
  './js/audio.js',
  './js/micgate.js',
  './js/graphics.js',
  './js/practice.js',
  './js/app.js',
  './images/instruments/fretboard.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './LICENSE',
  './THIRD_PARTY_NOTICES.md'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key !== CACHE;
      }).map(function (key) {
        return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url;
  try { url = new URL(request.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) { cache.put('./index.html', copy); });
        }
        return response;
      }).catch(function () {
        return caches.match('./index.html');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
        }
        return response;
      });
    })
  );
});
