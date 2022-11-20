import { admin } from "googleapis/build/src/apis/admin/index.js";
import * as common from "../../common.js";

let divClasse = document.getElementById("classe")
let dName = document.getElementById("name")

let pScore = document.getElementById("score")
let divScoreEvent = document.getElementById("divScoreEvent")
let bAddScore = document.getElementById("score ajouter")
let valScore = document.getElementById("score value")
let nameScore = document.getElementById("score name")
let infoCodeCarte = document.getElementById("info code barre")
let codeCarte = document.getElementById("code carte")
let adminBox = document.getElementById("admin")

let divPrio = document.getElementById("prio")
let addPrio = document.getElementById("addPrio")

let priorites = []
let g_c = await common.socketAdminAsync('list group/classe',null)
g_c[0].forEach(function(child) {
    priorites.push(child.group2)
    let opt = document.createElement("option")
    opt.innerHTML = child.group2
    addPrio.appendChild(opt);
})
for(let i in g_c[1]){
    let opt = document.createElement("option")
    opt.innerHTML = g_c[1][i].classe
    divClasse.appendChild(opt);
}


function stop(){
    dName.removeEventListener("input",fuName)
    divClasse.removeEventListener("change",fu1)
    bAddScore.removeEventListener("click",fu2)
    adminBox.removeEventListener("change",fu3)
    codeCarte.removeEventListener("input",fu4)
    addPrio.removeEventListener("click",fu5)
}

let fuName=function(){return}
let fu1=function(){return}
let fu2=function(){return}
let fu3=function(){return}
let fu4=function(){return}
let fu5=function(){return}

let utilisateursNames = []
let listUsers = await common.socketAdminAsync('list pass',null)

