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
function deco(){
    sessionStorage.setItem("logged", 0);
    window.location.href = "../index.html";
}
if(user == null){
    deco()
}
database.ref("users/" + user + "/score").once("value", function(snapshot) {
    if(snapshot.val() == null){
        deco()
    }
})


console.log(user);

document.getElementById("deco").addEventListener("click", function() {
    deco()
});



document.getElementById("pass").addEventListener("click", function() {
    window.location.href = "../pass/pass.html";
});

/*document.getElementById("groupe").addEventListener("click", function() {
    window.location.href = "../groupe/groupe.html";
});*/

document.getElementById("amis").addEventListener("click", function() {
    window.location.href = "../amis/amis.html";
});



let actualWeek = 2//(new Date()).getWeek();
let week = parseInt(sessionStorage.getItem("week"))
console.log(actualWeek)

document.getElementById("semainePrecedente").addEventListener("click", function() {
    sessionStorage.setItem("week", parseInt(sessionStorage.getItem("week")) - 1);
    week = week - 1
    refreshDatabase()
});

document.getElementById("semaineActuelle").addEventListener("click", function() {
    sessionStorage.setItem("week", actualWeek);
    week = actualWeek
    refreshDatabase()
});


document.getElementById("semaineSuivante").addEventListener("click", function() {
    sessionStorage.setItem("week", parseInt(sessionStorage.getItem("week")) + 1);
    week = week + 1
    refreshDatabase()
});


const body = document.getElementById("body");
const jour = ["lundi", "mardi","jeudi","vendredi"];
Date.prototype.getWeek = function() {
    console.log(this)
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 0) / 7);
}





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


let nbFois;
//refreshDatabase();
function refreshDatabase(){

    /*database.ref("groupes").once("value", function(snapshot) {
        snapshot.forEach(function(child) {
            database.ref("groupes/"+ child.key + "/members").once("value", function(snapshot) {
                let number = snapshot.numChildren();
                snapshot.forEach(function(child2) {
                    if(child2.key == user){
                        database.ref("groupes/"+ child.key + "/members/" + user).once('value').then(function(snapshot) {
                            let text = "faites parti"
                            let chef = false
                            let groupe = child.key
                            if(snapshot.val() == 1){
                                chef = true
                                text = "êtes le chef"
                            }
                            sessionStorage.setItem("chef", chef);
                            sessionStorage.setItem("groupe", groupe);
                            document.getElementById("infoGroupe").innerHTML = "vous " + text + " du groupe : " + groupe + ", qui comporte " + number + " personne(s)"
   
                        });
                    }
                });
            });
        });
    
    });*/
    let text = "numero " + week
    if(week == actualWeek){
        text = "actuelle"
    }
    document.getElementById("semaine").innerHTML = "semaine " + text

    nbFois = 0;
    for(let j = 0; j < 4; j++){
        for(let h = 0; h < 2; h++){
            total[j][h] = 0
            database.ref(path(j,h) + "/places").once('value').then(function(snapshot) {
                total[j][h] = snapshot.val();
                update(j, h);
            });
      
            ouvert[j][h] = 0
            database.ref(path(j,h) + "/ouvert").once('value').then(function(snapshot) {
                if(snapshot.val() == null){
                    ouvert[j][h] = 0
                }else{
                    ouvert[j][h] = snapshot.val()
                }
                update(j, h);
            });
         
            demandes[j][h] = 0
      
            /*database.ref(path(j,h)).once('child_added').then(function(snapshot) {
                if(snapshot.numChildren() >= 0){
                    demandes[j][h] = snapshot.numChildren();
                    update(j, h);
                }
            });*/
            database.ref(path(j,h) + "/demandes").once("value", function(snapshot) {
                snapshot.forEach(function(child) {
                    demandes[j][h] = demandes[j][h] + 1
                    update(j, h);
                });
            });

            inscrit[j][h] = false;
            
      
            database.ref(path(j,h) + "/demandes").once("value", function(snapshot) {
                snapshot.forEach(function(child) {
                    if(child.key == user){
                        nbFois++;
                        inscrit[j][h] = true;
                    }    
                });
            });
        
        }
    }
}


function update(j,h){
    places[j][h] = total[j][h] - demandes[j][h];
    setTimeout(updateAffichage(j,h),1000);
}

function updateAffichage(j,h){
    let text;
    if(places[j][h] <= 0){
        text = "plein";
    }else if(places[j][h] == 1){
        text = "il reste une place";
    }else{
        text = "il reste " + places[j][h] + " places";
    }
              
    switch (ouvert[j][h]){
        case 0:
            text = "horaire non planifié"
            bouton[j][h].className="ferme"
            break;
        case 1:
            if(places[j][h] <= 0){
                bouton[j][h].className="zero"
                text = "plein";
            }else{
                bouton[j][h].className="places"
                if(places[j][h] == 1){
                    text = "il reste une place";
                }
            }
            break;
        case 2:
            text = "Foyer fermé"
            bouton[j][h].className="ferme"
            break;
        case 3:
            text = text + "<br>(pas de désinscriptions possible)";
            bouton[j][h].className="bloque"
            break;
        case 4:
            text = text + "<br>(pas d'inscriptions possible)";
            bouton[j][h].className="ferme"
            break;
        case 5:
            text = "ouvert mais plus d'inscriptions / désinscriptions possibles";
            bouton[j][h].className="ferme"
            break;
        case 6:
            text = "vacances"
            bouton[j][h].className="ferme"
            break;
        case 7:
            if(places[j][h] <= 0){
                
            }else{
                bouton[j][h].className="places"
            }
            text = demandes[j][h] + "/" + total[j][h]
            break;

    }
    if(inscrit[j][h]){
        bouton[j][h].className="inscrit"
    }
    bouton[j][h].innerHTML = text;
}

function select(j,h){
    console.log(places[j][h])
    let inscription = false;
    let desinscription = false;
    let placesRestantes = places[j][h] > 0;
    if(ouvert[j][h] ==7){
        placesRestantes = true;
    }
    switch (ouvert[j][h]){
        case 1:
        case 3:
        case 7:
            inscription = true;
    }
    switch(ouvert[j][h]){
        case 1:
        case 4:
        case 0:
        case 6:
        case 2:
        case 7:
            desinscription = true;     
    }
    if(inscrit[j][h] && desinscription){
        //database.ref(path(j,h) + "/demandes/" + user).remove();
        //reload();
        sessionStorage.setItem("j", j);
        sessionStorage.setItem("h", h);
        window.location.href = "../confirmation/desinscription/desinscription.html";
    }else if(nbFois < 1 && placesRestantes > 0 && inscription){
        //database.ref(path(j,h) + "/demandes/" + user + "/carte").set(12345);
        //reload();
        sessionStorage.setItem("j", j);
        sessionStorage.setItem("h", h);
        window.location.href = "../confirmation/inscription/inscription.html";
    }
     
}

function reload(){
    window.location.reload(true)
}

function path(j,h){
    return "foyer_midi/semaine"+ week + "/" + (j+1) + jour[j] + "/" + (11 + h) + "h"
}

function loop(){
    refreshDatabase();

    setTimeout(loop,10000);
}
loop();
