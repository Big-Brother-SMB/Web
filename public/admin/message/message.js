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
                let reponse=[]
                database.ref("sondages/" + h + "/users").once('value').then(function(snapshot) {
                    snapshot.forEach(function(child){
                        reponse.push(snapshot.child(child.key).val())
                    })
                    if(mode == 3){
                        database.ref("sondages/" + h + "/choices").once('value').then(function(snapshot) {
                            let choices = []
                            snapshot.forEach(function(child) {
                                choices.push(child.key)
                            })
                            console.log(choices)
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
    msg.className = "sondage"
    
    let reponseList=[]
    let moyen=0
    if(mode==0) {
        reponseList=[0,0]
        for(let loop in reponse){
            if(reponse[loop]!=-1 && reponse[loop]>=0 && reponse[loop]<=1){
                reponseList[reponse[loop]]++
            }
        }
    } else if(mode==1) {
        reponseList=[0,0,0,0]
        for(let loop in reponse){
            if(reponse[loop]!=-1 && reponse[loop]>=0 && reponse[loop]<=3){
                reponseList[reponse[loop]]++
            }
        }
    } else if(mode==2) {
        reponseList=[0,0,0,0,0,0,0,0,0,0]
        let tour=0
        let total=0
        for(let loop in reponse){
            if(reponse[loop]!=-1 && reponse[loop]>=0 && reponse[loop]<=9){
                tour++
                total+=reponse[loop]+1
                reponseList[reponse[loop]]++
            }
        }
        moyen=round(total/tour)
    }  else if(mode==3) {
        reponseList=new Map();
        for(let loop in choices){
            reponseList.set(choices[loop],0)
        }
        let tour=0
        let x=""
        for(let loop in reponse){
            if(reponse[loop]!=-1){
                tour++
                x=reponseList.get(reponse[loop])
                reponseList.set(reponse[loop]+1)
            }
        }
    }
    console.log(reponseList)
    console.log(moyen)


    hide()
    function hide(){
        msg.innerHTML = ""
        let nameRep = "aucune"

        if(reponse.length!=0){
            if(mode==0) {
                nameRep="voir plus"
            } else if(mode==1) {
                nameRep="voir plus"
            } else if(mode==2) {
                nameRep=moyen+"/10"
            }  else if(mode==3) {
                nameRep="voir plus"
            }
        }
        
        let p = document.createElement("p")
        p.innerHTML = "Sondage (" + text + ")<br>réponses : " + nameRep
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
                    
            
                    bRep.addEventListener("mouseup", function() {
                        reponse = choices[i]
                        //database.ref("sondages/" + h + "/users/" + user).set(choices[i])
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
                    otherText()
                })

                if(checked == -2){
                    otherText()
                }

                function otherText(){
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
                            //database.ref("sondages/" + h + "/users/" + user).set(text)
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
                    //database.ref("sondages/" + h + "/users/" + user).set(i)
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
            //database.ref("sondages/" + h + "/users/" + user).set(-1)
            hide()
        })
    
        msg.appendChild(jsp);

        msg.addEventListener("click",event)
        function event(){
            hide()
        }
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
                news(h, title, text)
            })
        })
    })
})


function news(h,title,text){
    let msg = document.createElement("div")
    msg.className = "news"
    hide()   

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
    
        msg.addEventListener("click",event)
        function event(){
            hide()
        }
    }
}

//------------------------------my msg---------------------------------

database.ref("users/").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        let user = child.key
        database.ref("users/" + user + "/messages").once('value').then(function(snapshot) {
            snapshot.forEach(function(child) {
                let h = child.key
                database.ref("users/" + user + "/messages/" + h + "/title").once('value').then(function(snapshot) {
                    let title = snapshot.val()
                    database.ref("users/" + user + "/messages/" + h + "/text").once('value').then(function(snapshot) {
                        let text = snapshot.val()
                        database.ref("users/" + user + "/messages/" + h + "/lu").once('value').then(function(snapshot) {
                            let lu = snapshot.val()
                            if (lu!=true) lu=false;
                            myMessage(h,title,text, user,lu)
                        })
                    })
                })
            })
        })
    })
})

function myMessage(h,title,text,user,lu){
    let textLu
    if(lu){
        textLu = "lu"
    } else {
        textLu = "non lu"
    }
    let msg = document.createElement("div")
    msg.className = "mymsg"
    hide()

    function hide(){
        msg.innerHTML = ""
        let p = document.createElement("p")
        p.innerHTML = "MP["+ textLu +"] : " + title +"<br>à: "+user
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
        prive.innerHTML = "MP["+ textLu +"] : " + title +"<br>à: "+user
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

database.ref("messages/").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        let user = child.key
        database.ref("messages/" + user).once('value').then(function(snapshot) {
            snapshot.forEach(function(child) {
                let h = child.key
                database.ref("messages/" + user + "/" + h + "/title").once('value').then(function(snapshot) {
                    let title = snapshot.val()
                    database.ref("messages/" + user + "/" + h + "/text").once('value').then(function(snapshot) {
                        let text = snapshot.val()
                        database.ref("messages/" + user + "/" + h + "/type").once('value').then(function(snapshot) {
                            let type = snapshot.val()
                            database.ref("messages/" + user + "/" + h + "/lu").once('value').then(function(snapshot) {
                                let lu = snapshot.val()
                                if (lu!=true) lu=false;
                                message(h, title, text, user, type,lu)
                            })
                        })
                    }) 
                })
            })
        })
    })
})


