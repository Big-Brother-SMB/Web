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


users = [];
database.ref(path(j,h)).once("value",function(snapshot){
    database.ref("users").once("value",function(snap){
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
        colI.innerHTML="-------"
        colD.innerHTML="demande"
        colI.addEventListener("click",eventI)
        function eventI(){
            colD.removeEventListener("click",eventD)
            colI.removeEventListener("click",eventI)
            colS.removeEventListener("click",event2)
            database.ref(path(j,h)+"/demandes/"+users[i].name).remove()
            database.ref(path(j,h)+"/inscrits/"+users[i].name).set(0)
            users[i].DorI=true

            let hashCode = hash()
            database.ref("users/" + users[i].name + "/score/" + hashCode + "/name").set("Repas du " + dayLowerCase[j] + " " + getDayText(j) +  " à " + (11 + h) + "h")
            database.ref("users/" + users[i].name + "/score/" + hashCode + "/value").set(-cout)

            reloadLigne(ligne,i)
        }
    } else {
        colI.innerHTML="inscrit"
        colD.innerHTML="-------"
        colD.addEventListener("click",eventD)
        function eventD(){
            colD.removeEventListener("click",eventD)
            colI.removeEventListener("click",eventI)
            colS.removeEventListener("click",event2)
            database.ref(path(j,h)+"/demandes/"+users[i].name).set(0)
            database.ref(path(j,h)+"/inscrits/"+users[i].name).remove()
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
        colD.removeEventListener("click",eventD)
        colI.removeEventListener("click",eventI)
        colS.removeEventListener("click",event2)
        database.ref(path(j,h)+"/inscrits/"+users[i].name).remove()
        database.ref(path(j,h)+"/demandes/"+users[i].name).remove()
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
    this.pass=pass
    this.carte=carte
}


database.ref("users").once("value", function(snapshot) {
    let utilisateurs=[]
    snapshot.forEach(function(child) {
        utilisateurs.push(child.key) 
    })
    autocomplete(document.getElementById("search"), utilisateurs,function(val){
        console.log("test")
    })
})