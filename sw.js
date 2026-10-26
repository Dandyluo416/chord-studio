/* Change VERSION whenever any shell asset changes. Updates activate on request. */
const VERSION='2.1.0-preview.1';
const PREFIX='chord-studio-shell-';
const CACHE=PREFIX+VERSION;
const BASE=new URL('./',self.location.href);
const ASSETS=['index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png','css/legacy-1.css','css/ui-v2.css','js/chord-engine.js','js/piano-samples.js','js/ui-v2.js','js/legacy-1.js','js/legacy-2.js','js/legacy-3.js','js/legacy-4.js','css/ui-v21.css','js/harmony-engine.js','js/poly-engine.js','js/ui-v21.js','assets/piano-studio.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await cache.addAll(ASSETS.map(path=>new Request(new URL(path,BASE),{cache:'reload'})));
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('message',event=>{
 if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();
 if(event.data?.type==='OFFLINE_STATUS')event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 const ready=(await Promise.all(ASSETS.map(p=>cache.match(new URL(p,BASE).href)))).every(Boolean);
 event.source?.postMessage({type:'OFFLINE_STATUS',ready,version:VERSION});
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 if(request.mode==='navigate'&&(url.pathname===BASE.pathname||url.pathname===new URL('index.html',BASE).pathname)){
 event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(new URL('index.html',BASE).href)||fetch(request)})());return;
 }
 if(ASSETS.some(p=>new URL(p,BASE).pathname===url.pathname))event.respondWith((async()=>{
 const cache=await caches.open(CACHE);return await cache.match(url.href,{ignoreSearch:true})||fetch(request);
 })());
});
