let notifAccept = true
let user = ""

self.addEventListener('install',(event)=>{
    self.skipWaiting()
    event.waitUntil(
        caches.open('my-cache').then((cache) => {
          return cache.addAll([
            '/',
            '/share/manifest.json',
            '/assets/logo.png'
            // Ajoutez d'autres fichiers statiques ici
          ]);
        })
    );
    console.log("install sw")
})

self.addEventListener('push',(event)=>{
    const data = event.data ? event.data.json() : {};
    
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