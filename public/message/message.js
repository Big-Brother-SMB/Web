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
        let text = snapshot.child(h+"/text").val()
        let mode = snapshot.child(h+"/mode").val()
        if(mode == null){
            mode = 0
        }
        let reponse = snapshot.child(h + "/users/" + user).val()
        if(mode == 3){
            let choices = []
            snapshot.child(h + "/choices").forEach(function(child) {
                choices.push(child.key)
            })
            sondage(h, text, mode,reponse,choices)
        }else{
            sondage(h, text, mode,reponse,null)
        }
    })
})





let numRadio = 0
function sondage(h, text, mode, reponse,choices){
    let msg = document.createElement("div")
    msg.className = "sondage"

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
        if("number"!=typeof reponse){
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
        
        if(mode == 3){
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
                    
            
                    bRep.addEventListener("mouseup",event)
                    
                    function event() {
                        bRep.removeEventListener("mouseup",event)
                        reponse = choices[i]
                        database.ref("sondages/" + h + "/users/" + user).set(choices[i])
                        hide()
                    }
            
                    divRep.appendChild(bRep);
                }
                
            }

            if(other){
                let bRep = document.createElement("p")
                bRep.innerHTML = "<p><input type=\"radio\" name=\"choices" + num + "\"" + (checked == -2?"checked":"") +"> Autre (écrire sa proposition)</p>"
                let divOther = document.createElement("div")
                
                

                //divOther.innerHTML = "<textarea id=\"textarea\"></textarea><button id=\"valider\">Valider</button>"
                bRep.addEventListener("click",event)
                
                function event() {
                    bRep.removeEventListener("click", event)
                    otherText()
                }

                if(checked == -2){
                    otherText()
                }

                function otherText(){
                    let textarea = document.createElement("textarea")
                    textarea.id = "textarea"
                    divOther.innerHTML=""
                    divOther.appendChild(textarea);
                    let valider = document.createElement("button")
                    valider.innerHTML = "Valider"
                    valider.className="rep"
                    divOther.appendChild(valider);
                    if(checked == -2){
                        textarea.value = reponse
                    }
                    valider.addEventListener("mouseup",event2)
                    function event2() {
                        valider.removeEventListener("mouseup", event2)
                        const text = textarea.value
                        if(text != ""){
                            reponse = text
                            database.ref("sondages/" + h + "/users/" + user).set(text)
                            hide()
                        }
                    }
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
        
                bRep.addEventListener("mouseup",event)
                function event() {
                    bRep.removeEventListener("mouseup", event)
                    reponse = parseInt(i)
                    database.ref("sondages/" + h + "/users/" + user).set(parseInt(i))
                    hide()
                }
        
                divRep.appendChild(bRep);
            }
        }
        
        msg.appendChild(divRep);
    
        let jsp = document.createElement("button")
        jsp.innerHTML = "Pas de réponse"
        jsp.className = "rep"
    
        jsp.addEventListener("mouseup",event3)
        function event3() {
            jsp.removeEventListener("mouseup", event3)
            reponse = -1
            database.ref("sondages/" + h + "/users/" + user).set(-1)
            hide()
        }
    
        msg.appendChild(jsp);
    }
    
    
}


//------------------------------news---------------------------------

database.ref("news").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        let h = child.key
        let title = snapshot.child(h+"/title").val()
        let text = snapshot.child(h+"/text").val()
        let lu = snapshot.child(h + "/users/" + user).val() != null
        news(h, title, text,lu)         
    })
})


function news(h,title,text,lu){
    let msg = document.createElement("div")
    msg.className = "news"
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
            database.ref("news/" + h + "/users/" + user).set(true)
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
    
        msg.addEventListener("click",event)
        function event(){
            msg.removeEventListener("click", event)
            hide()
        }
    }
}

//------------------------------my msg---------------------------------

database.ref("messages/" + user).once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        let h = child.key
        let title = snapshot.child(h+"/title").val()
        let text = snapshot.child(h+"/text").val()
        let type = snapshot.child(h+"/type").val()
        myMessage(h, title, text, type)
    })
})

function myMessage(h,title,text,type){
    let msg = document.createElement("div")
    msg.className = "mymsg"
    hide()

    function hide(){
        msg.innerHTML = ""
        let p = document.createElement("p")
        p.innerHTML = type + " : " + title+"<br>à: modo"
        p.className = "text"
        msg.appendChild(p);
        msg.addEventListener("click",event)
        function event(){
            msg.removeEventListener("click",event)
            display()
        }
        if(!divOld.contains(msg)){
            addOld(msg, h)
        }
        
    }

    

    function display(){
        msg.innerHTML = ""

        let prive = document.createElement("p")
        prive.innerHTML = type + " : " + title+"<br>à: modo"
        prive.className = "text"
        msg.appendChild(prive);

        let main = document.createElement("p")
        main.innerHTML = text
        main.className = "text"
        msg.appendChild(main);
    
        msg.addEventListener("click",event)
        function event(){
            msg.removeEventListener("click",event)
            hide()
        }
    }
}

//------------------------------msg---------------------------------

database.ref("users/" + user + "/messages").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        let h = child.key
        let title = snapshot.child(h+"/title").val()
        let text = snapshot.child(h+"/text").val()
        let lu = snapshot.child(h+"/lu").val() != null
        message(h, title, text,lu)
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
        p.innerHTML = "MP : " + title+"<br>De: modo"
        p.className = "text"
        msg.appendChild(p);
        msg.addEventListener("click",event)
        function event(){
            msg.removeEventListener("click",event)
            display()
        }
        if(!divOld.contains(msg)){
            database.ref("users/" + user + "/messages/" + h + "/lu").set(true)
            addOld(msg, h)
            newMsg()
        }
        
    }

    

    function display(){
        msg.innerHTML = ""

        let prive = document.createElement("p")
        prive.innerHTML = "MP : " + title+"<br>De: modo"
        prive.className = "text"
        msg.appendChild(prive);

        let main = document.createElement("p")
        main.innerHTML = text
        main.className = "text"
        msg.appendChild(main);

        msg.addEventListener("click",event)
        function event(){
            msg.removeEventListener("click",event)
            hide()
        }
    }
}



//----------------------------send---------------------------


let iconSend = document.getElementById("iconSend")
let divSend = document.getElementById("divSend")

iconSend.addEventListener("click", function() {
    iconSend.style.visibility = "hidden"
    divSend.style.visibility = "visible"
    divSend.style.height = "auto"
})

let send = document.getElementById("send")
let annuler = document.getElementById("annuler")
let title = document.getElementById("title2")
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
        database.ref("messages/" + user +"/"+ hashCode + "/title").set(title.value)
        database.ref("messages/" + user +"/"+ hashCode + "/type").set(listType[type.selectedIndex])
        database.ref("messages/" + user +"/"+ hashCode + "/text").set(text.value.replaceAll('\n',"</br>"))
        myMessage(hashCode, title.value, text.value.replaceAll('\n',"</br>"), listType[type.selectedIndex])
        title.value = ""
        text.value = ""
        iconSend.style.visibility = "visible"
        divSend.style.visibility = "hidden"
        divSend.style.height = "0px"
    }
    
})

annuler.addEventListener("click", function() {
    title.value = ""
    text.value = ""
    iconSend.style.visibility = "visible"
    divSend.style.visibility = "hidden"
    divSend.style.height = "0px"
})



charged(true)