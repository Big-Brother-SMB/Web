const jour = ["1lundi", "2mardi","3jeudi","4vendredi"];

const menu = "../../menu/menu.html"

let user = sessionStorage.getItem("user");
let j = sessionStorage.getItem("j");
let h = parseInt(sessionStorage.getItem("h"));
console.log(path(j,h));

let divListe = document.getElementById("liste")
let cout
database.ref(path(j,h) + "/cout").once('value').then(function(snapshot) {
    cout = snapshot.val();
});
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
                            
                    }*/
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
