const jour = ["1lundi", "2mardi","3jeudi","4vendredi"];

const menu = "../../menu/menu.html"

let user = sessionStorage.getItem("user");
let j = sessionStorage.getItem("j");
let h = parseInt(sessionStorage.getItem("h"));
console.log("hello2");

let divListe = document.getElementById("liste")

let prio = []
database.ref(path(j,h) + "/prioritaires").once("value", function(snapshot) {
    snapshot.forEach(function(child) {
        prio.push(child.key)
    })
})
let cout
database.ref(path(j,h) + "/cout").once('value').then(function(snapshot) {
    cout = snapshot.val();
});

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
                }*/
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
