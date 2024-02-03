const cacheName = "PWA-v13";
const appShellFiles = [
            '/share/manifest.json',
            '/assets/logo.png',

            '/share/common.js',
            '/share/common.css',
            '/share/user_sidebar.html',

            '/pass',
            '/pass/pass.js',
            '/pass/pass.css',
            '/pass/pass.main.html',
            '/pass/pass.tete.html',
            '/pass/pass.titre.html',
            'https://cdn.jsdelivr.net/jsbarcode/3.3.20/JsBarcode.all.min.js',
            'https://cdn.socket.io/4.4.1/socket.io.esm.min.js'
];


let notifAccept = true
let user = ""

self.addEventListener('install',(event)=>{
    //self.skipWaiting()
    event.waitUntil(
        (async () => {
            const cache = await caches.open(cacheName);
            await cache.addAll(appShellFiles)
        })(),
    );
    console.log(`[Service Worker] Install: ${cacheName}`)
})

self.addEventListener("activate",(event)=>{
    clients.claim()
    event.waitUntil(
        (async () => {
            const keys = await caches.keys()
            await Promise.all(
                keys.map((key)=>{
                    if(!key.includes(cacheName)){
                        return caches.delete(key)
                    }
                })
            )
        })(),
    );
})

self.addEventListener("fetch",(event)=>{
    //console.log(`[Service Worker] Fetching resource: ${event.request.url}`)
    event.respondWith(
        (async () => {
            const r = await caches.match(event.request);
            if (r) {return r;}
            try{
                let response = await fetch(event.request)
                //const cache = await caches.open(cacheName);
                //cache.put(event.request, response.clone());
                return response;
            }catch(e){}
        })(),
    );
})

self.addEventListener('push',(event)=>{
    const data = event.data ? event.data.json() : {};
    event.waitUntil(self.registration.showNotification(data.title, data))
    
    console.log(data.user_id,user)

    if(notifAccept && data.user_id == user) {
        event.waitUntil(self.registration.showNotification(data.title, data))
    }
})

self.addEventListener('message', function (evt) {
    notifAccept = evt.data.notif
    user = evt.data.user
})

self.addEventListener('notificationclick', function (event) {
    event.notification.close()
    if(event.notification.data!=null) self.clients.openWindow(event.notification.data.url)
})