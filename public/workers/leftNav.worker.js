self.importScripts('workers.js');
var CACHE_NAME = 'wdx_leftNav';

self.addEventListener('install', function(event) {
    console.log('[ServiceWorker], Installed.');
});
self.addEventListener('activate', function(e) {
    console.log("[ServiceWorker], Activated.");
});

self.addEventListener('fetch', function(e) {
    var cachedObject;
    var updatedObject;
    if(self.wdxWorkers.seekingRequest(e.request)){
      e.respondWith(
      caches.match(e.request)
        .then(function(response) {
          if (response!==undefined) {
            response.json().then(function(json) {
              cachedObject = json;
              fetch(e.request)
              .then(function(newResponse) {
                if (newResponse.ok) {
                  var responseClone = newResponse.clone();
                  newResponse.json().then(function(json) {
                    updatedObject = json;
                    if(self.wdxWorkers.isEquivalent(cachedObject, updatedObject)){
                      console.log("[Service Worker], from cache.");
                      return response;
                    } else {
                      console.log("[Service Worker]. updated record.");
                      e.waitUntil(
                          self.wdxWorkers.update(CACHE_NAME, e.request)
                      );
                    }
                  });
                }
              });
            });
          } else {
            e.waitUntil(
                self.wdxWorkers.update(CACHE_NAME, e.request)
            );
          }
          return fetch(e.request);
        })
      );
    }//End if
});
