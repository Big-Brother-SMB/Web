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

const menu = "../../menu/menu.html"
const jour = ["1lundi", "2mardi","3jeudi","4vendredi"];
function path(j,h){
    return "foyer_midi/semaine"+ parseInt(sessionStorage.getItem("week")) + "/" + jour[j] + "/" + (11 + h) + "h"
}
function reload(){
    window.location.reload(true)
}

let user = sessionStorage.getItem("user");
let j = sessionStorage.getItem("j");
let h = parseInt(sessionStorage.getItem("h"));
console.log(path(j,h))

database.ref(path(j,h) + "/ouvert").once('value').then(function(snapshot) {
    if(snapshot.val() == 3 || snapshot.val() == 5){
        window.location.href = menu;
    }else if(snapshot.val() == 7){
        robi();
    }else{
        document.getElementById("amis").style = "display:none"
        document.getElementById("pAmis").style = "display:none"
        suite();
    }
});

function robi(){
    console.log("robi")
    let divAmis = document.getElementById("amis")
    database.ref(path(j,h) + "/demandes/" + user + "/amis").once("value", function(snapshot) {
        divAmis.innerHTML = ""
        snapshot.forEach(function(child) {
            let ami = document.createElement("button")
            ami.classList.add("amis")
            ami.innerHTML = child.key + " (supprimer)"
            ami.addEventListener("click", function() {
                console.log("remove")
                database.ref(path(j,h) + "/demandes/" + user + "/amis/" + child.key).remove();
                reload()
            })
            divAmis.appendChild(ami);
        })
        suite();
    })
}



function suite(){
    document.getElementById("info").innerHTML = "Vous êtes inscrit à cet horraire"
    document.getElementById("oui").addEventListener("click", function() {
        database.ref(path(j,h) + "/demandes/" + user).remove();
        window.location.href = menu;
    });
    document.getElementById("non").addEventListener("click", function() {
        window.location.href = menu;
    });
}



