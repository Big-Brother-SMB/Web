import * as common from "../common.js";

const body = document.getElementById("body");

let banderole = await common.socketAsync("banderole",null)
if (banderole != null && document.getElementById("banderole")!=null) {
  document.getElementById("banderole").innerHTML = banderole
  if (banderole.length > 0) {
    document.getElementById("banderole").style.animation = "defilement-rtl 10s infinite linear"
  }
}

let bouton = [];
let demande = []
let ouvert = []

let horaires = ["8h-9h","9h-10h","10h-11h","11h-12h","13h-14h","14h-15h","15h-16h"]

let divHoraires = document.createElement("div")
let text = document.createElement("button")
    text.className = "jours tableau";
    text.style.height = "50px";
    text.style.visibility = "hidden";
    divHoraires.appendChild(text);
for (let h = 0; h < 7; h++) {
    let horaire = document.createElement("button")
    horaire.innerHTML = horaires[h]
    horaire.className = "horaire"
    divHoraires.appendChild(horaire);

}
body.appendChild(divHoraires);

for (let j = 0; j < 5; j++) {
    let div = document.createElement("div")
    let text = document.createElement("button")
    text.className = "jours tableau";
    text.innerHTML = common.dayMer[j]
    div.appendChild(text);

    bouton[j] = []
    demande[j] = []
    ouvert[j] = []
    for (let h = 0; h < 7; h++) {
        bouton[j][h] = document.createElement("button")
        if((j == 2 && h >3) || (h == 3 && j != 2)){
            bouton[j][h].style.visibility = "hidden";
        }

        //bouton[j][h].id = "" + j + h;
        bouton[j][h].onclick = function () { select(j, h) };
        bouton[j][h].className = "crenau"
        div.appendChild(bouton[j][h]);

    }
    body.appendChild(div);
}

let week = common.readCookie("week")

document.getElementById("semainePrecedente").addEventListener("click", function () {
    week = week - 1
    common.writeCookie("week", week)
    refreshDatabase()
});

document.getElementById("semaineActuelle").addEventListener("click", function () {
    week = common.actualWeek
    common.writeCookie("week", week)
    refreshDatabase()
});


document.getElementById("semaineSuivante").addEventListener("click", function () {
    week = week + 1
    common.writeCookie("week", week)
    refreshDatabase()
});


async function refreshDatabase() {

    let text = "Semaine n°" + week + " du " + common.semaine(week)
    if (week == common.actualWeek) {
        text = "Cette semaine (n°" + week + " du " + common.semaine(week) + ")"
    }
    document.getElementById("semaine").innerHTML = text



    for (let j = 0; j < 5; j++) {
        for (let h = 0; h < 7; h++) {
            let nbDemandesPerm = 0
            let groupsInscrits = []

            let listDemandes = await common.socketAsync("list_demandes_perm",[week,j,h])

            bouton[j][h].className = "crenau"
            listDemandes.forEach(function(child){
                if(child.DorI){
                    groupsInscrits.push(child.group2)
                }else{
                    nbDemandesPerm++
                    if(common.uuid==child.uuid){
                        bouton[j][h].className = "crenau demande"
                    }
                }
            })

            let ouv = await common.socketAsync("ouvert_perm",[week,j,h])
            if (ouv == null){
                ouv = 0
            }
            ouvert[j][h] = ouv

            if (nbDemandesPerm==1){
                bouton[j][h].innerHTML = nbDemandesPerm.toString()+" demande en cours"
            }else if (nbDemandesPerm>1){
                bouton[j][h].innerHTML = nbDemandesPerm.toString()+" demandes en cours"
            }else {
                bouton[j][h].innerHTML="aucune info"
            }
            switch(ouv){
                case 0:
                    let str = ""
                    groupsInscrits.forEach(function (child) {
                        if(child == common.classe || common.groups.indexOf(child)!=-1){
                            bouton[j][h].className = "crenau inscrit"
                        }
                        if(str != ""){
                            str += ", "
                        }
                        str += child
                    });
                    if(str != ""){
                        bouton[j][h].innerHTML = str
                    }
                    break;
                case 1:
                    bouton[j][h].innerHTML = "fermé"
                    bouton[j][h].className = "crenau fermeR"
                    break;
                case 2:
                    bouton[j][h].innerHTML = "ouvert à tous"
                    bouton[j][h].className = "crenau inscrit"
                    break;
                case 3:
                    bouton[j][h].innerHTML = "réservé"
                    bouton[j][h].className = "crenau reserve"
                    
                    let str2 = ""
                    groupsInscrits.forEach(function (child) {
                        if(child == common.classe || common.groups.indexOf(child)!=-1){
                            bouton[j][h].className = "crenau inscrit"
                        }
                        if(str2 != ""){
                            str2 += ", "
                        }
                        str2 += child
                    });
                    bouton[j][h].innerHTML = str2
                    break;
                case 4:
                    bouton[j][h].innerHTML = "vacances"
                    bouton[j][h].className = "crenau ferme"
                    break;
            }
        }
    }
}

/*
function loop() {
    console.log("update database")
    refreshDatabase();
    setTimeout(loop, 20000);
}
loop();*/
refreshDatabase();

function select(j, h){
    if (ouvert[j][h] == 0) {
        window.location.href = "demandePerm.html?j="+j+"&h="+h+"&w="+week;;
    }
}
