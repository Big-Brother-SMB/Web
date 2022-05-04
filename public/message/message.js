let divNew = document.getElementById("new msg")
let divOld = document.getElementById("old msg")

let idNew = []
let idOld = []


function addNew(elem, h){
    elem.id = h
    idNew.push(h)
    idNew.sort()
    let index = idNew.indexOf(h)
    if(index + 1 == idNew.length){
        divNew.appendChild(elem);
    }else{
        let idSup = idNew[index + 1]
        let elemSup = document.getElementById(idSup)
        divNew.insertBefore(elem, elemSup)
    }
}

function addOld(elem, h){
    elem.id = h
    idOld.push(h)
    idOld.sort()
    idOld.reverse()
    let index = idOld.indexOf(h)
    if(index + 1 == idOld.length){
        divOld.appendChild(elem);
    }else{
        let idSup = idOld[index + 1]
        let elemSup = document.getElementById(idSup)
        divOld.insertBefore(elem, elemSup)
    }
}

let pNew = document.getElementById("p new")
function newMsg(){
    let nbNew = divNew.childElementCount
    if(nbNew == 0){
        pNew.innerHTML = ""
    }else if(nbNew == 1){
        pNew.innerHTML = "Un nouveau message"
    }else{
        pNew.innerHTML = nbNew + " nouveaux messages"
    }
    
}

//----------------------sondages---------------------

const rep = [
    ["oui","non"],
    ["très satisfait(e)","satisfait(e)","insatisfait(e)","très insatisfait(e)"],
    [1,2,3,4,5,6,7,8,9,10]
]

const color = [
    ["#20ff03","red"],
    ["#20ff03","#b7ff00","#ffae00","red"],
    ["red","#ff3000","#ff7000","#ffa000","#ffd000","#d0ff00","#a0ff00","#70ff00","#30ff00","green"]
]

const size = [
    ["49%","100px"],
    ["24%","100px"],
    ["9.9%","100px"]
]


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
                    if(mode < 0){
                        database.ref("sondages/" + h + "/choices").once('value').then(function(snapshot) {
                            let choices = []
                            snapshot.forEach(function(child) {
                                choices.push(child.key)
                            })
                            sondage(h, text, mode,reponse,choices)
                        })
                    }else{
                        sondage(h, text, mode,reponse,null)
                    }
                    
                })
                
                
                
            })
        })

        
    })
})





let numRadio = 0
function sondage(h, text, mode, reponse,choices){
    let msg = document.createElement("div")
    msg.className = "msg"

    if(reponse != null){
        
        hide()
                    
              
    }else{
        display()
        addNew(msg, h)
        //divNew.appendChild(msg);
        newMsg()
    }

    function hide(){
        msg.innerHTML = ""
        let nameRep = "Pas de réponse"
        if(isNaN(parseInt(reponse))){
            nameRep = reponse
        }else if(reponse != -1){
            nameRep = rep[mode][reponse]
            if(mode == 2){
                nameRep += "/10"
            }
        }
        let p = document.createElement("p")
        p.innerHTML = "Sondage (" + text + ")<br>réponse : " + nameRep
        p.className = "text"
        msg.appendChild(p);
        msg.addEventListener("click",event)
        function event(){
            msg.removeEventListener("click", event)
            display()
        }
        if(!divOld.contains(msg)){
            addOld(msg, h)
            //divOld.appendChild(msg);
            newMsg()
        }
        
    }

    

    function display(){
        msg.innerHTML = ""
        let p = document.createElement("p")
        p.innerHTML = text + "<br><br>Propositions : "
        p.className = "text"
        msg.appendChild(p);
    
       
        let divRep = document.createElement("div")
        
        if(mode < 0){
            let num = numRadio
            numRadio++
            divRep.className = "divVerticale"
            let other = false
            if(choices.indexOf("other") != -1){
                other = true
            }

            let checked = -1
            if(reponse != -1 && reponse != null){
                checked = choices.indexOf(reponse)
                if(checked == -1){
                    checked--
                }
            }

            for(let i in choices){
                if(choices[i] != "other"){
                    let bRep = document.createElement("p")
                    bRep.innerHTML = "<p><input type=\"radio\" name=\"choices" + num + "\"" + (i == checked?"checked":"") +"> " + choices[i] + "</p>"
                    
            
                    bRep.addEventListener("mouseup", function() {
                        reponse = choices[i]
                        database.ref("sondages/" + h + "/users/" + user).set(choices[i])
                        hide()
                    })
            
                    divRep.appendChild(bRep);
                }
                
            }

            if(other){
                let bRep = document.createElement("p")
                bRep.innerHTML = "<p><input type=\"radio\" name=\"choices" + num + "\"" + (checked == -2?"checked":"") +"> Autre (écrire sa proposition)</p>"
                let divOther = document.createElement("div")
                
                

                //divOther.innerHTML = "<textarea id=\"textarea\"></textarea><button id=\"valider\">Valider</button>"
                bRep.addEventListener("click", function() {
                    text()
                })

                if(checked == -2){
                    text()
                }

                function text(){
                    let textarea = document.createElement("textarea")
                    textarea.id = "textarea"
                    divOther.appendChild(textarea);
                    let valider = document.createElement("button")
                    valider.innerHTML = "Valider"
                    divOther.appendChild(valider);
                    if(checked == -2){
                        textarea.value = reponse
                    }
                    valider.addEventListener("mouseup", function() {
                        const text = textarea.value
                        if(text != ""){
                            reponse = text
                            database.ref("sondages/" + h + "/users/" + user).set(text)
                            hide()
                        }
                    })
                }

                divRep.appendChild(bRep);
                divRep.appendChild(divOther);
        
                
                
            }

        }else{
            divRep.className = "divRep"
            for(let i in rep[mode]){

                let bRep = document.createElement("button")
                bRep.innerHTML = rep[mode][i]
                bRep.className = "rep"
                bRep.style.backgroundColor = color[mode][i]
                bRep.style.width = size[mode][0]
                bRep.style.height = size[mode][1]
        
                bRep.addEventListener("mouseup", function() {
                    reponse = i
                    database.ref("sondages/" + h + "/users/" + user).set(i)
                    hide()
                })
        
                divRep.appendChild(bRep);
            }
        }
        
        msg.appendChild(divRep);
    
        let jsp = document.createElement("button")
        jsp.innerHTML = "Pas de réponse"
        jsp.className = "rep"
    
        jsp.addEventListener("mouseup", function() {
            reponse = -1
            database.ref("sondages/" + h + "/users/" + user).set(-1)
            hide()
        })
    
        msg.appendChild(jsp);
    }
    
    
}


