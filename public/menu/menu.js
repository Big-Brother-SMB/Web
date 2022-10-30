// il reste les pop-up à faire
import * as common from "../common.js";

document.getElementById("pass").addEventListener("click", function () {
    window.location.href = "../pass/pass.html";
});

document.getElementById("amis").addEventListener("click", function () {
    window.location.href = "../amis/amis.html";
});

document.getElementById("score").addEventListener("click", function () {
    window.location.href = "../score/score.html";
});

document.getElementById("planing").addEventListener("click", function () {
    window.location.href = "../perm/perm.html";
});


document.getElementById("user").innerHTML = common.first_name + " " + common.last_name + " " + common.classe


let week = common.week
document.getElementById("semainePrecedente").addEventListener("click", function () {
    week--
    common.writeCookie("week", week)
    refreshDatabase()
});


document.getElementById("semaineActuelle").addEventListener("click", function () {
    week = common.actualWeek
    common.writeCookie("week", week)
    refreshDatabase()
});


document.getElementById("semaineSuivante").addEventListener("click", function () {
    week++
    common.writeCookie("week", week)
    refreshDatabase()
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
    text.innerHTML = common.day[j]
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


async function refreshDatabase() {
    let info_menu = await common.socketAsync("info_menu_semaine",week)
    let score = await common.socketAsync("my_score","int")

    if (score < 2) {
        document.getElementById("score").innerHTML = score + " pt"
    }else{
        document.getElementById("score").innerHTML = score + " pts"
    }
    
    if (week == common.actualWeek) {
        document.getElementById("semaine").innerHTML = "Cette semaine (n°" + week + " du " + common.semaine(week) + ")"
    } else {
        document.getElementById("semaine").innerHTML = "Semaine n°" + week + " du " + common.semaine(week)
    }

    let menu
    try{
        menu = info_menu["menu"]
    }catch(e){}
    if (menu == null) {
        menu = "inconnu pour le moment"
    }
    document.getElementById("menu semaine").innerHTML = "<u>Menu de la semaine n°" + week + " :</u><br>" + menu


    for (let j = 0; j < 4; j++) {
        for (let h = 0; h < 2; h++) {
            let info_horaire = await common.socketAsync("info_horaire",[week,j,h])
            placesTotal[j][h] = info_horaire["places"];
            if(placesTotal[j][h]==null || placesTotal[j][h]==""){
                placesTotal[j][h]=0
            }

            if (info_horaire.ouvert == null) {
                ouvert[j][h] = 0
            } else {
                ouvert[j][h] = info_horaire.ouvert
            }

            if (info_horaire.cout != null) {
                cout[j][h] = Math.abs(parseFloat(info_horaire.cout))
            }

            //demande en cours

            nbDemandes[j][h] = 0
            demandes[j][h] = []
            demande[j][h] = false;

            for(let e in info_horaire.list_demande){
                nbDemandes[j][h]++
                if (e == common.uuid) {
                    demande[j][h] = true;
                } else {
                    demandes[j][h].push(e)
                }
            };

            //inscrits

            nbInscrits[j][h] = 0
            inscrits[j][h] = []
            inscrit[j][h] = false;


            for(let e in info_horaire.list_demande){
                nbInscrits[j][h]++
                if (e == common.uuid) {
                    inscrit[j][h] = true;
                } else {
                    inscrits[j][h].push(e)
                }
            };


            nbAmis[j][h] = 0
            nbAmisDemande[j][h] = 0
            nbAmisInscrit[j][h] = 0

            for(let e in info_horaire.amis){
                nbAmis[j][h]++
                if (demandes[j][h].indexOf(child.key) != -1) {
                    nbAmisDemande[j][h]++
                }
                if (inscrits[j][h].indexOf(child.key) != -1) {
                    nbAmisInscrit[j][h]++
                }
            }
            update(j, h);
        }
    }
}


function update(j, h) {
    places[j][h] = placesTotal[j][h] - nbInscrits[j][h];
    let coutPourcentage = common.round((cout[j][h] - 1) * 100)
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
            text += " avec 1 ami"
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
                    text += " dont " + nbAmisInscrit[j][h] + " ont été inscrits"
                }
            }
        }
    }
    bouton[j][h].innerHTML = text;
}

function select(j, h) {
    const hInv = h==0?1:0
    if (ouvert[j][h] == 2 && demande[j][h]) {
        window.location.href = "../confirmation/modifier/modifier.html?j="+j+"&h="+h;
    }else if(ouvert[j][h] == 2 && !demande[j][hInv] && !inscrit[j][hInv] && !inscrit[j][h]){
        window.location.href = "../confirmation/demande/demande.html?j="+j+"&h="+h;
    }else if((ouvert[j][h] == 2 || ouvert[j][h] == 3) && inscrit[j][h]){
        window.location.href = "../confirmation/inscrit/inscrit.html?j="+j+"&h="+h;
    }
}


refreshDatabase();
/*function loop() {
    console.log("update database")
    refreshDatabase();
    setTimeout(loop, 20000);
}
loop();*/


/*
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
*/

//-------------------------------Pop-Up------------messagerie---------------------------------

const overlay = document.getElementById('overlay')

function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active')
  overlay.classList.add('active')
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
}

if(common.tuto != true){
    openModal(modal)
} else {
    /*database.ref("sondages").once('value').then(function(snapshotS) {
        database.ref("news").once('value').then(function(snapshotN) {
            database.ref("users/" + user + "/messages").once('value').then(function(snapshotM) {
                snapshotS.forEach(function(child) {
                    if(snapshotS.child(child.key + "/users/" + user).val() == null){
                        nbMsg++
                    }
                })
                snapshotN.forEach(function(child) {
                    if(snapshotN.child(child.key + "/users/" + user).val() == null){
                        nbMsg++
                    }
                })
                snapshotM.forEach(function(child) {
                    if(snapshotM.child(child.key + "/lu").val() == null){
                        nbMsg++
                    }
                })
                if(nbMsg!=0){
                    updateMsg()
                }
            })
        })
    })*/
}



const notifMsg = document.getElementById("notif msg")

let nbMsg = 0
function updateMsg(){
    notifMsg.style.visibility = "visible"
    notifMsg.innerHTML = nbMsg
    let msg=readCookie("msg")
    let hD=hashDay()
    if(msg!=hD){
        const modal = document.getElementById('modal')
        document.getElementById("modal-title").innerHTML="<b>Messagerie</b>"
        document.getElementById("modal-body").innerHTML="Vous avez des messages non lu."
        document.getElementById("modal-option").innerHTML="<button id=\"option-droite\" onclick=\"bntMsgOnclick()\" style=\"text-decoration : none; color :black;\">Messagerie</button>"
        openModal(modal)
    }
}

function bntMsgOnclick(){
    common.writeCookie("msg",hashDay())
    window.location.href ="../message/message.html"
}


document.getElementById("bSelf").addEventListener("click",function(){
    document.getElementById("menu self").style.visibility="visible"
    document.getElementById("menu self").style.height="auto"
    document.getElementById("menu self").style.margin="30px"
    document.getElementById("menu self").innerHTML = "&darr;&darr;&darr;<br><br><br>Menu self:<br><iframe src='https://drive.google.com/file/d/1ymF5Q53oe9ugwPFpjCg0Uwj0SaYbem5L/preview' style='width: 90%;height: 600px;' allow='autoplay'></iframe>"
    window.location.href = "#menu self"
})