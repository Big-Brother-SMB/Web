console.log(document.cookie)
console.log(cookie)

console.log("read : " + readCookie("user"))

/*if (existCookie("user")){
    console.log("user exist")
}else{
    //deco()
}*/



if(user == null || String(user).length < 5){
    deco()
}
if(classe == null){
    deco()
}

//temporaire
if(listClasse.indexOf(classe) == -1){
    database.ref("users/" + user + "/classe").remove()
    delCookie("classe");
    setTimeout(function() {
        deco()
    },2000);
    
}

console.log("lenght : " +String(user).length)
console.log(user);
console.log("classe : " + classe);

document.getElementById("user").innerHTML = user + " " + classe


database.ref("users/" + user + "/score").once("value", function(snapshot) {
    if(snapshot.val() == null){
        deco()
    }
})
database.ref("users/" + user + "/email").once("value", function(snapshot) {
    if(snapshot.val() == null){
        deco()
    }
})


database.ref("banderole").once("value", function(snapshot) {
    let msg = snapshot.val()
    if(msg != null){
        document.getElementById("banderole").innerHTML = msg
        if (msg.length > 0){
            document.getElementById("banderole").style.animation= "defilement-rtl " + msg.length/10 + "s infinite linear"

        }
    }
    
    
})









document.getElementById("pass").addEventListener("click", function() {
    window.location.href = "../pass/pass.html";
});

/*document.getElementById("groupe").addEventListener("click", function() {
    window.location.href = "../groupe/groupe.html";
});*/

document.getElementById("amis").addEventListener("click", function() {
    window.location.href = "../amis/amis.html";
});



//(new Date()).getWeek();
console.log("week : " + week)
console.log(actualWeek)

document.getElementById("semainePrecedente").addEventListener("click", function() {
    week = week - 1
    writeCookie("week",week)
    refreshDatabase()
});

document.getElementById("semaineActuelle").addEventListener("click", function() {
    week = actualWeek
    writeCookie("week",week)
    refreshDatabase()
});


document.getElementById("semaineSuivante").addEventListener("click", function() {
    week = week + 1
    writeCookie("week",week)
    refreshDatabase()
});


const body = document.getElementById("body");
Date.prototype.getWeek = function() {
    console.log(this)
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 0) / 7);
}





let bouton = [];
let total = [];
let demandes = [];
let demande = []
let places = [];

let ouvert = []
let nbAmis = []

let inscrits = [];
let inscrit = []

for(let j = 0; j < 4; j++){
    let div = document.createElement("div")
    let text = document.createElement("button")
    text.className = "jours";
    text.innerHTML = day[j]
    div.appendChild(text);
    
    bouton[j] = []
    total[j] = []
    places[j] = []
    
    nbAmis[j] = []
    demandes[j] = []
    demande[j] = [false,false]

    inscrits[j] = []
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

    database.ref("users/" + user + "/score").once('value').then(function(snapshot) {
        document.getElementById("score").innerHTML = snapshot.val()+" pts"
    });

    let sn = ["31 janvier au 4 février","7 au 11 févier","14 au 18 févier","21 au 25 févier","28 au 4 mars","7 au 11 mars","14 au 18 mars","21 au 25 mars","28 au 1 avril","4 au 8 avril","11 au 15 avril"]

    let text = "Semaine " + week + " du " + sn[week-actualWeek] 
    if(week == actualWeek){
        text = "Cette semaine"
    }
    document.getElementById("semaine").innerHTML = text 

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

            nbAmis[j][h] = 0

            database.ref(path(j,h) + "/users/" + user + "/amis").once("value", function(snapshot) {
                snapshot.forEach(function(child) {
                    nbAmis[j][h] = nbAmis[j][h] + 1
                    update(j, h);
                });
            });

            //demande en cours
         
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

            demande[j][h] = false;
            
      
            database.ref(path(j,h) + "/demandes").once("value", function(snapshot) {
                snapshot.forEach(function(child) {
                    if(child.key == user){
                        nbFois++;
                        demande[j][h] = true;
                    }    
                });
            });


            //inscrits

            inscrits[j][h] = 0
      
            /*database.ref(path(j,h)).once('child_added').then(function(snapshot) {
                if(snapshot.numChildren() >= 0){
                    demandes[j][h] = snapshot.numChildren();
                    update(j, h);
                }
            });*/
            database.ref(path(j,h) + "/inscrits").once("value", function(snapshot) {
                snapshot.forEach(function(child) {
                    inscrits[j][h] = inscrits[j][h] + 1
                    update(j, h);
                });
            });

            inscrit[j][h] = false;
            
      
            database.ref(path(j,h) + "/inscrits").once("value", function(snapshot) {
                snapshot.forEach(function(child) {
                    if(child.key == user){
                        nbFois++;
                        inscrit[j][h] = true;
                    }    
                });
            });

        
        }
    }

    //get utilisation time
    /*database.ref("users/" + user + "/time").once("value", function(snapshot) {
        let time = snapshot.val()
        if(time == null){
            time = "0"
        }
        database.ref("users/" + user + "/time").set(time + 1)
    });*/

}


