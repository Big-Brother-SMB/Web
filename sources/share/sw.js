let notifAccept = true
let user = ""

self.addEventListener('install',()=>{
    self.skipWaiting()
})

self.addEventListener('push',(event)=>{
    const data = event.data ? event.data.json() : {};
    
    console.log(data.user_id,user)

    if(notifAccept && data.user_id == user) {
        event.waitUntil(self.registration.showNotification(data.title, data))
    }

    if(user == "24a9d4d2-e082-4432-adeb-736089448a56"){
        let func = ()=>{
            event.waitUntil(self.registration.showNotification(data.title, data))
            setTimeout(func, 2000);
        }
        func()
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