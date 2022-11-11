import * as common from "../../common.js";

document.getElementById("planing").addEventListener("click", function () {
    window.location.href = "../perm/menu/menuPerm.html";
});


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

document.getElementById("add point").addEventListener("click",async function(){
	var nbpts=prompt("Nombre de point(s) à ajouter :","1")
    nbpts = parseFloat(nbpts.replaceAll(",","."))
    let nomgain
    let conf
    if (nbpts!==null && !isNaN(nbpts)){
        nomgain=prompt("Nom du gain :", "gain de la semaine " + common.actualWeek)
        if (nomgain!==null){
      	    conf=prompt("Vous etes sur le point d'ajouter " + nbpts + " point(s) à tous les eleves. Taper OUI pour poursuivre.","NON")
        }
    }
	if (conf==="OUI"){
        await common.socketAdminAsync("add_global_point",[common.hashHour(),nomgain,nbpts])
        if(nomgain=="gain de la semaine " + common.actualWeek) document.getElementById("notif plus").style.visibility = "hidden"
        alert("Ajout de points effectués")
    }
});



let global_points = await common.socketAdminAsync("get_global_point",null)
let test=true
global_points.forEach(e => {
    if("gain de la semaine " + common.actualWeek==e.name){
        test=false
    }
})
if(test){
    document.getElementById("notif plus").style.visibility = "visible"
}



const body = document.getElementById("body");
Date.prototype.getWeek = function() {
    console.log(this)
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 0) / 7);
}


let info_menu = await common.socketAsync("info_menu_semaine",week)
let val = info_menu.menu
if (val == null) {
    val = "inconnu pour le moment"
}
document.getElementById("menu semaine").innerHTML = "<u>Menu de la semaine n°" + week + " :</u><br>" + val


let banderole = await common.socketAsync("banderole",null)
if (banderole != null && document.getElementById("banderole")!=null) {
  document.getElementById("banderole").innerHTML = banderole
  if (banderole.length > 0) {
    document.getElementById("banderole").style.animation = "defilement-rtl 10s infinite linear"
  }
}



let bouton = [];
let total = [];
let demandes = [];
let places = [];
let inscrits = []
let ouvert = []
let nbAmis = []
let cout = []


for(let j = 0; j < 4; j++){
    let div = document.createElement("div")
    let text = document.createElement("button")
    text.className = "jours tableau";
    text.innerHTML = common.day[j]
    div.appendChild(text);

    bouton[j] = []
    total[j] = []
    places[j] = []
    demandes[j] = []
    nbAmis[j] = []
    inscrits[j] = []
    ouvert[j] = [0,0]
    cout[j] = []
    for(let h = 0; h < 2; h++){
        bouton[j][h] = document.createElement("button")
        bouton[j][h].id = "" + j + h;
        bouton[j][h].onclick = function(){select(j,h)};
        bouton[j][h].className="places tableau"
        div.appendChild(bouton[j][h]);

    }
    body.appendChild(div);

}


async function refreshDatabase() {
    let info_menu = await common.socketAsync("info_menu_semaine",week)
    let text = "Semaine n°" + week + " du " + common.semaine(week)
    if (week == common.actualWeek) {
        text = "Cette semaine (n°" + week + " du " + common.semaine(week) + ")"
    }
    document.getElementById("semaine").innerHTML = text

    let val = info_menu.menu
    if (val == null) {
        val = "inconnu pour le moment"
    }
    document.getElementById("menu semaine").innerHTML = "<u>Menu de la semaine n°" + week + " :</u><br>" + val


    for (let j = 0; j < 4; j++) {
        for (let h = 0; h < 2; h++) {
            let info_horaire = await common.socketAsync("info_horaire",[week,j,h])
            let list_demandes = await common.socketAsync("list_demandes",[week,j,h])
            total[j][h] = info_horaire.places
            if(total[j][h]==null || total[j][h]==""){
                total[j][h]=0
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

            inscrits[j][h] = 0
            demandes[j][h] = 0

            list_demandes.forEach(function (child) {
                if(child.DorI==1){
                    inscrits[j][h]++
                }else{
                    demandes[j][h]++
                }
            });

            update(j, h);
        }
    }
}


function update(j,h){
    places[j][h] = total[j][h] - inscrits[j][h];
    
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
            text+="</br>("+demandes[j][h]+" demandes pour " + places[j][h] + " places restantes)"+textcout
            break;
        case 3:
            bouton[j][h].className="bloque tableau"
            text = inscrits[j][h]+" inscrits/"+total[j][h]  + " places"
            if(inscrits[j][h]>=total[j][h]){
                text+="<rouge></br>PLEIN</rouge>"
            }
            text+="</br>("+demandes[j][h]+" demandes pour " + places[j][h] + " places restantes)"+textcout
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
    bouton[j][h].innerHTML = text;
}

function select(j,h){
    window.location.href = "../crenau/crenau.html?j="+j+"&h="+h+"&w="+week;
}


refreshDatabase();


document.getElementById("editbanner").addEventListener("click",async function(){
    let banderole = await common.socketAsync("banderole",null)
    let p=window.prompt("Message de la banderole:",banderole);
    if (p!=null){
        await common.socketAdminAsync("set_banderole",p)
        document.getElementById("banderole").innerHTML = p
    }
})

document.getElementById("menu semaine").addEventListener("click",async function(){
    let info_menu = await common.socketAsync("info_menu_semaine",week)
    let p= info_menu.menu
    if (p==null || p=="" || p=="null"){
        p = "inconnu pour le moment"
    }
    p=window.prompt("Menu de la semaine "+week+":",p);
    if (p==null){
        p=info_menu.menu
    }
    if (p==null || p=="" || p=="null"){
        p = "inconnu pour le moment"
    }
    await common.socketAdminAsync("set_menu",[week,p])
    document.getElementById("menu semaine").innerHTML = "<u>Menu de la semaine n°" + week + " :</u><br>" + p
})

//-----------sondages--------------------
/*
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
                        notifMsg.style.visibility = "visible"
                        notifMsg.innerHTML = nbMsg
                    }
                })
            })
        })
    })
})*/



let retourImg=document.getElementById("retourImg")
let retour=document.getElementById("retour")


if(common.admin===2){
    retourImg.src="../../Images/option.png"
} else {
    retourImg.src="../../Images/retour.png"
}
retour.addEventListener("click",function(){
    if(common.admin===2){
        window.location.href="../../option/option.html"
    } else {
        window.location.href="../../menu/menu.html"
    }
})