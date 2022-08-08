let j = sessionStorage.getItem("j");
let h = parseInt(sessionStorage.getItem("h"));
console.log("hello2");

let table = document.getElementById("tbody")

let cout
let snapshotUser


users = [];
database.ref(path(j,h)).once("value",function(snapshot){
    database.ref("users").once("value",function(snap){
        /*snapshotUser=snap
        snapshotUser.forEach(function(child){
            database.ref(path(j,h)+"/demandes/"+child.key).set(0)
        })*/
        snapshotUser=snap

        cout = snapshot.child("cout").val();
        snapshot.child("demandes").forEach(function(child){
            searchUser(child.key,false,null)
        })
        snapshot.child("inscrits").forEach(function(child){
            searchUser(child.key,true,null)
        })
        users.sort((a, b) => (a.name > b.name) ? 1 : -1)
        for(let i in users){
            let ligne = document.createElement("tr")
            reloadLigne(ligne,i)
            table.appendChild(ligne)
        }
    })
})

function reloadLigne(ligne,i){
    ligne.innerHTML=""
    let col= document.createElement("td")
    col.innerHTML=new String(users[i].name)
    ligne.appendChild(col)

    col= document.createElement("td")
    col.innerHTML=new String(users[i].classe)
    ligne.appendChild(col)

    let colD= document.createElement("td")
    let colI= document.createElement("td")
    if(!users[i].DorI){
        colD.innerHTML="demande"
        colD.addEventListener("click",event)
        function event(){
            colD.removeEventListener("click",event)
            table.removeChild(ligne)
            database.ref(path(j,h)+"/demandes/"+users[i].name).remove()
        }
    } else {
        colD.innerHTML="X"
        colD.addEventListener("click",event)
        function event(){
            colD.removeEventListener("click",event)
            database.ref(path(j,h)+"/demandes/"+users[i].name).set(0)
            database.ref(path(j,h)+"/inscrits/"+users[i].name).remove()
            users[i].DorI=false
            reloadLigne(ligne,i)
        }
    }
    ligne.appendChild(colD)

    if(users[i].DorI){
        colI.innerHTML="inscrit"
        colI.addEventListener("click",event)
        function event(){
            colI.removeEventListener("click",event)
            table.removeChild(ligne)
            database.ref(path(j,h)+"/inscrits/"+users[i].name).remove()
        }
    } else {
        colI.innerHTML="X"
        colI.addEventListener("click",event)
        function event(){
            colI.removeEventListener("click",event)
            database.ref(path(j,h)+"/demandes/"+users[i].name).remove()
            database.ref(path(j,h)+"/inscrits/"+users[i].name).set(0)
            users[i].DorI=true
            reloadLigne(ligne,i)
        }
    }
    ligne.appendChild(colI)

    col= document.createElement("td")
    col.innerHTML=new String(users[i].pass)
    ligne.appendChild(col)

    col= document.createElement("td")
    col.innerHTML=new String(users[i].carte)
    ligne.appendChild(col)
}

function searchUser(name,DorI,pass){
    let code = snapshotUser.child(name+"/code barre").val()
    let classe = snapshotUser.child(name+"/classe").val()
    users.push(new userObject(name,classe,DorI,pass,code))
}

