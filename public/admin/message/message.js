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
        let reponse=[]
        snapshot.child(h + "/users/").forEach(function(child){
            reponse.push(snapshot.child(h + "/users/"+child.key).val())
        })
        if(mode == 3){
            let choices = []
            snapshot.child(h + "/choices").forEach(function(child) {
                choices.push(child.key)
            })
        }else{
            sondage(h, text, mode,reponse,null)
        }
    })
})

function sondage(h, text, mode, reponse,choices){
    let msg = document.createElement("div")
    msg.className = "sondage"
    
    let reponseList=[]
    let moyen=0
    let tour=0
    if(mode==0) {
        reponseList=[0,0]
        for(let loop in reponse){
            if(reponse[loop]!=-1 && reponse[loop]>=0 && reponse[loop]<=1){
                tour++
                reponseList[reponse[loop]]++
            }
        }
    } else if(mode==1) {
        reponseList=[0,0,0,0]
        for(let loop in reponse){
            if(reponse[loop]!=-1 && reponse[loop]>=0 && reponse[loop]<=3){
                tour++
                reponseList[reponse[loop]]++
            }
        }
    } else if(mode==2) {
        reponseList=[0,0,0,0,0,0,0,0,0,0]
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
        let x=0
        for(let loop in reponse){
            if(reponse[loop]!=-1){
                tour++
                x=reponseList.get(reponse[loop])
                reponseList.set(reponse[loop],x+1)
            }
        }
    }

    hide()
    function hide(){
        msg.innerHTML = ""
        let nameRep = "aucune"

        if(reponse.length!=0){
            if(mode==0) {
                if(reponseList[0]>reponseList[1]){
                    nameRep="oui"
                } else if(reponseList[0]<reponseList[1]) {
                    nameRep="non"
                } else {
                    nameRep="="
                }
            } else if(mode==1) {
                if(reponseList[0]+reponseList[1]>reponseList[2]+reponseList[3]){
                    nameRep="satisfait"
                } else if(reponseList[0]+reponseList[1]<reponseList[2]+reponseList[3]) {
                    nameRep="non satisfait"
                } else {
                    nameRep="="
                }
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
        p.innerHTML = text + "</br><br>Propositions(" +tour+" voie): "
        p.className = "text"
        msg.appendChild(p);
    
       
        let divRep = document.createElement("div")
        divRep.className = "divVerticale"
        
        if(mode == 3){
            for(let i in choices){
                if(choices[i] != "other"){
                    let bRep = document.createElement("p")
                    bRep.innerHTML = "<p>"+choices[i]+" : "+(round(reponseList.get(choices[i])/tour)*100)+"%</p>"            
                    divRep.appendChild(bRep);
                }
            }

            let bRep = document.createElement("p")
            let textOther=""
            for(let i in reponse){
                if(choices.indexOf(reponse[i])==-1){
                    textOther+="<p> >>>"+reponse[i]+"</p>"
                }
            }
            bRep.innerHTML = textOther
            divRep.appendChild(bRep);

        }else{
            for(let i in rep[mode]){
                let bRep = document.createElement("p")
                bRep.innerHTML = "<p>"+rep[mode][i]+" : "+(round(reponseList[i]/tour)*100)+"%</p>"            
                divRep.appendChild(bRep);
            }
        }
        
        msg.appendChild(divRep);

        msg.addEventListener("click",event)
        function event(){
            msg.removeEventListener("click",event)
            hide()
        }
    }
    
    
}


//------------------------------news---------------------------------

database.ref("news").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        let h = child.key
        let title = snapshot.child(h+"/title").val()
        let text = snapshot.child(h+"/text").val()
        news(h, title, text)         
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
            msg.removeEventListener("click", event)
            hide()
        }
    }
}

