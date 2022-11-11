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

let table = document.getElementById("tbody")

let cout
let snapshotUser
let snapshotName
let ouvert
database.ref(path(j,h)).once("value",function(snapshot){
    database.ref("users").once("value",function(snap){
        database.ref("names").once("value",function(snapNames){
            users = [];
            snapshotUser=snap
            snapshotName=snapNames
    
            cout = snapshot.child("cout").val();
            ouvert = snapshot.child("ouvert").val();
            snapshot.child("demandes").forEach(function(child){
                searchUser(child.key,false,"---")
            })
            snapshot.child("inscrits").forEach(function(child){
                searchUser(child.key,true,snapshot.child("inscrits/"+child.key+"/scan").val())
            })
            users.sort((a, b) => (a.name > b.name) ? 1 : -1)
            for(let i in users){
                let ligne = document.createElement("tr")
                reloadLigne(ligne,i)
                table.appendChild(ligne)
            }
        })
    })
})

function reloadLigne(ligne,i){
    ligne.innerHTML=""
    let col= document.createElement("td")
    col.innerHTML=new String(users[i].Dname)
    ligne.appendChild(col)

    col= document.createElement("td")
    col.innerHTML=new String(users[i].classe)
    ligne.appendChild(col)

    let colD= document.createElement("td")
    let colI= document.createElement("td")
    if(!users[i].DorI){
        colI.innerHTML="-------"
        colD.innerHTML="demande"
        colI.addEventListener("click",eventI)
        function eventI(){
            i=[...table.children].indexOf(ligne)
            colD.removeEventListener("click",eventD)
            colI.removeEventListener("click",eventI)
            colS.removeEventListener("click",event2)
            database.ref(path(j,h)+"/demandes/"+users[i].name).once('value').then(function(snapshot){
                database.ref(path(j,h)+"/inscrits/"+users[i].name).set(snapshot.val())
                database.ref(path(j,h)+"/demandes/"+users[i].name).remove()
            })

            users[i].pass="Non scan"
            users[i].DorI=true

            if(ouvert==2||ouvert==3||ouvert==5){
                let hashCode = hash()

                database.ref("users").once('value').then(function(snapshot){
                    database.ref(path(j,h)).once('value').then(function(snapshotP) {
                        let hashCode = hash()
                        let classeUser = snapshot.child(users[i].name+"/classe").val()
                        let prioUser = []
                        snapshot.child(users[i].name+"/priorites").forEach(function(child2){
                            prioUser.push(child2.key)
                        })
                        let prio = []
                        snapshotP.child("prioritaires").forEach(function(child2){
                            prio.push(child2.key)
                        })
                        if(snapshotP.child('gratuit prioritaires').val() && (commonElement(prioUser, prio) != 0 || prio.indexOf(classeUser) != -1)){
                            
                        } else {
                            database.ref("users/" + users[i].name + "/score/" + hashCode + "/name").set("Repas du " + dayLowerCase[j] + " " + getDayText(j) +  " à " + (11 + h) + "h")
                            database.ref("users/" + users[i].name + "/score/" + hashCode + "/value").set(-cout)
                        }
                    })
                })
            }
            reloadLigne(ligne,i)
        }
    } else {
        colI.innerHTML="inscrit"
        colD.innerHTML="-------"
        colD.addEventListener("click",eventD)
        function eventD(){
            i=[...table.children].indexOf(ligne)
            colD.removeEventListener("click",eventD)
            colI.removeEventListener("click",eventI)
            colS.removeEventListener("click",event2)

            database.ref(path(j,h)+"/inscrits/"+users[i].name).once('value').then(function(snapshot){
                database.ref(path(j,h)+"/demandes/"+users[i].name).set(snapshot.val())
                database.ref(path(j,h)+"/demandes/"+users[i].name+"/scan").remove()
                database.ref(path(j,h)+"/inscrits/"+users[i].name).remove()
            })

            users[i].pass="---"
            users[i].DorI=false

            database.ref("users/"+users[i].name+"/score/").once('value').then(function(snapshot){
                snapshot.forEach(function(hash){
                    if(snapshot.child(hash.key+"/name").val()==="Repas du " + dayLowerCase[j] + " " + getDayText(j) +  " à " + (11 + h) + "h"){
                        database.ref("users/"+users[i].name+"/score/"+hash.key).remove()
                    }
                })
            })

            reloadLigne(ligne,i)
        }   
    }



    ligne.appendChild(colD)
    ligne.appendChild(colI)

    col= document.createElement("td")
    col.innerHTML=new String(users[i].pass)
    ligne.appendChild(col)

    col= document.createElement("td")
    col.innerHTML=new String(users[i].carte)
    ligne.appendChild(col)

    let colS= document.createElement("td")
    colS.innerHTML="suppr"
    colS.addEventListener("click",event2)
    function event2(){
        i=[...table.children].indexOf(ligne)
        colD.removeEventListener("click",eventD)
        colI.removeEventListener("click",eventI)
        colS.removeEventListener("click",event2)
        database.ref(path(j,h)+"/inscrits/"+users[i].name).remove()
        database.ref(path(j,h)+"/demandes/"+users[i].name).remove()
        database.ref("users/"+users[i].name+"/score/").once('value').then(function(snapshot){
            snapshot.forEach(function(hash){
                if(snapshot.child(hash.key+"/name").val()==="Repas du " + dayLowerCase[j] + " " + getDayText(j) +  " à " + (11 + h) + "h"){
                    database.ref("users/"+users[i].name+"/score/"+hash.key).remove()
                }
            })
            users.splice([...table.children].indexOf(ligne),1)
            table.removeChild(ligne)
        })
    }
    ligne.appendChild(colS)
}

