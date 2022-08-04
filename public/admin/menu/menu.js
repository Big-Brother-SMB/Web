//window.location.href = "../index.html";

//(new Date()).getWeek();


document.getElementById("planing").addEventListener("click", function () {
    window.location.href = "../perm/menu/menuPerm.html";
});


document.getElementById("semainePrecedente").addEventListener("click", function() {
    sessionStorage.setItem("week", parseInt(sessionStorage.getItem("week")) - 1);
    week = week - 1
    writeCookie("week",week)
    refreshDatabase()
});

document.getElementById("semaineActuelle").addEventListener("click", function() {
    sessionStorage.setItem("week", actualWeek);
    week = actualWeek
    writeCookie("week",week)
    refreshDatabase()
});


document.getElementById("semaineSuivante").addEventListener("click", function() {
    sessionStorage.setItem("week", parseInt(sessionStorage.getItem("week")) + 1);
    week = week + 1
    writeCookie("week",week)
    refreshDatabase()
});

document.getElementById("add point").addEventListener("click",function(){
	var nbpts=prompt("Nombre de point(s) à ajouter :","1")
    if (nbpts!==null){
        var nomgain=prompt("Nom du gain :", "gain de la semaine" + actualWeek)
        if (nomgain!==null){
      	    var conf=prompt("Vous etes sur le point d'ajouter " + nbpts + " point(s) à tous les eleves. Taper OUI pour poursuivre.","NON")
        }
    }
	let hashCode= hash()
    let nb=0
    console.log(conf)
	if (conf==="OUI"){
        console.log("ok")
	    database.ref("users").once("value", function(snapshot) {
            let total = snapshot.numChildren()
            console.log("nb total : " + total)
            snapshot.forEach(function(child) {
                let name = child.key
                database.ref("users/" + name + "/score/" + hashCode + "/name").set(nomgain)
                database.ref("users/" + name + "/score/" + hashCode + "/value").set(parseInt(nbpts))
                nb++
                if(nb == total){
                    alert("Ajout de points effectués")
                }
            })
        })
    }
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
let places = [];
let inscrits = []
let ouvert = []
let nbAmis = []


for(let j = 0; j < 4; j++){
    let div = document.createElement("div")
    let text = document.createElement("button")
    text.className = "jours tableau";
    text.innerHTML = day[j]
    div.appendChild(text);

    bouton[j] = []
    total[j] = []
    places[j] = []
    demandes[j] = []
    nbAmis[j] = []
    inscrits[j] = []
    ouvert[j] = [0,0]
    for(let h = 0; h < 2; h++){
        bouton[j][h] = document.createElement("button")
        bouton[j][h].id = "" + j + h;
        bouton[j][h].onclick = function(){select(j,h)};
        bouton[j][h].className="places tableau"
        div.appendChild(bouton[j][h]);

    }
    body.appendChild(div);

}


let nbFois;
//refreshDatabase();
function refreshDatabase(){

    database.ref("foyer_midi/semaine" + week + "/menu").once('value').then(function (snapshot) {
        let val = snapshot.val()
        if (val == null) {
            val = "inconnu pour le moment"
        }
        document.getElementById("menu semaine").innerHTML = "<u>Menu de la semaine n°" + week + " :</u><br>" + val
    });

    let text = "Semaine n°" + week + " du " + semaine(week)
    if (week == actualWeek) {
        text = "Cette semaine (n°" + week + " du " + semaine(week) + ")"
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


            demandes[j][h] = 0

            database.ref(path(j,h) + "/demandes").once("value", function(snapshot) {
                snapshot.forEach(function(child) {
                    demandes[j][h] = demandes[j][h] + 1
                    update(j, h);
                });
            });

            inscrits[j][h] = 0

            database.ref(path(j,h) + "/inscrits").once("value", function(snapshot) {
                snapshot.forEach(function(child) {
                    inscrits[j][h] = inscrits[j][h] + 1
                    update(j, h);
                });
            });


        }
    }
}


function update(j,h){

    places[j][h] = total[j][h] - inscrits[j][h];
    setTimeout(updateAffichage(j,h),1000);
}

function updateAffichage(j,h){
    let text;
    switch (ouvert[j][h]){
        case 0:
            text = "horaire non planifié"
            bouton[j][h].className="ferme tableau"
            break;
        case 1:
            text = "ouvert à tous";
            bouton[j][h].className="inscrit tableau"
            break;
        case 2:
            bouton[j][h].className = "places tableau"
            text = inscrits[j][h]+" inscrits/"+total[j][h]  + " places"
            if(inscrits[j][h]>=total[j][h]){
                text+="<rouge></br>PLEIN</rouge>"
            }
            text+="</br>("+demandes[j][h]+" demandes pour " + places[j][h] + " places restantes)"
            break;
        case 3:
            bouton[j][h].className="bloque tableau"
            text = inscrits[j][h]+" inscrits/"+total[j][h]  + " places"
            if(inscrits[j][h]>=total[j][h]){
                text+="<rouge></br>PLEIN</rouge>"
            }
            text+="</br>("+demandes[j][h]+" demandes pour " + places[j][h] + " places restantes)"
            break;
        case 4:
            text = "Foyer fermé"
            bouton[j][h].className="zero tableau"
            break;
        case 5:
            text = "Fini"
            bouton[j][h].className="zero tableau"
            break;
        case 6:
            text = "Vacances"
            bouton[j][h].className="ferme tableau"
            break;/*
        case 1:
            if(places[j][h] <= 0){
                bouton[j][h].className="zero tableau"
                text = "plein";
            }else{
                bouton[j][h].className="places tableau"
                if(places[j][h] == 1){
                    text = "il reste une place";
                }
            }
            break;
        case 3:
            text = text + "<br>(pas de désinscriptions possible)";
            bouton[j][h].className="bloque tableau"
            break;
        case 4:
            text = text + "<br>(pas d'inscriptions possible)";
            bouton[j][h].className="ferme tableau"
            break;*/
    }
    bouton[j][h].innerHTML = text;
}

function select(j,h){

    sessionStorage.setItem("j", j);
    sessionStorage.setItem("h", h);
    window.location.href = "../crenau/crenau.html";
}

function reload(){
    window.location.reload(true)
}


function loop(){
    refreshDatabase();

    setTimeout(loop,10000);
}
loop();

database.ref("banderole").once("value", function (snapshot) {
    let msg = snapshot.val()
    if (msg != null) {
        document.getElementById("banderole").innerHTML = msg
        if (msg.length > 0) {
            document.getElementById("banderole").style.animation = "defilement-rtl 10s infinite linear"

        }
    }


})

function clickBanderole(){
    database.ref("banderole").once("value", function(snapshot) {
        let p=window.prompt("Message de la banderole:",snapshot.val());
        if (p!=null){
            database.ref("banderole").set(p);
            document.getElementById("banderole").innerHTML = p
        }
    })
}

database.ref("foyer_midi/semaine" + week + "/menu").once('value').then(function (snapshot) {
    let val = snapshot.val()
    if (val == null) {
        val = "inconnu pour le moment"
    }
    document.getElementById("menu semaine").innerHTML = "<u>Menu de la semaine n°" + week + " :</u><br>" + val
});

function clickMenu(){
    database.ref("foyer_midi/semaine" + week + "/menu").once("value", function(snapshot) {
        let p=snapshot.val()
        if (p==null || p=="" || p=="null"){
            p = "inconnu pour le moment"
        }
        p=window.prompt("Menu de la semaine "+week+":",p);
        if (p==null){
            p=snapshot.val()
        }
        if (p==null || p=="" || p=="null"){
            p = "inconnu pour le moment"
        }
        database.ref("foyer_midi/semaine" + week + "/menu").set(p);
        document.getElementById("menu semaine").innerHTML = "<u>Menu de la semaine n°" + week + " :</u><br>" + p
    })
}

//-----------sondages--------------------
const notifMsg = document.getElementById("notif msg")

let nbMsg = 0
database.ref("messages/").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        let user = child.key
        database.ref("messages/" + user).once('value').then(function(snapshot) {
            snapshot.forEach(function(child) {
                let h = child.key
                database.ref("messages/" + user + "/" + h + "/lu").once('value').then(function(snapshot) {
                    let lu = snapshot.val()
                    if (lu!=true) {
                        nbMsg++
                        updateMsg()
                    }
                })
            })
        })
    })
})


function updateMsg(){
    notifMsg.style.visibility = "visible"
    notifMsg.innerHTML = nbMsg
}
