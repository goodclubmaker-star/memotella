// MemoTella service worker — minimal, offline-friendly shell cache
var CACHE = 'memotella-v1';
self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(['./', './index.html', './manifest.json']); }).catch(function(){}));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ if (k !== CACHE) return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e){
  var url = e.request.url;
  if (url.indexOf('/functions/v1/') > -1 || url.indexOf('supabase.co') > -1) return;
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ try { c.put(e.request, copy); } catch(_e){} });
      return res;
    }).catch(function(){ return caches.match(e.request).then(function(m){ return m || caches.match('./index.html'); }); })
  );
});
