import * as common from "../common.js";

let divNew = document.getElementById("new msg")
let divOld = document.getElementById("old msg")

let idNew = []
let idOld = []

let varAllMsg = await  common.socketAsync("my msgs",null)
console.log(varAllMsg)

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

varAllMsg.sondage.forEach(function(child) {
    let h = child.date
    let text = child.texte
    let mode = child.mode
    let id = child.id
    if(mode == null){
        mode = 0
    }
    let reponse = child.rep
    if(mode == 3){
        let choices = []
        choices = child.choix.split('/')
        sondage(h, text, mode,reponse,choices,id)
    }else{
        reponse = parseInt(reponse)
        sondage(h, text, mode,reponse,null,id)
    }
})





let numRadio = 0
function sondage(h, text, mode, reponse,choices,id){
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
                        common.socketAsync("rep sondage",{id:id,rep:reponse})
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
                            common.socketAsync("rep sondage",{id:id,rep:reponse})
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
                    common.socketAsync("rep sondage",{id:id,rep:reponse})
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
            common.socketAsync("rep sondage",{id:id,rep:reponse})
            hide()
        }

        msg.appendChild(jsp);
    }


}


//------------------------------news---------------------------------

varAllMsg.news.forEach(function(child) {
    let h = child.date
    let text = child.texte
    let title = child.title
    let lu = child.lu
    let id = child.id
    news(h, title, text,lu,id)
})


function news(h,title,text,lu,id){
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
            common.socketAsync("msg lu",id)
            addOld(msg, h)
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

        let btn
        if(lu!=true){
            btn = document.createElement("button")
            btn.innerHTML = "marquer lu"
            btn.className = "rep"
            msg.appendChild(btn);
            btn.addEventListener("mouseup",event)
        }

        function event(){
            if(lu!=true){
                btn.removeEventListener("mouseup", event)
            }
            lu=true
            msg.removeEventListener("click", event)
            hide()
        }
    }
}

//------------------------------my msg---------------------------------
varAllMsg.mp.forEach(function(child) {
    let h = child.date
    let text = child.texte
    let title = child.title
    let lu = child.lu
    let id = child.id
    if(child.from2==common.uuid){
        myMessage(h, title, text,id)
    }else{
        message(h, title, text,lu,id)
    }
})

function myMessage(h,title,text,id){
    let msg = document.createElement("div")
    msg.className = "mymsg"
    hide()

    function hide(){
        msg.innerHTML = ""
        let p = document.createElement("p")
        p.innerHTML = "MP : " + title+"<br>à: modo"
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
        prive.innerHTML = "MP : " + title+"<br>à: modo"
        prive.className = "text"
        msg.appendChild(prive);

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

//------------------------------msg---------------------------------

function message(h,title,text,lu,id){
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
            common.socketAsync("msg lu",id)
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

        let btn
        if(lu!=true){
            btn = document.createElement("button")
            btn.innerHTML = "marquer lu"
            btn.className = "rep"
            msg.appendChild(btn);
            btn.addEventListener("mouseup",event)
        }

        function event(){
            if(lu!=true){
                btn.removeEventListener("mouseup", event)
            }
            lu=true
            msg.removeEventListener("click", event)
            hide()
        }
    }
}



//----------------------------send---------------------------


let iconSend = document.getElementById("iconSend")
let divSend = document.getElementById("divSend")
let modal = document.getElementById('modal')
let overlay = document.getElementById('overlay')

function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active')
  overlay.classList.add('active')
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
}

iconSend.addEventListener("click", function() {
  openModal(modal)
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

send.addEventListener("click", async function() {
    if(title.value != "" && text.value != ""){
        let hashCode = common.hashHour()
        await common.socketAsync("add msg",{title:title.value,texte:text.value.replaceAll('\n',"</br>")})
        myMessage(hashCode, title.value, text.value.replaceAll('\n',"</br>"))
        title.value = ""
        text.value = ""
        closeModal(modal)
    }

})

annuler.addEventListener("click", function() {
    title.value = ""
    text.value = ""
    closeModal(modal)
})

overlay.addEventListener('click', () => {
  const modals = document.querySelectorAll('.modal.active')
  modals.forEach(modal => {
    closeModal(modal)
  })
})

document.getElementById("article").style.display = "inline"
document.getElementById("chargement").style.display = "none"