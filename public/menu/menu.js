console.log(document.cookie)
console.log(cookie)

console.log("read : " + readCookie("user"))

/*if (existCookie("user")){
    console.log("user exist")
}else{
    //deco()
}*/







if (user == null || String(user).length < 5) {
    sessionStorage.setItem("auth err", 2);
    setTimeout(function () {
        deco()
    }, 2000);

}





console.log("lenght : " + String(user).length)
console.log(user);
console.log("classe : " + classe);

document.getElementById("user").innerHTML = user + " " + classe


/*database.ref("users/" + user + "/score").once("value", function(snapshot) {
    if(snapshot.val() == null){
        deco()
    }
})*/

database.ref("users/" + user + "/email").once("value", function (snapshot) {
    if (snapshot.val() == null) {
        deco()
    }
})









document.getElementById("pass").addEventListener("click", function () {
    window.location.href = "../pass/pass.html";
});

/*document.getElementById("groupe").addEventListener("click", function() {
    window.location.href = "../groupe/groupe.html";
});*/

document.getElementById("amis").addEventListener("click", function () {
    window.location.href = "../amis/amis.html";
});

document.getElementById("score").addEventListener("click", function () {
    window.location.href = "../score/score.html";
});

document.getElementById("planing").addEventListener("click", function () {
    window.location.href = "../perm/perm.html";
});

//(new Date()).getWeek();
console.log("week : " + week)
console.log("actual week : " + actualWeek)


function nextWeek(){
    week = week + 1
    writeCookie("week", week)
    refreshDatabase()
}
function previousWeek(){
    week = week - 1
    writeCookie("week", week)
    refreshDatabase()
}
function thisWeek(){
    week = actualWeek
    writeCookie("week", week)
    refreshDatabase()
}

document.getElementById("semainePrecedente").addEventListener("click", function () {
    previousWeek()
});


document.getElementById("semaineActuelle").addEventListener("click", function () {
    thisWeek()
});


document.getElementById("semaineSuivante").addEventListener("click", function () {
    nextWeek()
});


const body = document.getElementById("body");
Date.prototype.getWeek = function () {
    console.log(this)
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 0) / 7);
}





let bouton = [];
let placesTotal = [];
let nbDemandes = [];
let demandes = []
let demande = []
let places = [];

let ouvert = []
let cout = []
let nbAmis = []
let nbAmisDemande = []

let inscrits = [];
let inscrit = []

for (let j = 0; j < 4; j++) {
    let div = document.createElement("div")
    let text = document.createElement("button")
    text.className = "jours tableau";
    text.innerHTML = day[j]
    div.appendChild(text);

    bouton[j] = []
    placesTotal[j] = []
    places[j] = []

    nbAmis[j] = []
    nbAmisDemande[j] = []
    nbDemandes[j] = []
    demandes[j] = []
    demande[j] = [false, false]

    inscrits[j] = []
    inscrit[j] = [false, false]
    ouvert[j] = [0, 0]
    cout[j] = [1, 1]
    for (let h = 0; h < 2; h++) {
        bouton[j][h] = document.createElement("button")
        bouton[j][h].id = "" + j + h;
        bouton[j][h].onclick = function () { select(j, h) };
        bouton[j][h].className = "places tableau"
        div.appendChild(bouton[j][h]);

    }
    body.appendChild(div);

}

