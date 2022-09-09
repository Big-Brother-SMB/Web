
import("https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js");
import("https://www.gstatic.com/firebasejs/8.3.1/firebase-auth.js");
import("https://www.gstatic.com/firebasejs/8.3.1/firebase-database.js");
import("https://www.gstatic.com/firebasejs/8.3.1/firebase-analytics.js");

registration.showNotification('Vibration1')

const firebaseConfig = {
    apiKey: "AIzaSyAPJ-33mJESHMcvEtaPX7JwIajUawblSuY",
    authDomain: "big-brother-ac39c.firebaseapp.com",
    databaseURL: "https://big-brother-ac39c-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "big-brother-ac39c",
    storageBucket: "big-brother-ac39c.appspot.com",
    messagingSenderId: "498546882155",
    appId: "1:498546882155:web:722a18432bf108e0c1632e",
    measurementId: "G-J5N38BGN7R"
};

firebase.initializeApp(firebaseConfig);


var database = firebase.database()


let name=""

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        registration.showNotification('Vibration2')
        name = user.displayName
        loopT()
    }
});




function loopT(){
    database.ref("users/"+user+"/notif").once('value').then(function(snapshot) {
        registration.showNotification('Vibration Sample', {
            body: snapshot.val(),
            icon: '../images/touch/chrome-touch-icon-192x192.png',
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            tag: 'vibration-sample'
          })
    })
    setTimeout(loopT,1000)
}

//----------------------------------notification--------------------------------------------------

console.log("aaa")
navigator.serviceWorker.register(window.location.origin+'/sw.js');
Notification.requestPermission(function(result) {
  if (result === 'granted') {
    navigator.serviceWorker.ready.then(function(registration) {
        registration.showNotification('test one');
    });
  }
});