//------------------------------news---------------------------------

database.ref("news").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        let h = child.key
        database.ref("news/" + h + "/title").once('value').then(function(snapshot) {
            let title = snapshot.val()
            database.ref("news/" + h + "/text").once('value').then(function(snapshot) {
                let text = snapshot.val()
                database.ref("news/" + h + "/users/" + user).once('value').then(function(snapshot) {
                    let lu = snapshot.val() != null
                    news(h, title, text,lu)
                })
            })
                
            
        })

        
    })
})


function news(h,title,text,lu){
    let msg = document.createElement("div")
    msg.className = "msg"
    if(lu){
        hide()               
    }else{
        display()
        addNew(msg, h)
        //divNew.appendChild(msg);
        newMsg()
    }

    function hide(){
        msg.innerHTML = ""
        let p = document.createElement("p")
        p.innerHTML = title
        p.className = "text title"
        msg.appendChild(p);
        msg.addEventListener("click",event)
        function event(){
            msg.removeEventListener("click", event)
            display()
        }
        if(!divOld.contains(msg)){
            addOld(msg, h)
            //divOld.appendChild(msg);
            newMsg()
        }
        
    }

    

    function display(){
        msg.innerHTML = ""
        let p = document.createElement("p")
        p.innerHTML = title
        p.className = "text title"
        msg.appendChild(p);

        let main = document.createElement("p")
        main.innerHTML = text
        main.className = "text"
        msg.appendChild(main);
    
        let lu = document.createElement("button")
        lu.innerHTML = "marquer comme lu"
        lu.className = "rep"
    
        lu.addEventListener("mouseup", function() {
            database.ref("news/" + h + "/users/" + user).set(0)
            hide()
        })
    
        msg.appendChild(lu);
    }
}



//------------------------------msg---------------------------------

database.ref("users/" + user + "/messages").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        let h = child.key
        database.ref("users/" + user + "/messages/" + h + "/title").once('value').then(function(snapshot) {
            let title = snapshot.val()
            database.ref("users/" + user + "/messages/" + h + "/text").once('value').then(function(snapshot) {
                let text = snapshot.val()
                database.ref("users/" + user + "/messages/" + h + "/lu").once('value').then(function(snapshot) {
                    let lu = snapshot.val() != null
                    message(h, title, text,lu)
                })
            })
                
            
        })

        
    })
})


function message(h,title,text,lu){
    let msg = document.createElement("div")
    msg.className = "msg"
    if(lu){
        hide()               
    }else{
        display()
        addNew(msg, h)
        newMsg()
    }

    function hide(){
        msg.innerHTML = ""
        let p = document.createElement("p")
        p.innerHTML = "MP : " + title
        p.className = "text"
        msg.appendChild(p);
        msg.addEventListener("click",event)
        function event(){
            msg.removeEventListener("click", event)
            display()
        }
        if(!divOld.contains(msg)){
            addOld(msg, h)
            newMsg()
        }
        
    }

    

    function display(){
        msg.innerHTML = ""

        let prive = document.createElement("p")
        prive.innerHTML = "message prive"
        prive.className = "text"
        msg.appendChild(prive);

        let p = document.createElement("p")
        p.innerHTML = title
        p.className = "text"
        msg.appendChild(p);

        let main = document.createElement("p")
        main.innerHTML = text
        main.className = "text"
        msg.appendChild(main);
    
        let lu = document.createElement("button")
        lu.innerHTML = "marquer comme lu"
        lu.className = "rep"
    
        lu.addEventListener("mouseup", function() {
            database.ref("users/" + user + "/messages/" + h + "/lu").set(0)
            hide()
        })
        msg.appendChild(lu);

        let repondre = document.createElement("button")
        repondre.innerHTML = "repondre"
        repondre.className = "rep"
    
        repondre.addEventListener("mouseup", function() {
            database.ref("users/" + user + "/messages/" + h + "/lu").set(0)
            hide()
            iconSend.style.visibility = "hidden"
            divSend.style.visibility = "visible"
        })
    
        msg.appendChild(repondre);
    }
}



//----------------------------send---------------------------


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

const listType = ["Question","Problème","Erreur/Bug","Suggestion","Autre"]

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