let nbFois;
//refreshDatabase();
function refreshDatabase() {

    let score = 0
    database.ref("users/" + user + "/score").once('value').then(function(snapshot) {
        snapshot.forEach(function(child) {
            database.ref("users/" + user + "/score/" + child.key + "/value").once('value').then(function(snapshot) {
                score += parseFloat(snapshot.val())
                score = round(score)
                if (score <2) {
                    document.getElementById("score").innerHTML = score + " pt"
                }else{
                    document.getElementById("score").innerHTML = score + " pts"
                }
            })
        })
    });

    let text = "Semaine n°" + week + " du " + semaine(week)
    if (week == actualWeek) {
        text = "Cette semaine (n°" + week + " du " + semaine(week) + ")"
    }
    document.getElementById("semaine").innerHTML = text

    database.ref("foyer_midi/semaine" + week + "/menu").once('value').then(function (snapshot) {
        let val = snapshot.val()
        if (val == null) {
            val = "inconnu pour le moment"
        }
        document.getElementById("menu semaine").innerHTML = "<u>Menu de la semaine n°" + week + " :</u><br>" + val
    });

    nbFois = 0;
    for (let j = 0; j < 4; j++) {
        for (let h = 0; h < 2; h++) {
            placesTotal[j][h] = 0
            database.ref(path(j, h) + "/places").once('value').then(function (snapshot) {
                placesTotal[j][h] = snapshot.val();
                update(j, h);
            });

            ouvert[j][h] = 0
            database.ref(path(j, h) + "/ouvert").once('value').then(function (snapshot) {
                if (snapshot.val() == null) {
                    ouvert[j][h] = 0
                } else {
                    ouvert[j][h] = snapshot.val()
                }
                update(j, h);
            });

            database.ref(path(j, h) + "/cout").once('value').then(function (snapshot) {
                if (snapshot.val() != null) {
                    cout[j][h] = Math.abs(parseFloat(snapshot.val()))
                }
                update(j, h);
            });



            //demande en cours

            nbDemandes[j][h] = 0
            demandes[j][h] = []
            demande[j][h] = false;


            database.ref(path(j, h) + "/demandes").once("value", function (snapshot) {
                snapshot.forEach(function (child) {
                    const name = child.key
                    nbDemandes[j][h] = nbDemandes[j][h] + 1
                    if (name == user) {
                        nbFois++;
                        demande[j][h] = true;
                    } else {
                        demandes[j][h].push(name)
                    }

                });
                update(j, h);
            });




            //inscrits

            inscrits[j][h] = 0
            inscrit[j][h] = false;

            database.ref(path(j, h) + "/inscrits").once("value", function (snapshot) {
                snapshot.forEach(function (child) {
                    inscrits[j][h] = inscrits[j][h] + 1
                    if (child.key == user) {
                        nbFois++;
                        inscrit[j][h] = true;
                    }
                    update(j, h);
                });
            });




            nbAmis[j][h] = 0
            nbAmisDemande[j][h] = 0

            database.ref(path(j, h) + "/users/" + user + "/amis").once("value", function (snapshot) {
                snapshot.forEach(function (child) {
                    nbAmis[j][h] = nbAmis[j][h] + 1
                    if (demandes[j][h].indexOf(child.key) != -1) {
                        nbAmisDemande[j][h]++
                    }
                    update(j, h);
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


function update(j, h) {
    places[j][h] = placesTotal[j][h] - inscrits[j][h];
    setTimeout(updateAffichage(j, h), 1000);
}

function updateAffichage(j, h) {
    let coutPourcentage = round((cout[j][h] - 1) * 100)
    let textcout = ""
    let text = "horaire non planifié";

    if(coutPourcentage != 0){

        if(coutPourcentage > 0){
            textcout += "<br><rouge>Cout en point : " + "+" + coutPourcentage + "%</rouge>"
        }else{
            textcout = "<br><vert>Cout en point : " + coutPourcentage + "%</vert>"
        }


    }

    switch (ouvert[j][h]) {
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
            if (places[j][h] <= 0) {
                bouton[j][h].className = "zero tableau"
                text = "Plein";
            } else {
                bouton[j][h].className = "places tableau"
                text = nbDemandes[j][h] + " demandes pour " + places[j][h] + " places" + textcout
            }
            break;
        case 3:
            bouton[j][h].className="bloque tableau"
            if (places[j][h] <= 0) {
                text = "Plein";
            } else {
                text = nbDemandes[j][h] + " demandes pour " + places[j][h] + " places" + textcout
            }
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
            break;
    }
    if(ouvert[j][h]===2 || ouvert[j][h]===3){
        if (demande[j][h]) {
            bouton[j][h].className = "demande tableau"
            if (nbAmis[j][h] == 0) {
                text = "Demande enregistrée sans amis"
            }
            else if (nbAmis[j][h] == 1) {
                text = "Demande enregistrée avec 1 ami<br>"
                if (nbAmisDemande[j][h] == 0) {
                    text += "qui n'a pas fait de demande"
                } else {
                    text += "qui a fait une demande"
                }
            }
            else {
                text = "Demande enregistrée avec " + nbAmis[j][h] + " amis<br>"
                if (nbAmisDemande[j][h] == 0) {
                    text += "qui n'ont pas fait de demandes"
                } else if (nbAmis[j][h] == nbAmisDemande[j][h]) {
                    text += "qui ont tous fait une demande"
                } else if (nbAmisDemande[j][h] == 1) {
                    text += "dont un seul a fait une demande"
                } else {
                    text += "dont " + nbAmisDemande[j][h] + " ont fait une demande"
                }

            }

        }

        if (inscrit[j][h]) {
            bouton[j][h].className = "inscrit tableau"
            if (nbAmis[j][h] == 0) {
                text = text + "<br>Vous êtes inscrit"
            }
            else if (nbAmis[j][h] == 1) {
                text = text + "<br>Vous êtes inscrit avec 1 ami"
            }
            else {
                text = text + "<br>Vous êtes inscrit avec " + nbAmis[j][h] + " amis"
            }

        }
    }
    bouton[j][h].innerHTML = text;
}

function select(j, h) {
    sessionStorage.setItem("j", j);
    sessionStorage.setItem("h", h);
    writeCookie("jour", j)
    writeCookie("heure", h)
    const hInv = h==0?1:0
    if (demande[j][h]) {
        window.location.href = "../confirmation/modifier/modifier.html";
    } else {
        if (ouvert[j][h] == 2 && !demande[j][hInv] && !inscrit[j][hInv] && !inscrit[j][h]) { //verrou : nbFois < 1
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




/*function path(j,h){
    return "foyer_midi/semaine"+ week + "/" + dayNum[j] + "/" + (11 + h) + "h"
}*/

function loop() {
    console.log("update database")
    refreshDatabase();
    setTimeout(loop, 20000);
}
loop();



//-----------sondages--------------------
const notifMsg = document.getElementById("notif msg")

let nbMsg = 0
database.ref("sondages").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        database.ref("sondages/" + child.key + "/users/" + user).once('value').then(function(snapshot) {
            if(snapshot.val() == null){
                nbMsg++
                updateMsg()
            }
        })
    })
})

database.ref("news").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        database.ref("news/" + child.key + "/users/" + user).once('value').then(function(snapshot) {
            if(snapshot.val() == null){
                nbMsg++
                updateMsg()
            }
        })
    })
})

database.ref("users/" + user + "/messages").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        database.ref("users/" + user + "/messages/" + child.key + "/lu").once('value').then(function(snapshot) {
            if(snapshot.val() == null){
                nbMsg++
                updateMsg()
            }
        })
    })
})


function updateMsg(){
    notifMsg.style.visibility = "visible"
    notifMsg.innerHTML = nbMsg
}














document.getElementById("semaine").addEventListener('touchstart', handleTouchStart, false);
document.getElementById("semaine").addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
};

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {//most significant
        if ( xDiff > 0 ) {
            // right swipe
            nextWeek()
        } else {
            previousWeek()
            // left swipe
        }
    } else {
        if ( yDiff > 0 ) {
            // down swipe
            //window.location.href = "../pass/pass.html";
        } else {
            // up swipe
        }
    }
    // reset values
    xDown = null;
    yDown = null;
};




document.getElementById("logo").addEventListener("click",function(){
    document.querySelectorAll("nav")[0].style.visibility = "visible"
})

document.getElementById("nav hide").addEventListener("click",function(){
    document.querySelectorAll("nav")[0].style.visibility = "hidden"
})
