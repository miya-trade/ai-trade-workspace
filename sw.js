const CACHE="ai-trade-workspace-v3-static-v1";
const ASSETS=["./","./index.html","./app.js","./firebase-config.js","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(url.origin===location.origin){
    event.respondWith(fetch(event.request).then(r=>{
      const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return r;
    }).catch(()=>caches.match(event.request)));
  }
});
