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

function updateConfirmation(){
    let pb = 0
    for(let i in boolAmis){
        if(boolAmis[i] && demandesAmis[i] == 0){
            pb++
        }
    }
    let p = document.getElementById("attention amis")
    if(pb == 0){
        p.innerHTML = ""
    }else if(pb == 1){
        p.innerHTML = "Attention, un ami n'a pas encore fait de demande"
    }else{
        p.innerHTML = "Attention, " + pb + " amis n'ont pas encore fait de demande"
    }
}

document.getElementById("tout ajouter").addEventListener("click", function() {
    for(let i in boolAmis){
        boolAmis[i] = true;
        divAmisAjoute.appendChild(butAmis[i]);
    }
    updateConfirmation()
})


document.getElementById("tout retirer").addEventListener("click", function() {
    for(let i in boolAmis){
        boolAmis[i] = false;
        divListeAmis.appendChild(butAmis[i]);
    }
    updateConfirmation()
})

let info = await common.socketAsync('info_horaire',[w,j,h])
let listDemandes = await common.socketAsync('list_demandes',[w,j,h])

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


if(info.ouvert != 2){
    window.location.href = window.location.origin + "/menu/menu.html";
}

let i = 0
listAmis.forEach(function(child) {
    const amiID = child.uuid
    const name = child.first_name + " " + child.last_name
    demandesAmis.push(0)
    boolAmis.push(boolAllAmis || amisCookie.indexOf(amiID) != -1)
    butAmis[i] = document.createElement("button")
    butAmis[i].classList.add("amis")
    butAmis[i].innerHTML = name
    if(boolAmis[i]){
        divAmisAjoute.appendChild(butAmis[i]);
    }else{
        divListeAmis.appendChild(butAmis[i]);
    }

    const num = i
    butAmis[num].addEventListener("click", function() {
        if(boolAmis[num]){
            divListeAmis.appendChild(butAmis[num]);
        }else{
            divAmisAjoute.appendChild(butAmis[num]);
        }
        boolAmis[num] = !boolAmis[num]
        updateConfirmation()
    })

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


let reste = places - inscrits
document.getElementById("info").innerHTML = "Demander l'inscription<br>pour le "+ common.day[j]  +  " à " + (h+11)+"h<br>"
+ "Il reste " + reste + " places<br>(" + inscrits + " inscrits pour " + places + " places)<br>Il y déjà " + demandes
+ " demandes en cours<br>Votre score est de " + textScore



document.getElementById("oui").addEventListener("click", async function() {
    let str = ""
    let amis = []
    for(let i in boolAmis){
        if(boolAmis[i]){
            str += listAmisUuid[i] + "/"
            amis.push(listAmisUuid[i])
        }

    }
    common.writeCookie("derniere demande",str)

    if(await common.socketAsync('my_demande',[w,j,h,amis])=='ok'){
        window.location.href = window.location.origin + "/menu/menu.html";
    }
});
document.getElementById("non").addEventListener("click", function() {
    window.location.href = window.location.origin + "/menu/menu.html";
});
updateConfirmation()