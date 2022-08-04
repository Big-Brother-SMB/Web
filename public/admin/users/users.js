let divClasse = document.getElementById("classe")

let pScore = document.getElementById("score")
let divScoreEvent = document.getElementById("divScoreEvent")
let bAddScore = document.getElementById("score ajouter")
let valScore = document.getElementById("score value")
let nameScore = document.getElementById("score name")
let infoCodeCarte = document.getElementById("info code barre")
let codeCarte = document.getElementById("code carte")
let adminBox = document.getElementById("admin")

for(i in listClasse){
    let opt = document.createElement("option")
    opt.innerHTML = listClasse[i]
    divClasse.appendChild(opt);
}



let divPrio = document.getElementById("prio")
let addPrio = document.getElementById("addPrio")

let priorites = []
database.ref("priorites").once("value", function(snapshot) {
    snapshot.forEach(function(child) {
        priorites.push(child.key)
        let opt = document.createElement("option")
        opt.innerHTML = child.key
        addPrio.appendChild(opt);
    })

})

function stop(){
    divClasse.removeEventListener("change",fu1)
    bAddScore.removeEventListener("click",fu2)
    adminBox.removeEventListener("change",fu3)
    codeCarte.removeEventListener("input",fu4)
    addPrio.removeEventListener("click",fu5)
}

let fu1=function(){return}
let fu2=function(){return}
let fu3=function(){return}
let fu4=function(){return}
let fu5=function(){return}

let utilisateurs = []
database.ref("users").once("value", function(snapshot) {
    snapshot.forEach(function(child) {
        utilisateurs.push(child.key) 
    })
    autocomplete(document.getElementById("search"), utilisateurs,function(val){
        stop()
        setTimeout(function() {
            let utilisateur = document.getElementById("search").value
            console.log(utilisateur)
            if(utilisateurs.indexOf(utilisateur) == -1){
                document.getElementById("info").innerHTML = "cet utilisateur n'existe pas"
            }else{
                document.getElementById("info").innerHTML = "Page de "+utilisateur
                database.ref("users/" + utilisateur + "/classe").once('value').then(function(snapshot) {
                divClasse.selectedIndex = listClasse.indexOf(snapshot.val());
                divClasse.addEventListener("change", fu1=function() {
                    database.ref("users/" + utilisateur + "/classe").set(listClasse[this.selectedIndex])
                });
            });

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

            database.ref("modo/users/" + utilisateur).once('value').then(function(snapshot) {
                if(snapshot.val()===0){
                    adminBox.checked=true
                } else {
                    adminBox.checked=false
                }
                adminBox.addEventListener("change", fu3=function() {
                    if (adminBox.checked == true){
                        database.ref("modo/users/" + utilisateur).set(0)
                    } else {
                        database.ref("modo/users/" + utilisateur).remove()
                    }
                })

            })
            database.ref("users/" + utilisateur + "/code barre").once('value').then(function(snapshot) {
                let codeBar = snapshot.val()
                codeCarte.value = codeBar
                codeCarte.addEventListener("input", fu4=function() {
                    codeBar = snapshot.val()
                    infoCodeCarte.innerHTML = ""
                    let val = codeCarte.value
                    if(String(val).length  == 5 && val != codeBar){
                        let test= true;
                        database.ref("users").once("value", function(snapshot){
                            snapshot.forEach(function(child) {
                                database.ref("users/"+child.key+"/code barre").once("value", function(snapshot){
                                    if (val===snapshot.val()&&child.key!=utilisateur) {
                                        infoCodeCarte.innerHTML += "déjà utiliser par: " + child.key
                                        test=false
                                        database.ref("users/" + utilisateur + "/code barre").set(codeBar)
                                    }
                                    if(child.key === utilisateur && test){
                                        database.ref("users/" + utilisateur + "/code barre").set(val)
                                    }
                                })
                            })
                        })
                    }
                });
                
            });
            
    
            let bPrio = []
            for(let {} in priorites){
                bPrio.push(false)
            }
            database.ref("users/" + utilisateur + "/priorites").once('value',function(snapshot) {
                if(snapshot.val() == null){
                    divPrio.innerHTML = "aucune priorités"
                }else{
                    console.log(snapshot.val())
                    divPrio.innerHTML = ""
                    snapshot.forEach(function(child) {
                        addButPrio(child.key)
                        bPrio[priorites.indexOf(child.key)] = true
                    })
                }
            });
            
            addPrio.addEventListener("click", fu5=function() {
                const index = this.selectedIndex - 1
                addPrio.selectedIndex = 0
                if(index != -1 && !bPrio[index]){
                    bPrio[index] = true
                    const name = priorites[index]
                    database.ref("users/" + utilisateur + "/priorites/" + name).set(0)
                    if(divPrio.childElementCount == 0){
                        divPrio.innerHTML = ""
                    }
                    addButPrio(name)
                }
            });
            function addButPrio(name){
                let prio = document.createElement("button")
                prio.innerHTML = name
                prio.className = "priorites"
                prio.addEventListener("click", function() {
                    database.ref("users/" + utilisateur + "/priorites/" + name).remove()
                    prio.parentNode.removeChild(prio);
                    bPrio[priorites.indexOf(name)] = false
                    if(divPrio.childElementCount == 0){
                        divPrio.innerHTML = "aucune priorités"
                    }
                });
                divPrio.appendChild(prio);
            }
        }        
        },100);
    });
})
    



let charge = 1
function charged(){
    if(charge < 7){
        charge++
        return
    }
    console.log("charged")

}