function userObject(name,classe,DorI,pass,carte) {
    this.name=name
    this.classe=classe
    this.DorI=DorI
    this.pass=pass
    this.carte=carte
}



  
/*



getStat(j,h,"demandes")
setTimeout(function() {
    
    if(users.length == 0){
        divListe.innerHTML = "aucun utilisateurs"
    }else{
        divListe.innerHTML = ""
        for(let u in users){
            let divPers = document.createElement("div")
            //divPers.style.display = "inline-block"
            let pers = document.createElement("button")
            let name = users[u]
            pers.innerHTML = name
            pers.className = "name"

            let del = document.createElement("button")
            del.addEventListener("click", function() {
                console.log("del")
                database.ref(path(j,h) + "/demandes/" + users[u]).remove()

                console.log(delLinkTag[u])
                for(let l in delLinkTag[u]){
                    database.ref(path(j,h) + "/demandes/" + users[delLinkTag[u][l]]).remove()
                }
            })
            del.innerHTML = "retirer (" + delLinkTag[u].length + ")"

           
            let add = document.createElement("button")
            add.addEventListener("click", function() {
                console.log("add")
                console.log(u)
                let nbOk = 0;
                for(let pers in addLinkTag[u]){
                    let p = addLinkTag[u][pers]
                    let name = users[p]
                    console.log(name)
                    let score = usersScore[p]
                    if(score == null){
                        score = 0
                    }
                    let hashCode = hash()
                    database.ref("users/" + name + "/score/" + hashCode + "/value").set(-cout)
                    database.ref("users/" + name + "/score/" + hashCode + "/name").set("Repas du " + dayLowerCase[j] + " " + getDayText(j) +  " à " + (11 + h) + "h")
                    database.ref(path(j,h) + "/inscrits/" + name).set(score)
                    database.ref(path(j,h) + "/demandes/" + name).remove()
                    try{
                        database.ref("users/" + users[p] + "/email").once("value",function(snapshot){
                            let email = snapshot.val()
                            let prenom = users[p].split(" ")[0]
                            console.log(email)
                        Email.send({
                            Host: "smtp.gmail.com",
                            Username: "foyer.beaucamps@gmail.com",
                            Password: "beaucamps",
                            To: email,
                            From: "foyer.beaucamps@gmail.com",
                            Subject: "Inscription validée",
                            Body: "Bonjour " + prenom + ", ton inscription au foyer a été validée",
                          })
                            .then(function (message) {
                              console.log("mail sent successfully to " + email)
                              database.ref(path(j,h) + "/inscrits/" + users[p]).once("value", function(snapshot) {
                                console.log(users[p] + ":" + snapshot.val())
                                if(snapshot.val() != null){
                                    nbOk++
                                    console.log("ok -> " + nbOk)
                                    if(nbOk == addLinkTag[u].length){
                                        console.log("reload ")
                                        reload()
                                    }
                                }
                            });
                              
                            });
                        })
                        
                    }catch(exception){
                        console.log(exception)
                    }
                }

                
                      
                  
                      
                /*database.ref(path(j,h) + "/inscrits/" + users[u]).once("value", function(snapshot) {
                    console.log(users[u] + ":" + snapshot.val())
                    if(snapshot.key == users[u] && snapshot.val() != null){
                        database.ref(path(j,h) + "/demandes/" + name).remove()
                        reload()
                    }
                });*/

                /*for(let a in amis[u]){
                    database.ref(path(j,h) + "/inscrits/" + users[u] + "/amis/" + amis[u][a]).set(0)
                }
                database.ref(path(j,h) + "/inscrits/" + users[u] + "/score").set(usersScore[u])
                database.ref(path(j,h) + "/inscrits/" + users[u] + "/score").set(usersClasse[u])
                database.ref(path(j,h) + "/demandes/" + users[u]).remove()

                console.log(addLinkTag[u])
                for(let l in addLinkTag[u]){
                    let num = addLinkTag[u][l]
                    console.log("user : " + users[num] + " / " + num)
                    for(let a in amis[num]){
                        database.ref(path(j,h) + "/inscrits/" + users[num] + "/amis/" + amis[num][a]).set(0)
                    }
                    database.ref(path(j,h) + "/inscrits/" + users[num] + "/score").set(usersScore[num])
                    database.ref(path(j,h) + "/inscrits/" + users[u] + "/score").set(usersClasse[num])
                    database.ref(path(j,h) + "/demandes/" + users[num]).remove()
                }
            })
            add.innerHTML = "inscrire (" + addLinkTag[u].length + ")"

            let classe = document.createElement("button")
            classe.innerHTML = usersClasse[u]
            classe.className = "classe"

            let score = document.createElement("button")
            score.innerHTML = usersScore[u] + " pts"
            score.className = "score"

            let groupScore = document.createElement("button")
            groupScore.innerHTML = gScore[u] + " GP"

            let classAmis = document.createElement("button")
            
            for(let a in addLinkTag[u]){
                let tag = addLinkTag[u][a]
                let classAmi = document.createElement("button")
                classAmi.innerHTML = usersClasse[tag]
                classAmis.appendChild(classAmi)
            }

            let perPrio = document.createElement("button")
            let nbPrio = 0
            for(let a in addLinkTag[u]){
                let tag = addLinkTag[u][a]
                if(prio.indexOf(usersClasse[tag]) != -1 || commonElement(prio, usersPriorites[tag]) != 0){
                    nbPrio++
                }
            }
            perPrio.innerHTML = Math.round(nbPrio / addLinkTag[u].length * 100) + "%"
            perPrio.className = "per"

            perPrio.addEventListener("click", function(){
                console.log("bruh")
            })

            

            divPers.appendChild(pers);
            divPers.appendChild(del);
            divPers.appendChild(add);
            divPers.appendChild(classe);
            divPers.appendChild(score);
            divPers.appendChild(groupScore);
            divPers.appendChild(perPrio)

            for(let p in usersPriorites[u]){
                let bP = document.createElement("button")
                bP.innerHTML = usersPriorites[u][p]
                bP.className = "prio"
               // bP.className = "prio"
                divPers.appendChild(bP);
            }
            
            divPers.appendChild(document.createElement("p"));
            
            //divPers.innerHTML += "<br>"
            divPers.appendChild(classAmis)

            divListe.appendChild(divPers);
        }
    }
    
        
        
},1000);





getStat(j,h,"inscrits")
setTimeout(function() {
    
    if(users.length == 0){
        divListe.innerHTML = "aucun utilisateurs"
    }else{
        divListe.innerHTML = ""
        for(u in users){
            let divPers = document.createElement("div")
            //divPers.style.display = "inline-block"
            let pers = document.createElement("button")
            let name = users[u]
            pers.innerHTML = name
            let del = document.createElement("button")
            del.addEventListener("click", function() {
                console.log("del")
                database.ref(path(j,h) + "/inscrits/" + name).remove()
                //"semaine" + week + "-" + day[j] + "-" + (11 + h) + "h"
                database.ref("users/" + name + "/score").once("value",function(snap){
                    let rembourse = false
                    snap.forEach(function(child) {
                        try{
                            console.log(child.node_.children_.root_.left.value.value_)
                            if(child.node_.children_.root_.left.value.value_ == "Repas du " + dayLowerCase[j] + " " + getDayText(j) + " à " + (11 + h) + "h"){
                                console.log("found")
                                database.ref("users/" + name + "/score/" + child.key).remove()
                                rembourse = true
                            }
                        }catch(Exception){

                        }
                        
                    })
                    /*if(!rembourse){
                        let hashCode = hash()
                        database.ref("users/" + name + "/score/" + hashCode + "/value").set(cout)
                        database.ref("users/" + name + "/score/" + hashCode + "/name").set("remboursement de la semaine" + week + "-" + day[j] + "-" + (11 + h) + "h")
                            
                    }
                    setTimeout(function() {
                        reload()
                    },1000);

                })

            })
            del.innerHTML = "retirer (" + delLinkTag[u].length + ")"
            let wait = document.createElement("button")
            wait.addEventListener("click", function() {
                console.log("wait")
            })
            wait.innerHTML = "Mettre sur liste d'attente (" + delLinkTag[u].length + ")"


            let classe = document.createElement("button")
            classe.innerHTML = usersClasse[u]

            let score = document.createElement("button")
            score.innerHTML = usersScore[u] + " pts"

            divPers.appendChild(pers);
            divPers.appendChild(del);
            //divPers.appendChild(wait);
            divPers.appendChild(classe);
            divPers.appendChild(score);
            
            divListe.appendChild(divPers);
        }
    }
    
        
        
},1000);
*/