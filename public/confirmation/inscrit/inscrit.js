import * as common from "../../common.js";
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let j = 0
let h = 0
let w = 0
  if(params.j!=null){
    j = parseInt(params.j)
  }
  if(params.h!=null){
    h = parseInt(params.h)
  }
  if(params.w!=null){
    w = parseInt(params.w)
  }


let info = await common.socketAsync('info_horaire',[w,j,h])
let listDemandes = await common.socketAsync('list_demandes',[w,j,h])
let my_demande = await common.socketAsync("my_demande",[w,j,h])

let textScore = ""
let score = await common.socketAsync("my_score","int")
if (score <2) {
    textScore = score + " pt"
}else{
    textScore = score + " pts"
}

let listUsers = await common.socketAsync('list_users',null)
let listAmisUuid=await common.socketAsync('amis','get')
let listAmis=[]
listUsers.forEach(child=>{
    if(listAmisUuid.indexOf(child.uuid)!=-1){
        listAmis.push(child)
    }
})
listAmisUuid=[]
listAmis.forEach(child=>{
    listAmisUuid.push(child.uuid)
})



let divListeAmis = document.getElementById("liste d'amis")
let divAmisAjoute = document.getElementById("amis ajoutés")
let demandesAmis = []
let amisCookie = []
try{
    amisCookie = commmon.readCookie("derniere demande").split("/")
}catch(Exception){}

let boolAmis = []
let butAmis = []
let inscrits = 0
let places = info.places
let demandes = 0

const boolAllAmis = common.readBoolCookie("allAmis")

if((info.ouvert != 2 && info.ouvert != 3) || my_demande.DorI!=1){
    window.location.href = window.location.origin + "/menu/menu.html";
}

let i = 0
listAmis.forEach(function(child) {
    const amiID = child.uuid
    const name = child.first_name + " " + child.last_name
    demandesAmis.push(0)
    boolAmis.push(my_demande.amis.indexOf(child.uuid) != -1)
    butAmis[i] = document.createElement("button")
    butAmis[i].classList.add("amis")
    butAmis[i].innerHTML = name
    if(boolAmis[i]){
        divAmisAjoute.appendChild(butAmis[i]);
    }else{
        divListeAmis.appendChild(butAmis[i]);
    }
    i++
})

listDemandes.forEach(function(child) {
    const index = listAmisUuid.indexOf(child.uuid)
    if(child.DorI==true){
        inscrits++
        if(index != -1){
            demandesAmis[index] = 2
        }
    }else{
        demandes++
        if(index != -1){
            demandesAmis[index] = 1
        }
    }
});


for(let i in demandesAmis){
    if(demandesAmis[i] == 1){
        butAmis[i].innerHTML += " (a fait une demande)"
    }else if(demandesAmis[i] == 2){
        butAmis[i].innerHTML += " (est inscrit)"
    }
}

if(divAmisAjoute.innerHTML==""){
    divAmisAjoute.innerHTML="Personne"
}
let reste = places - inscrits

document.getElementById("info").innerHTML = "Inscrit pour le "+ common.day[j]  +  " à " + (h+11)+"h<br>"
+ reste + " places restantes<br>("
+ inscrits + " acceptées pour " + places + " places)<br>" + demandes
+ " demandes en cours"

document.getElementById("pass").addEventListener("click", function() {
    window.location.href = window.location.origin + "/pass/pass.html";
});

let pb = 0
for(let i in boolAmis){
    if(boolAmis[i] && demandesAmis[i] == 0){
        pb++
    }
}

document.getElementById("article").style.display = "inline"
document.getElementById("chargement").style.display = "none"
database.ref(path(j,h)).once('value').then(function(snapshot) {
    database.ref("users/" + user).once('value').then(function(snapshot1) {
            let i = 0
            places = snapshot.child("places").val()
            snapshot1.child("amis").forEach(function(child) {
                const amiID = child.key
                const name = FindMyName(child.key)
                amis.push(amiID)
                demandesAmis.push(0)
                boolAmis.push(false)
                initBoolAmis.push(false)
                butAmis[i] = document.createElement("button")
                butAmis[i].classList.add("amis")
                butAmis[i].innerHTML = name
                divListeAmis.appendChild(butAmis[i]);
                i++
            })
            snapshot1.child("score").forEach(function(child) {
                score += parseFloat(snapshot1.child("score/"+child.key + "/value").val())
                score = round(score)
            })
            if (score <2) {
                textScore = score + " pt"
            }else{
                textScore = score + " pts"
            }




            if(snapshot.child("inscrits/" +user).val() == null){
                window.location.href = menu;
            }


            snapshot.child("inscrits/" + user + "/amis").forEach(function(child) {
                let name = child.key
                let index = amis.indexOf(name)
                boolAmis[index] = true
                initBoolAmis[index] = true
                if(index!=-1){
                    divAmisAjoute.appendChild(butAmis[index]);
                }
            })

            if(divAmisAjoute.innerHTML==""){
                divAmisAjoute.innerHTML="Personne"
            }

            snapshot.child("inscrits").forEach(function(child) {
                const name = child.key
                inscrits++
                const index = amis.indexOf(name)
                if(index != -1){
                    demandesAmis[index] = 2
                }
            });

            snapshot.child("demandes").forEach(function(child) {
                const name = child.key
                demandes++
                const index = amis.indexOf(name)
                if(index != -1){
                    demandesAmis[index] = 1
                }
            })


            if(h == 1){
                horaire = snapshot.child("inscrits/" + user + "/horaire").val()
                if(horaire==null)horaire=0
            }




            for(let i in demandesAmis){
                if(demandesAmis[i] == 1){
                    butAmis[i].innerHTML += " (a fait une demande)"
                }else if(demandesAmis[i] == 2){
                    butAmis[i].innerHTML += " (est inscrit)"
                }
            }
            console.log(h)
            console.log(horaire)
            document.getElementById("article").style.display = "inline"
            document.getElementById("chargement").style.display = "none"
            let reste = places - inscrits

            let info = "Inscrit pour le "+ day[j]  +  " à " + (h+11)+"h<br>"
            + reste + " places restantes<br>("
            + inscrits + " acceptées pour " + places + " places)<br>" + demandes
            + " demandes en cours"

            if(h == 1){
                if(horaire == 1 || horaire == 3){
                    info+="<br>Je termine à 12h20"
                }
                if(horaire == 2 || horaire == 3){
                    info+="<br>Je reprends à 12h50"
                }
            }

            document.getElementById("info").innerHTML = info

            document.getElementById("pass").addEventListener("click", function() {
                window.location.href = window.location.origin + "/pass/pass.html";
            });
    })
})