//------------------------------my msg---------------------------------
let usersList = []
database.ref("users/").once('value').then(function(snapshot1) {
    snapshot1.forEach(function(child) {
        usersList.push(child.key)
    })
    autocomplete(destinataire, usersList);
    snapshot1.forEach(function(child) {
        let user = child.key
        let snapshot=snapshot1.child(user + "/messages")
        snapshot.forEach(function(child) {
            let h = child.key
            let title = snapshot.child(h+"/title").val()
            let text = snapshot.child(h+"/text").val()
            let lu = snapshot.child(h+"/lu").val()
            myMessage(h, title, text, user, lu)
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

database.ref("messages/").once('value').then(function(snapshot1) {
    snapshot1.forEach(function(child) {
        let user = child.key
        let snapshot=snapshot1.child(user)
        snapshot.forEach(function(child) {
            let h = child.key
            let title = snapshot.child(h+"/title").val()
            let text = snapshot.child(h+"/text").val()
            let type = snapshot.child(h+"/type").val()
            let lu = snapshot.child(h+"/lu").val()
            message(h, title, text, user, type, lu)
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

let modal = document.getElementById('modal')
let overlay = document.getElementById('overlay')
let titleUp = document.getElementById('title pop up')
let logoUp = document.getElementById('logo pop up')

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


let send = document.getElementById("send")
let annuler = document.getElementById("annuler")
let title = document.getElementById("title2")
let text = document.getElementById("text")
let destinataire = document.getElementById("as")
let type = document.getElementById("type")

let destinataire2 = document.getElementById("as2")
let type2 = document.getElementById("type2")

let icon

const listType = ["Oui/Non","Satisfait","Echelle 1 à 10","Customiser"]

for (let i in listType) {
    let opt = document.createElement("option")
    opt.innerHTML = listType[i]
    type.appendChild(opt);
}

iconSend.addEventListener("click", function() {
    icon = 0

    destinataire2.style.visibility = "visible"
    destinataire2.style.height= "auto"
    type2.style.visibility = "hidden"
    type2.style.height= "0px"

    logoUp.src="../../Images/write.png"
    titleUp.innerHTML="<b>Envoyer un message privé</b>"

    openModal(modal)
})
iconNews.addEventListener("click", function() {
    icon = 1

    destinataire2.style.visibility = "hidden"
    destinataire2.style.height= "0px"
    type2.style.visibility = "hidden"
    type2.style.height= "0px"


    logoUp.src="../../Images/news.png"
    titleUp.innerHTML="<b>Envoyer une news</b>"

    openModal(modal)
})
iconSondage.addEventListener("click", function() {
    icon = 2

    destinataire2.style.visibility = "hidden"
    destinataire2.style.height= "0px"
    type2.style.visibility = "visible"
    type2.style.height= "auto"

    logoUp.src="../../Images/sondage.png"
    titleUp.innerHTML="<b>Envoyer un sondage</b>"

    openModal(modal)
})

send.addEventListener("click", function() {
    if(title.value != ""){
        let hashCode = hash()
        if(icon==0 && usersList.indexOf(destinataire.value)!=-1 && text.value != ""){
            database.ref("users/" + destinataire.value +"/messages/"+ hashCode + "/title").set(title.value)
            database.ref("users/" + destinataire.value +"/messages/"+ hashCode + "/text").set(text.value.replaceAll('\n',"</br>"))
            myMessage(hashCode, title.value, text.value.replaceAll('\n',"</br>"),destinataire.value,false)
            title.value = ""
            destinataire.value = ""
            type.selectedIndex = 0
            text.value = ""
            closeModal(modal)
        }
        if(icon==1 && text.value != ""){
            database.ref("news/" + hashCode + "/title").set(title.value)
            database.ref("news/" + hashCode + "/text").set(text.value.replaceAll('\n',"</br>"))
            news(hashCode, title.value, text.value.replaceAll('\n',"</br>"))
            title.value = ""
            destinataire.value = ""
            type.selectedIndex = 0
            text.value = ""
            closeModal(modal)
        }
        if(icon==2){
            database.ref("sondages/" + hashCode +"/text").set(title.value)
            database.ref("sondages/" + hashCode +"/mode").set(type.selectedIndex)
            let choices=text.value.split('/')
            for(let i in choices){
                database.ref("sondages/" + hashCode +"/choices/"+choices[i]).set(0)
            }
            sondage(hashCode, title.value, type.selectedIndex,[],choices)
            title.value = ""
            destinataire.value = ""
            type.selectedIndex = 0
            text.value = ""
            closeModal(modal)
        }
    }
})

annuler.addEventListener("click", function() {
    title.value = ""
    destinataire.value = ""
    type.selectedIndex = 0
    text.value = ""
    closeModal(modal)
})


overlay.addEventListener('click', () => {
    const modals = document.querySelectorAll('.modal.active')
    modals.forEach(modal => {
      closeModal(modal)
    })
  })



/* inspired by Web Dev Simplified */
charged(true)