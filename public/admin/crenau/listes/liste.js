/*
database.ref("users").once("value",function(snapshot){
    snapshot.forEach(function(child){
        database.ref(path(j,h)+"/demandes/"+child.key+"/user").set(0)
    })
})
database.ref(path(j,h)+"/inscrits/").remove()
*/
let j = sessionStorage.getItem("j");
let h = parseInt(sessionStorage.getItem("h"));
console.log("hello2");

let table = document.getElementById("tbody")

let cout
let snapshotUser
let ouvert
database.ref(path(j,h)).once("value",function(snapshot){
    database.ref("users").once("value",function(snap){
        users = [];
        snapshotUser=snap

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

            if(ouvert==2||ouvert==3){
                let hashCode = hash()
                database.ref("users/" + users[i].name + "/score/" + hashCode + "/name").set("Repas du " + dayLowerCase[j] + " " + getDayText(j) +  " à " + (11 + h) + "h")
                database.ref("users/" + users[i].name + "/score/" + hashCode + "/value").set(-cout)
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
        })
        users.splice([...table.children].indexOf(ligne),1)
        table.removeChild(ligne)
    }
    ligne.appendChild(colS)
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
    if(pass!=null){
        this.pass=pass
    }else{
        this.pass="Non scan"
    }
    this.carte=carte
}

let search = document.getElementById("search")
database.ref("users").once("value", function(snapshot) {
    let utilisateurs=[]
    let utilisateurs2=[]
    snapshot.forEach(function(child) {
        utilisateurs.push(child.key) 
    })
    autocomplete(search, utilisateurs,function(val){})
    let demande=document.getElementById("demande")
    let inscrit=document.getElementById("inscrit")
    demande.addEventListener("click",function(){
        if(utilisateurs.indexOf(search.value)!=-1){
            utilisateurs2=[]
            for(let loop in users){
                utilisateurs2.push(users[loop].name)
            }

            if(utilisateurs2.indexOf(search.value)===-1){
                searchUser(search.value,false,"---")
                users.sort((a, b) => (a.name > b.name) ? 1 : -1)
                utilisateurs2=[]
                for(let loop in users){
                    utilisateurs2.push(users[loop].name)
                }

                database.ref(path(j,h)+"/demandes/"+search.value+"/user").set(0)

                table.insertRow(utilisateurs2.indexOf(search.value))
                let ligne=table.children[utilisateurs2.indexOf(search.value)]
                reloadLigne(ligne,utilisateurs2.indexOf(search.value))
            }else if(users[utilisateurs2.indexOf(search.value)].DorI===true){
                users[utilisateurs2.indexOf(search.value)].DorI=false
                users[utilisateurs2.indexOf(search.value)].pass="---"
                database.ref(path(j,h)+"/inscrits/"+search.value).once('value').then(function(snapshot){
                    database.ref(path(j,h)+"/demandes/"+search.value).set(snapshot.val())
                    database.ref(path(j,h)+"/demandes/"+search.value+"/scan").remove()
                    database.ref(path(j,h)+"/inscrits/"+search.value).remove()
                })
                database.ref("users/"+search.value+"/score/").once('value').then(function(snapshot){
                    snapshot.forEach(function(hash){
                        if(snapshot.child(hash.key+"/name").val()==="Repas du " + dayLowerCase[j] + " " + getDayText(j) +  " à " + (11 + h) + "h"){
                            database.ref("users/"+search.value+"/score/"+hash.key).remove()
                        }
                    })
                })
                let ligne=table.children[utilisateurs2.indexOf(search.value)]
                reloadLigne(ligne,utilisateurs2.indexOf(search.value))
            }
        }
    })
    inscrit.addEventListener("click",function(){
        if(utilisateurs.indexOf(search.value)!=-1){
            utilisateurs2=[]
            for(let loop in users){
                utilisateurs2.push(users[loop].name)
            }

            let hashCode = hash()
            if(utilisateurs2.indexOf(search.value)===-1){
                searchUser(search.value,true,snapshot.child("inscrits/"+search.value+"/scan").val())
                users.sort((a, b) => (a.name > b.name) ? 1 : -1)
                utilisateurs2=[]
                for(let loop in users){
                    utilisateurs2.push(users[loop].name)
                }

                if(ouvert==2||ouvert==3){
                    database.ref("users/" + search.value + "/score/" + hashCode + "/name").set("Repas du " + dayLowerCase[j] + " " + getDayText(j) +  " à " + (11 + h) + "h")
                    database.ref("users/" + search.value + "/score/" + hashCode + "/value").set(-cout)
                }
                database.ref(path(j,h)+"/inscrits/"+search.value+"/user").set(0)

                table.insertRow(utilisateurs2.indexOf(search.value))
                let ligne=table.children[utilisateurs2.indexOf(search.value)]
                reloadLigne(ligne,utilisateurs2.indexOf(search.value))
            }else if(users[utilisateurs2.indexOf(search.value)].DorI===false){
                users[utilisateurs2.indexOf(search.value)].DorI=true
                users[utilisateurs2.indexOf(search.value)].pass="No scan"
                database.ref(path(j,h)+"/demandes/"+search.value).once('value').then(function(snapshot){
                    database.ref(path(j,h)+"/inscrits/"+search.value).set(snapshot.val())
                    database.ref(path(j,h)+"/demandes/"+search.value).remove()
                })
                if(ouvert==2||ouvert==3){
                    database.ref("users/" + search.value + "/score/" + hashCode + "/name").set("Repas du " + dayLowerCase[j] + " " + getDayText(j) +  " à " + (11 + h) + "h")
                    database.ref("users/" + search.value + "/score/" + hashCode + "/value").set(-cout)
                }
                let ligne=table.children[utilisateurs2.indexOf(search.value)]
                reloadLigne(ligne,utilisateurs2.indexOf(search.value))
            }
        }
    })
})