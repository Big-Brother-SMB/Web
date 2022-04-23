
let divNew = document.getElementById("new msg")
let divOld = document.getElementById("old msg")

const rep = [
    ["oui","non"],
    ["très satisfait(e)","satisfait(e)","insatisfait(e)","très insatisfait(e)"],
    []
]

const color = [
    ["#20ff03","red"],
    ["#20ff03","#b7ff00","#ffae00","red"]
]

const size = [
    ["49%","100px"],
    ["24%","100px"]
]

let nbNew = 0

database.ref("sondages").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        let h = child.key
        database.ref("sondages/" + h + "/text").once('value').then(function(snapshot) {
            let text = snapshot.val()
            database.ref("sondages/" + h + "/mode").once('value').then(function(snapshot) {
                let mode = snapshot.val()
                if(mode == null){
                    mode = 0
                }
                database.ref("sondages/" + h + "/users/" + user).once('value').then(function(snapshot) {
                    let reponse = snapshot.val()
                    if(reponse == null){
                        nbNew++
                        newMsg()
                        sondage(h, text, mode)
                    }else{
                        let nameRep = "je ne sais pas"
                        if(reponse != -1){
                            nameRep = rep[mode][reponse]
                        }
                        oldMsg(h,"sondage (" + text + ") réponse : " + nameRep, 1)
                    }
                })
                
            })
        })





        
    })
})

let pNew = document.getElementById("p new")
function newMsg(){
    if(nbNew == 0){
        pNew.innerHTML = ""
    }else if(nbNew == 1){
        pNew.innerHTML = "Un nouveau message"
    }else{
        pNew.innerHTML = nbNew + " nouveaux messages"
    }
    
}




function sondage(h, text, mode){
    let msg = document.createElement("div")
    msg.className = "msg"

    let p = document.createElement("p")
    p.innerHTML = text
    p.className = "text"
    msg.appendChild(p);

   
    let divRep = document.createElement("div")
    divRep.className = "divRep"
    for(let i in rep[mode]){
        console.log(i)
        let bRep = document.createElement("button")
        bRep.innerHTML = rep[mode][i]
        bRep.className = "rep"
        bRep.style.backgroundColor = color[mode][i]
        bRep.style.width = size[mode][0]
        bRep.style.height = size[mode][1]

        bRep.addEventListener("click", function() {
            msg.remove()
            nbNew--
            newMsg()
            console.log("rep")
            database.ref("sondages/" + h + "/users/" + user).set(i)
            oldMsg(h,"sondage (" + text + ") réponse : " + rep[mode][i], 1)
        })

        divRep.appendChild(bRep);
    }
    msg.appendChild(divRep);

    let jsp = document.createElement("button")
    jsp.innerHTML = "je ne sais pas"
    jsp.className = "rep"

    jsp.addEventListener("click", function() {
        msg.remove()
        nbNew--
        newMsg()
        console.log("rep")
        database.ref("sondages/" + h + "/users/" + user).set(-1)
        oldMsg(h,"sondage (" + text + ") réponse : je ne sais pas", 1)
    })

    msg.appendChild(jsp);


    
    divNew.appendChild(msg);
}


function oldMsg(h,text,type){
    let msg = document.createElement("button")
    msg.className = "msg"
    msg.innerHTML = text
    msg.addEventListener("click", function() {
        msg.remove()
        switch(type){
            case 0:
                break
            case 1:
                database.ref("sondages/" + h + "/text").once('value').then(function(snapshot) {
                    let text = snapshot.val()
                    database.ref("sondages/" + h + "/mode").once('value').then(function(snapshot) {
                        let mode = snapshot.val()
                        if(mode == null){
                            mode = 0
                        }
                        sondage(h, text, mode)
                    })
                })
                
                break

        }
    })
    divOld.appendChild(msg);
}


let iconSend = document.getElementById("iconSend")
let divSend = document.getElementById("divSend")

iconSend.addEventListener("click", function() {
    iconSend.style.visibility = "hidden"
    divSend.style.visibility = "visible"
    
})

let send = document.getElementById("send")
let title = document.getElementById("title")
let type = document.getElementById("type")
let text = document.getElementById("text")

const listType = ["Question","Problème","Erreur/Bug","Sugestion","Demande","Autre"]

for (let i in listType) {
    let opt = document.createElement("option")
    opt.innerHTML = listType[i]
    type.appendChild(opt);
}

send.addEventListener("click", function() {
    if(title.value != "" && text.value != ""){
        let hashCode = hash()
        database.ref("messages/" + hashCode + "/user").set(user)
        database.ref("messages/" + hashCode + "/title").set(title.value)
        database.ref("messages/" + hashCode + "/type").set(listType[type.selectedIndex])
        database.ref("messages/" + hashCode + "/text").set(text.value)
        title.value = ""
        text.value = ""
        iconSend.style.visibility = "visible"
        divSend.style.visibility = "hidden"
    }
    
})



charged(true)