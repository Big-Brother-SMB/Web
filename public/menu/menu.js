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
console.log(user);

document.getElementById("deco").addEventListener("click", function() {
    sessionStorage.setItem("logged", 0);
    window.location.href = "../index.html";
});

document.getElementById("pass").addEventListener("click", function() {
    window.location.href = "../pass/pass.html";
});


const body = document.getElementById("body");
const jour = ["lundi", "mardi","jeudi","vendredi"];

let bouton = [];
let total = [];
let demandes = [];
let places = [];
let inscrit = []
let ouvert = []


for(let j = 0; j < 4; j++){
    let div = document.createElement("div")
    let text = document.createElement("button")
    text.className = "jours";
    text.innerHTML = jour[j]
    div.appendChild(text);
    
    bouton[j] = []
    total[j] = []
    places[j] = []
    demandes[j] = []
    inscrit[j] = [false,false]
    ouvert[j] = [0,0]
    for(let h = 0; h < 2; h++){
        bouton[j][h] = document.createElement("button")
        bouton[j][h].id = "" + j + h;
        bouton[j][h].onclick = function(){select(j,h)};
        bouton[j][h].className="places"
        div.appendChild(bouton[j][h]);
      
    }
    body.appendChild(div);
   
}


let nbFois = 0;
refreshDatabase();
function refreshDatabase(){
    for(let j = 0; j < 4; j++){
        for(let h = 0; h < 2; h++){
            database.ref(path(j,h) + "/places").once('value').then(function(snapshot) {
                total[j][h] = snapshot.val();
                update(j, h);
            });
      
            database.ref(path(j,h) + "/ouvert").once('value').then(function(snapshot) {
                ouvert[j][h] = snapshot.val()
                update(j, h);
            });
         
            demandes[j][h] = 0
      
            database.ref(path(j,h)).once('child_added').then(function(snapshot) {
                if(snapshot.numChildren() >= 0){
                    demandes[j][h] = snapshot.numChildren();
                    update(j, h);
                }
            });
      
            database.ref(path(j,h) + "/demandes").once("value", function(snapshot) {
                snapshot.forEach(function(child) {
                    if(child.key == user){
                        nbFois++;
                        console.log("nb fois : " + nbFois)
                        inscrit[j][h] = true;
                    }else{
                        console.log(jour[j] + " à " + (11 + h) + "h, -> " + child.key);
                    }
                    
                });
            });
        
        }
    }
}


function update(j,h){
    places[j][h] = total[j][h] - demandes[j][h];
    let text = "il reste " + places[j][h] + " places";
    switch (ouvert[j][h]){
        case 0:
            text = "horaire non planifié"
            bouton[j][h].className="ferme"
        case 1:
            if(places[j][h] <= 0){
                bouton[j][h].className="zero"
                text = "plein";
            }else if(places[j][h] == 1){
                text = "il reste une place";
            }
            break;
        case 2:
            text = "Foyer fermé"
            bouton[j][h].className="ferme"
            break;
        case 3:
            text = text + "(pas de désinscriptions possible)";
            break;
        case 4:
            text = text + "(pas d'inscriptions possible)";
            bouton[j][h].className="ferme"
            break;
        case 5:
            text = "ouvert mais plus d'inscriptions/désinscriptions possibles";
            break;
        case 6:
            text = "vacances"

    }
    if(inscrit[j][h]){
        bouton[j][h].className="inscrit"
    }
    bouton[j][h].innerHTML = text;
}

function select(j,h){
    refreshDatabase();
    setTimeout(function() {
        console.log(places[j][h])
        let inscription = false;
    let desinscription = false;
    switch (ouvert[j][h]){
        case 1:
        case 3:
            inscription = true;
    }
    switch(ouvert[j][h]){
        case 1:
        case 4:
            desinscription = true;     
    }
    if(inscrit[j][h] && desinscription){
        database.ref(path(j,h) + "/demandes/" + user).remove();
        reload();
    }else if(nbFois < 1 && places[j][h] > 0 && inscription){
        database.ref(path(j,h) + "/demandes/" + user + "/carte").set(12345);
        reload();
    }  
      }, 1000);
    
    
}

function reload(){
    window.location.reload(true)
}

function path(j,h){
    return "foyer_midi/semaine51/" + (j+1) + jour[j] + "/" + (11 + h) + "h"
}
