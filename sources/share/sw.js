let notifAccept = true
let user = ""

self.addEventListener('install',()=>{
    self.skipWaiting()
})

self.addEventListener('push',(event)=>{
    const data = event.data ? event.data.json() : {};
    
    console.log(data.user_id,user)

    if(notifAccept && data.user_id == user) {
        //event.waitUntil(self.registration.showNotification(data.title, data))
        self.registration.showNotification(data.title, data)
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