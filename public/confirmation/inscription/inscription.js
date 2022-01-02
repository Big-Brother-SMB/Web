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

const jour = ["1lundi", "2mardi","3jeudi","4vendredi"];
function path(j,h){
    return "foyer_midi/semaine"+ parseInt(sessionStorage.getItem("week")) + "/" + jour[j] + "/" + (11 + h) + "h"
}
const menu = "../../menu/menu.html"

let user = sessionStorage.getItem("user");
let j = sessionStorage.getItem("j");
let h = parseInt(sessionStorage.getItem("h"));
console.log(path(j,h));

database.ref(path(j,h) + "/ouvert").once('value').then(function(snapshot) {
    if(snapshot.val() == 1 || snapshot.val() == 3){
        suite1();
    }else{
        window.location.href = menu;
        
    }
});


function suite1(){
    database.ref(path(j,h) + "/places").once('value').then(function(snapshot) {
        suite2(snapshot.val());
    });
}





function suite2(placesDisp){
    console.log("suite1");
    console.log(placesDisp);
    database.ref(path(j,h)).once('child_added').then(function(snapshot) {
        if(snapshot.numChildren() >= 0){
            suite3(placesDisp - snapshot.numChildren());
        }else{
            suite3(placesDisp);
        }
    });
}



function suite3(places){
    console.log("suite2");
    if(places <= 0){
        window.location.href = menu;
    }else{
        database.ref(path(j,h) + "/demandes/" + user + "/carte").set(12345);
        let text = places + " places"
        if(places==1){
            text = "une place"
        }
        document.getElementById("info").innerHTML = "il reste " + text +" <br>Vous êtes temporairement inscrit pendant 10sec<br>Voulez vous vous inscrire ?"
        document.getElementById("oui").addEventListener("click", function() {
            database.ref(path(j,h) + "/demandes/" + user).remove();
            database.ref(path(j,h) + "/demandes/" + user + "/carte").set(12345);
            window.location.href = menu;
        });
        document.getElementById("non").addEventListener("click", function() {
            database.ref(path(j,h) + "/demandes/" + user).remove();
            window.location.href = menu;
        });
        setTimeout(function() {
            console.log("remove");
            database.ref(path(j,h) + "/demandes/" + user).remove();
            window.location.href = menu;
        },10000);
    }
}