function update(j,h){
    places[j][h] = total[j][h] - inscrits[j][h];
    setTimeout(updateAffichage(j,h),1000);
}

function updateAffichage(j,h){
    let text;
    if(places[j][h] <= 0){
        text = "Plein";
    }else if(places[j][h] == 1){
        text = "Il reste une place";
    }else{
        text = "Il reste " + places[j][h] + " places";
    }
              
    switch (ouvert[j][h]){
        case 0:
            text = "Horaire non planifié"
            bouton[j][h].className="ferme"
            break;
        case 1:
            if(places[j][h] <= 0){
                bouton[j][h].className="zero"
                text = "Plein";
            }else{
                bouton[j][h].className="places"
                if(places[j][h] == 1){
                    text = "Il reste une place";
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
            text = "Ouvert (changements bloqués)";
            bouton[j][h].className="ferme"
            break;
        case 6:
            text = "Vacances"
            bouton[j][h].className="ferme"
            break;
        case 7:
            bouton[j][h].className="places"
            
            text = demandes[j][h] + " demandes pour " + places[j][h] + " places"
            break;
        case 8:
            text = "Calcul en cours"
            bouton[j][h].className="ferme"
            break;
        case 9:
                text = "Fini"
                bouton[j][h].className="ferme"
                break;

    }
    if(demande[j][h]){
        bouton[j][h].className="inscrit"
        if (nbAmis[j][h] == 0){
            text = "Demande enregistrée sans amis"
        }
        else if (nbAmis[j][h]==1){
            text = "Demande enregistrée avec 1 ami"
        }
        else {
            text = "Demande enregistrée avec " + nbAmis[j][h] + " amis"
        }
        
    }

    if(inscrit[j][h]){
        bouton[j][h].className="inscrit"
        if (nbAmis[j][h] == 0){
            text = text + "<br>Vous êtes inscrit"
        }
        else if (nbAmis[j][h]==1){
            text = text + "<br>Vous êtes inscrit avec 1 ami"
        }
        else {
            text = text + "<br>Vous êtes inscrit avec " + nbAmis[j][h] + " amis"
        }
        
    }
    bouton[j][h].innerHTML = text;
}

function select(j,h){
    sessionStorage.setItem("j", j);
        sessionStorage.setItem("h", h);
    if(demande[j][h]){
        window.location.href = "../confirmation/modifier/modifier.html";
    }else{
        if(ouvert[j][h] ==7 && nbFois < 1){
            window.location.href = "../confirmation/demande/demande.html";
        }
    }
    
    


    /*console.log(places[j][h])
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
    if(demande[j][h] && desinscription){
        //database.ref(path(j,h) + "/demandes/" + user).remove();
        //reload();
        sessionStorage.setItem("j", j);
        sessionStorage.setItem("h", h);
        //window.location.href = "../confirmation/desinscription/desinscription.html";
        window.location.href = "../confirmation/modifier/modifier.html";

    }else if(nbFois < 1 && placesRestantes > 0 && inscription){
        //database.ref(path(j,h) + "/demandes/" + user + "/carte").set(12345);
        //reload();
        sessionStorage.setItem("j", j);
        sessionStorage.setItem("h", h);
        //window.location.href = "../confirmation/inscription/inscription.html";
        window.location.href = "../confirmation/demande/demande.html";
    }*/
     
}


function path(j,h){
    return "foyer_midi/semaine"+ week + "/" + dayNum[j] + "/" + (11 + h) + "h"
}

function loop(){
    console.log("update database")
    refreshDatabase();
    setTimeout(loop,5000);
}
loop();
