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
let nbAmisInscrit = []

let nbInscrits = []
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
    nbAmisInscrit[j] = []
    nbDemandes[j] = []
    demandes[j] = []
    demande[j] = [false, false]

    nbInscrits[j] = []
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

//refreshDatabase();
function refreshDatabase() {
    database.ref("foyer_midi/semaine" + week + "/menu").once('value').then(function (snapshotM) {
        database.ref("users/" + user + "/score").once('value').then(function(snapshotS) {
            let score = 0
            snapshotS.forEach(function(child) {
                score += parseFloat(snapshotS.child(child.key + "/value").val())
                score = round(score)
                if (score < 2) {
                    document.getElementById("score").innerHTML = score + " pt"
                }else{
                    document.getElementById("score").innerHTML = score + " pts"
                }
            })
            let text = "Semaine n°" + week + " du " + semaine(week)
            if (week == actualWeek) {
                text = "Cette semaine (n°" + week + " du " + semaine(week) + ")"
            }
            document.getElementById("semaine").innerHTML = text
    
            let val = snapshotM.val()
            if (val == null) {
                val = "inconnu pour le moment"
            }
            document.getElementById("menu semaine").innerHTML = "<u>Menu de la semaine n°" + week + " :</u><br>" + val
        

            for (let j = 0; j < 4; j++) {
                for (let h = 0; h < 2; h++) {
                    database.ref(path(j, h)).once('value').then(function (snapshotP) {
                        placesTotal[j][h] = snapshotP.child("places").val();

                        if (snapshotP.child("ouvert").val() == null) {
                            ouvert[j][h] = 0
                        } else {
                            ouvert[j][h] = snapshotP.child("ouvert").val()
                        }
    
                        if (snapshotP.child("cout").val() != null) {
                            cout[j][h] = Math.abs(parseFloat(snapshotP.child("cout").val()))
                        }
            
                        //demande en cours
            
                        nbDemandes[j][h] = 0
                        demandes[j][h] = []
                        demande[j][h] = false;
            
                        snapshotP.child("demandes").forEach(function (child) {
                            const name = child.key
                            nbDemandes[j][h]++
                            if (name == user) {
                                demande[j][h] = true;
                            } else {
                                demandes[j][h].push(name)
                            }
                        });
            
                        //inscrits
            
                        nbInscrits[j][h] = 0
                        inscrits[j][h] = []
                        inscrit[j][h] = false;
            
                        snapshotP.child("inscrits").forEach(function (child) {
                            const name = child.key
                            nbInscrits[j][h]++
                            if (name == user) {
                                inscrit[j][h] = true;
                            } else {
                                inscrits[j][h].push(name)
                            }
                        });
            
            
                        nbAmis[j][h] = 0
                        nbAmisDemande[j][h] = 0
                        nbAmisInscrit[j][h] = 0
            
                        snapshotP.child("/demandes/" + user + "/amis").forEach(function (child) {
                            nbAmis[j][h]++
                            if (demandes[j][h].indexOf(child.key) != -1) {
                                nbAmisDemande[j][h]++
                            }
                            if (inscrits[j][h].indexOf(child.key) != -1) {
                                nbAmisInscrit[j][h]++
                            }
                        });
                        snapshotP.child("/inscrits/" + user + "/amis").forEach(function (child) {
                            nbAmis[j][h]++
                            if (demandes[j][h].indexOf(child.key) != -1) {
                                nbAmisDemande[j][h]++
                            }
                            if (inscrits[j][h].indexOf(child.key) != -1) {
                                nbAmisInscrit[j][h]++
                            }
                        });
                        update(j, h);
                    })
                }
            }
        });
    });
}


function update(j, h) {
    places[j][h] = placesTotal[j][h] - nbInscrits[j][h];
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
                text = "Plein"+ textcout;
            } else {
                bouton[j][h].className = "places tableau"
                text = nbDemandes[j][h] + " demandes pour " + places[j][h] + " places" + textcout
            }
            break;
        case 3:
            bouton[j][h].className="bloque tableau"
            if (places[j][h] <= 0) {
                text = "Plein"+ textcout;
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
        if (inscrit[j][h]) {
            bouton[j][h].className = "inscrit tableau"
            text = "Vous êtes inscrit"
        } else if (demande[j][h]) {
            bouton[j][h].className = "demande tableau"
            text = "Demande enregistrée"
        }

        if (nbAmis[j][h] == 1) {
            text += "avec 1 ami"
            if (nbAmisDemande[j][h] == 1) {
                text += " qui a fait une demande"
            } else if (nbAmisInscrit[j][h] == 1) {
                text += " qui a été inscrit"
            }else{
                text += " qui n'a pas fait de demande"
            }
        } else if (nbAmis[j][h] > 1) {
            text += " avec " + nbAmis[j][h] + " amis"
            if(nbAmis[j][h] == nbAmisDemande[j][h]){
                text += " qui ont tous fait une demande"
            }else if(nbAmis[j][h] == nbAmisInscrit[j][h]){
                text += " qui ont tous été inscrit"
            }else if(0 == nbAmisDemande[j][h] && 0 == nbAmisInscrit[j][h]){
                text += " qui n'ont pas fait de demandes"
            }else {
                if (nbAmisDemande[j][h] == 1) {
                    text += " dont un seul a fait une demande"
                } else if(nbAmisDemande[j][h]>1){
                    text += " dont " + nbAmisDemande[j][h] + " ont fait une demande"
                }
                if(nbAmisDemande[j][h] != 0 && nbAmisInscrit[j][h] != 0){
                    text += " et"
                }
                if (nbAmisInscrit[j][h] == 1) {
                    text += " dont un seul a été inscrit"
                } else if(nbAmisInscrit[j][h]>1){
                    text += " dont " + nbAmisInscrit[j][h] + " ont fait une demande"
                }
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
        if (ouvert[j][h] == 2 && !demande[j][hInv] && !inscrit[j][hInv] && !inscrit[j][h]) {
            window.location.href = "../confirmation/demande/demande.html";
        }
    }
}



function loop() {
    console.log("update database")
    refreshDatabase();
    setTimeout(loop, 20000);
}
loop();



//-----------messagerie--------------------
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




/*document.getElementById("logo").addEventListener("click",function(){
    document.querySelectorAll("nav")[0].style.visibility = "visible"
})

document.getElementById("nav hide").addEventListener("click",function(){
    document.querySelectorAll("nav")[0].style.visibility = "hidden"
})*/
