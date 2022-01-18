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

let user = sessionStorage.getItem("user");
let classe = sessionStorage.getItem("classe");

database.ref("users/" + user + "/score").once("value", function(snapshot) {
    if(snapshot.val() == null){
        database.ref("users/" + user + "/score").set(0);
    }
})

database.ref("users/" + user + "/classe").once("value", function(snapshot) {
    if(snapshot.val() == null){
        database.ref("users/" + user + "/classe").set(classe);
    }
})

setTimeout(function() {
    window.location.href = "menu/menu.html";
},2000);



