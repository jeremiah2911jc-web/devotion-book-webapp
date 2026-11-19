const CACHE='devotion-public-1.2.3';
// The production host redirects /index.html to /. Cache the direct response.
const HOME='/';
const CORE=[HOME,'/app.js','/styles.css','/assets/css/reading-workspace.css','/assets/js/reading-workspace.js','/assets/js/offline-notes.js','/assets/js/scripture-reference-utils.js','/assets/vendor/supabase.js','/assets/editorial/coast-study.jpg','/assets/data/mcheyne-reading-plan.json','/manifest.webmanifest','/version.json','/favicon.ico'];
self.addEventListener('install',event=>{
  // A page blocked by the old worker cannot ask the replacement to activate.
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('devotion-public-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='DEVOTION_ACTIVATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const request=event.request;const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
  if(['code','access_token','refresh_token','token_hash','error'].some(key=>url.searchParams.has(key)))return;
  const known=CORE.includes(url.pathname)||url.pathname.startsWith('/assets/');
  if(url.pathname==='/version.json'){
    event.respondWith(fetch(request,{cache:'no-store'}).catch(()=>caches.match('/version.json')));return;
  }
  if(request.mode==='navigate'){
    if(![HOME,'/index.html'].includes(url.pathname))return;
    event.respondWith(caches.open(CACHE).then(cache=>cache.match(HOME)).then(cached=>{
      if(cached && !cached.redirected)return cached;
      return fetch(request);
    }));
    return;
  }
  if(!known)return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const existing=await cache.match(request,{ignoreSearch:true});if(existing)return existing;
    const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;
  }));
});