function message(h,title,text, user, type,lu){
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
        p.innerHTML = type + " : " + title +"<br>De: "+user
        p.className = "text"
        msg.appendChild(p);
        msg.addEventListener("click",event)
        function event(){
            msg.removeEventListener("click",event)
            display()
        }
        if(!divOld.contains(msg)){
            database.ref("messages/" + user + "/" + h + "/lu").set(true)
            addOld(msg, h)
            newMsg()
        }
        
    }

    

    function display(){
        msg.innerHTML = ""
        let prive = document.createElement("p")
        prive.innerHTML = type+" : "+title +"<br>De: "+user
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
let iconNews = document.getElementById("iconNews")
let iconSondage = document.getElementById("iconSondage")
let divSend = document.getElementById("divSend")

let send = document.getElementById("send")
let annuler = document.getElementById("annuler")
let title = document.getElementById("title2")
let text = document.getElementById("text")
let destinataire = document.getElementById("as")
let type = document.getElementById("type")

let destinataire2 = document.getElementById("as2")
let type2 = document.getElementById("type2")

let icon

iconSend.addEventListener("click", function() {
    icon = 0

    iconSend.style.visibility = "hidden"
    iconSondage.style.visibility = "visible"
    iconNews.style.visibility = "visible"

    divSend.style.visibility = "visible"
    divSend.style.height = "auto"

    destinataire2.style.visibility = "visible"
    type2.style.visibility = "hidden"
})
iconNews.addEventListener("click", function() {
    icon = 1

    iconNews.style.visibility = "hidden"
    iconSend.style.visibility = "visible"
    iconSondage.style.visibility = "visible"

    divSend.style.visibility = "visible"
    divSend.style.height = "auto"

    destinataire2.style.visibility = "hidden"
    type2.style.visibility = "hidden"
})
iconSondage.addEventListener("click", function() {
    icon = 2

    iconSondage.style.visibility = "hidden"
    iconSend.style.visibility = "visible"
    iconNews.style.visibility = "visible"

    divSend.style.visibility = "visible"
    divSend.style.height = "auto"

    destinataire2.style.visibility = "hidden"
    type2.style.visibility = "visible"
})

let usersList = []
database.ref("users/").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        usersList.push(child.key)
    })
    autocomplete(destinataire, usersList);
})

send.addEventListener("click", function() {
    if(title.value != "" && text.value != ""){
        let hashCode = hash()
        if(icon==0 && usersList.indexOf(destinataire.value)!=-1){
            database.ref("users/" + destinataire.value +"/messages/"+ hashCode + "/title").set(title.value)
            database.ref("users/" + destinataire.value +"/messages/"+ hashCode + "/text").set(text.value)
            myMessage(hashCode, title.value, text.value,destinataire.value,false)
            title.value = ""
            destinataire.value = ""
            text.value = ""
            iconSend.style.visibility = "visible"
            iconNews.style.visibility = "visible"
            iconSondage.style.visibility = "visible"
            destinataire2.style.visibility = "hidden"
            type2.style.visibility = "hidden"
            divSend.style.visibility = "hidden"
            divSend.style.height = "0px"
        }
        if(icon==1){
            database.ref("news/" + hashCode + "/title").set(title.value)
            database.ref("news/" + hashCode + "/text").set(text.value)
            news(hashCode, title.value, text.value)
            title.value = ""
            destinataire.value = ""
            text.value = ""
            iconSend.style.visibility = "visible"
            iconNews.style.visibility = "visible"
            iconSondage.style.visibility = "visible"
            destinataire2.style.visibility = "hidden"
            type2.style.visibility = "hidden"
            divSend.style.visibility = "hidden"
            divSend.style.height = "0px"
        }
        if(icon==2){
            /*database.ref("users/" + destinataire.value +"/messages/"+ hashCode + "/title").set(title.value)
            database.ref("users/" + destinataire.value +"/messages/"+ hashCode + "/text").set(text.value)
            myMessage(hashCode, title.value, text.value,destinataire.value,false)
            title.value = ""
            destinataire.value = ""
            text.value = ""
            iconSend.style.visibility = "visible"
            iconNews.style.visibility = "visible"
            iconSondage.style.visibility = "visible"
            destinataire2.style.visibility = "hidden"
            type2.style.visibility = "hidden"
            divSend.style.visibility = "hidden"
            divSend.style.height = "0px"*/
        }
    }
    
})

annuler.addEventListener("click", function() {
    title.value = ""
    destinataire.value = ""
    text.value = ""
    iconSend.style.visibility = "visible"
    iconNews.style.visibility = "visible"
    iconSondage.style.visibility = "visible"
    destinataire2.style.visibility = "hidden"
    type2.style.visibility = "hidden"
    divSend.style.visibility = "hidden"
    divSend.style.height = "0px"
})



charged(true)