function searchUser(name,DorI,pass){
    let code = snapshotUser.child(name+"/code barre").val()
    let classe = snapshotUser.child(name+"/classe").val()
    let Dname = name
    if(typeof snapshotName.child(name).val() === "string"){
        Dname = snapshotName.child(name).val()
    }
    users.push(new userObject(name,classe,DorI,pass,code,Dname))
}

function userObject(name,classe,DorI,pass,carte,Dname) {
    this.name=name
    this.classe=classe
    this.DorI=DorI
    this.Dname=Dname
    if(pass!=null){
        this.pass=pass
    }else{
        this.pass="Non scan"
    }
    this.carte=carte
}

let search = document.getElementById("search")
database.ref("users").once("value", function(snapshot) {
    database.ref("names").once("value", function(snapshotNames) {
        let utilisateursNames=[]
        let utilisateurs=[]
        let utilisateurs2=[]
        snapshot.forEach(function(child) {
            utilisateurs.push(child.key)
            if(typeof snapshotNames.child(child.key).val() === "string"){
                utilisateursNames.push(snapshotNames.child(child.key).val())
            } else {
                database.ref("names/"+child.key).set(child.key)
                utilisateursNames.push(child.key)
            }
        })
        autocomplete(search, utilisateursNames,function(val){})
        let demande=document.getElementById("demande")
        let inscrit=document.getElementById("inscrit")
        demande.addEventListener("click",function(){
            if(utilisateursNames.indexOf(search.value)!=-1){
                let userId = utilisateurs[utilisateursNames.indexOf(search.value)]
                if(utilisateurs.indexOf(userId)!=-1){
                    utilisateurs2=[]
                    for(let loop in users){
                        utilisateurs2.push(users[loop].name)
                    }
        
                    if(utilisateurs2.indexOf(userId)===-1){
                        searchUser(userId,false,"---")
                        users.sort((a, b) => (a.name > b.name) ? 1 : -1)
                        utilisateurs2=[]
                        for(let loop in users){
                            utilisateurs2.push(users[loop].name)
                        }
        
                        database.ref(path(j,h)+"/demandes/"+userId+"/user").set(0)
        
                        table.insertRow(utilisateurs2.indexOf(userId))
                        let ligne=table.children[utilisateurs2.indexOf(userId)]
                        reloadLigne(ligne,utilisateurs2.indexOf(userId))
                    }else if(users[utilisateurs2.indexOf(userId)].DorI===true){
                        users[utilisateurs2.indexOf(userId)].DorI=false
                        users[utilisateurs2.indexOf(userId)].pass="---"
                        database.ref(path(j,h)+"/inscrits/"+userId).once('value').then(function(snapshot){
                            database.ref(path(j,h)+"/demandes/"+userId).set(snapshot.val())
                            database.ref(path(j,h)+"/demandes/"+userId+"/scan").remove()
                            database.ref(path(j,h)+"/inscrits/"+userId).remove()
                        })
                        database.ref("users/"+userId+"/score/").once('value').then(function(snapshot){
                            snapshot.forEach(function(hash){
                                if(snapshot.child(hash.key+"/name").val()==="Repas du " + dayLowerCase[j] + " " + getDayText(j) +  " à " + (11 + h) + "h"){
                                    database.ref("users/"+userId+"/score/"+hash.key).remove()
                                }
                            })
                        })
                        let ligne=table.children[utilisateurs2.indexOf(userId)]
                        reloadLigne(ligne,utilisateurs2.indexOf(userId))
                    }
                }
            }
        })
        inscrit.addEventListener("click",function(){
            if(utilisateursNames.indexOf(search.value)!=-1){
                let userId = utilisateurs[utilisateursNames.indexOf(search.value)]
                if(utilisateurs.indexOf(userId)!=-1){
                    utilisateurs2=[]
                    for(let loop in users){
                        utilisateurs2.push(users[loop].name)
                    }
        
                    let hashCode = hash()
                    if(utilisateurs2.indexOf(userId)===-1){
                        searchUser(userId,true,snapshot.child("inscrits/"+userId+"/scan").val())
                        users.sort((a, b) => (a.name > b.name) ? 1 : -1)
                        utilisateurs2=[]
                        for(let loop in users){
                            utilisateurs2.push(users[loop].name)
                        }
        
                        if(ouvert==2||ouvert==3||ouvert==5){    
                            database.ref("users").once('value').then(function(snapshot){
                                database.ref(path(j,h)).once('value').then(function(snapshotP) {
                                    let hashCode = hash()
                                    let classeUser = snapshot.child(userId+"/classe").val()
                                    let prioUser = []
                                    snapshot.child(userId+"/priorites").forEach(function(child2){
                                        prioUser.push(child2.key)
                                    })
                                    let prio = []
                                    snapshotP.child("prioritaires").forEach(function(child2){
                                        prio.push(child2.key)
                                    })
                                    if(snapshotP.child('gratuit prioritaires').val() && (commonElement(prioUser, prio) != 0 || prio.indexOf(classeUser) != -1)){
                                        
                                    } else {
                                        database.ref("users/" + userId + "/score/" + hashCode + "/name").set("Repas du " + dayLowerCase[j] + " " + getDayText(j) +  " à " + (11 + h) + "h")
                                        database.ref("users/" + userId + "/score/" + hashCode + "/value").set(-cout)
                                    }
                                })
                            })
                        }
                        database.ref(path(j,h)+"/inscrits/"+userId+"/user").set(0)
        
                        table.insertRow(utilisateurs2.indexOf(userId))
                        let ligne=table.children[utilisateurs2.indexOf(userId)]
                        reloadLigne(ligne,utilisateurs2.indexOf(userId))
                    }else if(users[utilisateurs2.indexOf(userId)].DorI===false){
                        users[utilisateurs2.indexOf(userId)].DorI=true
                        users[utilisateurs2.indexOf(userId)].pass="No scan"
                        database.ref(path(j,h)+"/demandes/"+userId).once('value').then(function(snapshot){
                            database.ref(path(j,h)+"/inscrits/"+userId).set(snapshot.val())
                            database.ref(path(j,h)+"/demandes/"+userId).remove()
                        })
        
                        
                        if(ouvert==2||ouvert==3||ouvert==5){    
                            database.ref("users").once('value').then(function(snapshot){
                                database.ref(path(j,h)).once('value').then(function(snapshotP) {
                                    let hashCode = hash()
                                    let classeUser = snapshot.child(userId+"/classe").val()
                                    let prioUser = []
                                    snapshot.child(userId+"/priorites").forEach(function(child2){
                                        prioUser.push(child2.key)
                                    })
                                    let prio = []
                                    snapshotP.child("prioritaires").forEach(function(child2){
                                        prio.push(child2.key)
                                    })
                                    if(snapshotP.child('gratuit prioritaires').val() && (commonElement(prioUser, prio) != 0 || prio.indexOf(classeUser) != -1)){
                                        
                                    } else {
                                        database.ref("users/" + userId + "/score/" + hashCode + "/name").set("Repas du " + dayLowerCase[j] + " " + getDayText(j) +  " à " + (11 + h) + "h")
                                        database.ref("users/" + userId + "/score/" + hashCode + "/value").set(-cout)
                                    }
                                })
                            })
                        }
                        let ligne=table.children[utilisateurs2.indexOf(userId)]
                        reloadLigne(ligne,utilisateurs2.indexOf(userId))
                    }
                }
            }
        })
    })
})