listUsers.forEach(function(child) {
    utilisateursNames.push(child.first_name + " " + child.last_name)
})
console.log(utilisateursNames)
autocomplete(document.getElementById("search"), utilisateursNames,function(val){
    stop()
    setTimeout(function() {
        let utilisateur = listUsers[utilisateursNames.indexOf(document.getElementById("search").value)]
        let codeBar = utilisateur.code_barre
        let classe = utilisateur.classe
        let listGroups = utilisateur.groups
        let first_name = utilisateur.first_name
        let last_name = utilisateur.last_name

        if(utilisateursNames.indexOf(utilisateur) == -1){
            document.getElementById("info").innerHTML = "cet utilisateur n'existe pas"
        }else{
            document.getElementById("info").innerHTML = "Page de " + utilisateur.first_name + " " + utilisateur.last_name
            divClasse.selectedIndex = g_c[1].indexOf(utilisateur.classe);
            divClasse.addEventListener("change", fu1=function() {
                classe = g_c[1][this.selectedIndex]
                common.socketAdminAsync('set user',[utilisateur.uuid,first_name,last_name,codeBar,classe,adminBox.checked,listGroups])
            });
            
            dName.value = utilisateur.first_name + " " + utilisateur.last_name
            dName.addEventListener("input",fuName=function(){
                if(utilisateursNames.indexOf(dName.value) == -1){
                    let name = dName.value.split(' ')
                    first_name=name[0]
                    if(name.length>1){
                       last_name=name[1] 
                    }
                    common.socketAdminAsync('set user',[utilisateur.uuid,first_name,last_name,codeBar,classe,adminBox.checked,listGroups])
                }
            })
    
    
            divScoreEvent.innerHTML = null
            divPrio.innerHTML = null
    
            let score = 0
            database.ref("users/" + utilisateur + "/score").once('value').then(function(snapshot) {
                snapshot.forEach(function(child) {
                    addScoreEvent(child.key) 
                })
                if(divScoreEvent.innerHTML == null){
                    divScoreEvent.innerHTML = "aucun point"
                }
            });
    
            function addScoreEvent(hashCode){
                let event = document.createElement("button")
                event.classList.add("event")
                divScoreEvent.appendChild(event);
                let eventScore
            
                database.ref("users/" + utilisateur + "/score/" + hashCode + "/name").once('value').then(function(snapshot) {
                    let name = snapshot.val()
                    if(name == null){
                        name = ""
                    }else{
                        name += " : "
                    }
                    database.ref("users/" + utilisateur + "/score/" + hashCode + "/value").once('value').then(function(snapshot) {
                        eventScore = parseFloat(snapshot.val())
                        event.innerHTML = name + eventScore + "pts"
            
                        score += eventScore
                        score = Math.round(score*100)/100
                        if(score < 2){
                            pScore.innerHTML = "Score : " + score + "pt";
                        }else{
                            pScore.innerHTML = "Score : " + score + "pts";
                        }
                    }) 
                })
    
                event.addEventListener("click", function() {
                    database.ref("users/" + utilisateur + "/score/" + hashCode).remove()
                    divScoreEvent.removeChild(event);
                    score -= eventScore
                    score = Math.round(score*100)/100
                    if(score < 2){
                        pScore.innerHTML = "Score : " + score + "pt";
                    }else{
                        pScore.innerHTML = "Score : " + score + "pts";
                    }
                })     
            }
    
            bAddScore.addEventListener("click", fu2=function() {
                let val = parseFloat(valScore.value)
                let name = nameScore.value
                if(!isNaN(val) && name != ""){
                    let h = hash()
                    database.ref("users/" + utilisateur + "/score/" + h + "/name").set(name)
                    database.ref("users/" + utilisateur + "/score/" + h + "/value").set(val)
                    valScore.value = ""
                    nameScore.value = ""
            
                    addScoreEvent(h)
                }
                
            });
    
            if(utilisateur.admin==1 || utilisateur.admin==2){
                adminBox.checked=true
            } else {
                adminBox.checked=false
            }
            adminBox.addEventListener("change", fu3=function() {
                common.socketAdminAsync('set user',[utilisateur.uuid,first_name,last_name,codeBar,classe,adminBox.checked,listGroups])
            })

            codeCarte.value = codeBar
            codeCarte.addEventListener("input", fu4=function() {
                infoCodeCarte.innerHTML = ""
                let val = codeCarte.value
                if(String(val).length  == 5 && val != codeBar){
                    let test=true
                    listUsers.forEach(function(child) {
                        let codeBar2 = child.code_barre
                        if(codeBar2==val && child!=utilisateur){
                            test=false
                            infoCodeCarte.innerHTML += "déjà utiliser par: " + utilisateur.first_name + " " + utilisateur.last_name
                        }
                    })
                    if(test){
                        common.socketAdminAsync('set user',[utilisateur.uuid,first_name,last_name,codeBar,classe,adminBox.checked,listGroups])
                        codeBar=val
                    }
                }
            });
            
            
            if(listGroups.length == null){
                divPrio.innerHTML = "aucune priorités"
            }else{
                divPrio.innerHTML = ""
                listGroups.forEach((e)=>{
                    addButPrio(e)
                })
            }
            
            addPrio.addEventListener("click", fu5=function() {
                const index = this.selectedIndex - 1
                addPrio.selectedIndex = 0
                if(index != -1 && !listGroups.include(g_c[1][index].classe)){
                    listGroups.push(g_c[1][index].classe)
                    common.socketAdminAsync('set user',[utilisateur.uuid,first_name,last_name,codeBar,classe,adminBox.checked,listGroups])
                    if(divPrio.childElementCount == 0){
                        divPrio.innerHTML = ""
                    }
                    addButPrio(g_c[1][index].classe)
                }
            });
            function addButPrio(name){
                let prio = document.createElement("button")
                prio.innerHTML = name
                prio.className = "priorites"
                prio.addEventListener("click", function() {
                    listGroups = listGroups.filter(o => o != name);
                    common.socketAdminAsync('set user',[utilisateur.uuid,first_name,last_name,codeBar,classe,adminBox.checked,listGroups])
                    prio.parentNode.removeChild(prio);
                    if(divPrio.childElementCount == 0){
                        divPrio.innerHTML = "aucune priorités"
                    }
                });
                divPrio.appendChild(prio);
            }
        }        
    },100);
});