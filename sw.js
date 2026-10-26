const CACHE='respawntech-2026.10.26.4';
const FILES=['./','./index.html','./styles.css?v=2026.10.26.4','./app.js?v=2026.10.26.4','./pdf.js?v=2026.10.26.4','./vendor/jspdf.umd.min.js?v=2026.10.26.4','./icon.svg','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('respawntech-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r || (e.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));});
