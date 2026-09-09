const CACHE='app-omar-v19-mobile-fix';
const ASSETS=['./','./manifest.json','./icon_192.png','./icon_512.png'];

// لا تعمل cache لـ daily و index عشان الموبايل ياخد الجديد فورا
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const url = e.request.url;
  // اي حاجة تبع جوجل او الثيمات او اليومية متعملهاش cache - network first
  if(url.includes('daily.html') || url.includes('index.html') || url.includes('themes.js') || url.includes('drive.js') || url.includes('script.google.com') || url.includes('script.googleusercontent.com') || url.includes('googleapis.com')){
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r=>{
      if(r) return r;
      return fetch(e.request).then(res=>{
        if(e.request.method==='GET' && res.status===200 && e.request.url.startsWith(self.location.origin)){
          let clone=res.clone(); caches.open(CACHE).then(c=>c.put(e.request, clone));
        }
        return res;
      }).catch(()=>r);
    })
  );
});
