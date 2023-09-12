const dayLowerCase = ["lundi", "mardi","jeudi","vendredi"];

let shiftActive = false;
document.addEventListener('keydown', (event) => {
    if(event.which==16) shiftActive = true
});
document.addEventListener('keyup', (event) => {
    if(event.which==16) shiftActive = false
});

export async function init(common){
    let divClasse = document.getElementById("classe")
    let dName = document.getElementById("name")
    let connect = document.getElementById('key button')

    let pScore = document.getElementById("score")
    let divScoreEvent = document.getElementById("divScoreEvent")
    let bAddScore = document.getElementById("score ajouter")
    let valScore = document.getElementById("score value")
    let nameScore = document.getElementById("score name")
    let infoCodeCarte = document.getElementById("info code barre")
    let codeCarte = document.getElementById("code carte")
    let adminBox = document.getElementById("admin")

    let divPrio = document.getElementById("prio")
    let addPrio = document.getElementById("addPrio")

    let priorites = []
    let g_c = await common.socketAdminAsync('getGroupAndClasse',null)
    g_c[0].forEach(function(child) {
        priorites.push(child.group2)
        let opt = document.createElement("option")
        opt.innerHTML = child.group2
        addPrio.appendChild(opt);
    })
    for(let i in g_c[1]){
        let opt = document.createElement("option")
        opt.innerHTML = g_c[1][i].classe
        divClasse.appendChild(opt);
    }
    divClasse.selectedIndex=-1


    function stop(){
        dName.removeEventListener("input",fuName)
        divClasse.removeEventListener("change",fu1)
        bAddScore.removeEventListener("click",fu2)
        adminBox.removeEventListener("change",fu3)
        codeCarte.removeEventListener("input",fu4)
        addPrio.removeEventListener("click",fu5)
        connect.removeEventListener("click",fu6)
    }

    let fuName=function(){return}
    let fu1=function(){return}
    let fu2=function(){return}
    let fu3=function(){return}
    let fu4=function(){return}
    let fu5=function(){return}
    let fu6=function(){return}

    let utilisateursNames = []
    let listUsers = common.nameOrder(await common.socketAdminAsync('getListPass',null))

    listUsers.forEach(function(child) {
        utilisateursNames.push(common.name(child.first_name,child.last_name))
    })
    console.log(utilisateursNames)
    common.autocomplete(document.getElementById("search"), utilisateursNames,async function(){
        stop()
        listUsers = common.nameOrder(await common.socketAdminAsync('getListPass',null))
        utilisateursNames=[]
        listUsers.forEach(function(child) {
            utilisateursNames.push(common.name(child.first_name,child.last_name))
        })
        let utilisateur = listUsers[utilisateursNames.indexOf(document.getElementById("search").value)]
        let codeBar = utilisateur.code_barre
        let classe = utilisateur.classe
        let listGroups = utilisateur.groups
        let first_name = utilisateur.first_name
        let last_name = utilisateur.last_name

        if(utilisateursNames.indexOf(common.name(utilisateur.first_name,utilisateur.last_name)) == -1){
            document.getElementById("info").innerHTML = "cet utilisateur n'existe pas"
        }else{
            document.getElementById("info").innerHTML = "Email: " + utilisateur.email + "<br>UUID: " + utilisateur.uuid
            divClasse.selectedIndex=-1
            for(let c in g_c[1]){
                if(g_c[1][c].classe==utilisateur.classe){
                    divClasse.selectedIndex = c
                }
            }
            divClasse.addEventListener("change", fu1=function() {
                classe = g_c[1][this.selectedIndex].classe
                common.socketAdminAsync('setUser',{uuid:utilisateur.uuid,first_name:first_name,last_name:last_name,code_barre:codeBar,classe:classe,admin:adminBox.checked,listGroups:listGroups})
            });
            
            dName.value = utilisateur.first_name + " " + utilisateur.last_name
            dName.addEventListener("input",fuName=function(){
                if(utilisateursNames.indexOf(dName.value) == -1){
                    let name = dName.value.split(' ')
                    first_name=name[0]
                    if(name.length>1){
                        last_name=name[1] 
                    }
                    common.socketAdminAsync('setUser',{uuid:utilisateur.uuid,first_name:first_name,last_name:last_name,code_barre:codeBar,classe:classe,admin:adminBox.checked,listGroups:listGroups})
                }
            })


            divScoreEvent.innerHTML = null
            divPrio.innerHTML = null
            
            let scoreList = await common.socketAdminAsync('getScoreList',utilisateur.uuid)
            let scoreObjs = []
            let score = 0

            scoreList.midi.forEach((child)=> {
                let event = document.createElement("button")
                event.classList.add("event")
            
                let obj={}
                obj.creneau = child.creneau
                obj.semaine = child.semaine
                console.log(child)
                obj.name = "Repas du " + dayLowerCase[Math.floor(child.creneau / 2)] + " " + common.getDayText(Math.floor(child.creneau / 2),child.semaine) +  " à " + (11 + (child.creneau % 2)) + "h"
                obj.value = -child.cout
                let jourForDate = Math.floor(child.creneau / 2)
                jourForDate++
                if(jourForDate>2)jourForDate++
                obj.date = common.generedDate(child.semaine,jourForDate,(11 + (child.creneau % 2)))
                obj.type = 0
                scoreObjs.push(obj)
            })
            
            scoreList.perso.forEach((child)=> {
                let event = document.createElement("button")
                event.classList.add("event")
            
                let obj={}
                obj.name = child.name
                obj.value = child.value
                obj.date = child.date
                obj.type = 1
                scoreObjs.push(obj)
            })
            scoreList.global.forEach((child)=> {
                let event = document.createElement("button")
                event.classList.add("event")
            
                let obj={}
                obj.name = child.name
                obj.value = child.value
                obj.date = child.date
                obj.type = 2
                scoreObjs.push(obj)
            })
            
            scoreObjs.sort(function compareFn(a, b) {
                if(new Date(a.date).getTime()>new Date(b.date).getTime()){
                    return 1
                }else if(new Date(a.date).getTime()<new Date(b.date).getTime()){
                    return -1
                }else{
                    return 0
                }
            })
            
            scoreObjs.forEach(function(obj) {
                addScoreEvent(obj) 
            })
            if(divScoreEvent.innerHTML == null){
                divScoreEvent.innerHTML = "aucun point"
            }

            function addScoreEvent(obj){
                let event = document.createElement("button")
                if(obj.type==0){
                    event.classList.add("ami")
                    event.classList.add("eventM")
                }else if(obj.type==1){
                    event.classList.add("ami")
                    event.classList.add("eventP")
                }else if(obj.type==2){
                    event.classList.add("ami")
                    event.classList.add("eventG")
                }
                divScoreEvent.appendChild(event);

                let name = obj.name
                if(name == null){
                    name = ""
                }else{
                    name += " : "
                }

                let eventScore = parseFloat(obj.value)
                event.innerHTML = name + eventScore + "pts"

                score += eventScore
                score = Math.round(score*100)/100
                if(score < 2){
                    pScore.innerHTML = "Score : " + score + "pt";
                }else{
                    pScore.innerHTML = "Score : " + score + "pts";
                }

                event.addEventListener("click", async function() {
                    const index = [...divScoreEvent.children].indexOf(event)
                    let obj = scoreObjs[index]
                    if(obj.type==0){
                        await common.socketAdminAsync('delDorI',[obj.semaine,0,obj.creneau,utilisateur.uuid])
                    }else if(obj.type==1){
                        await common.socketAdminAsync('delPersonalPoint',[utilisateur.uuid,obj.date])
                    }else if(obj.type==2){
                        await common.socketAdminAsync('delGlobalPoint',[obj.date])
                    }

                    scoreObjs.splice(index,1)

                    divScoreEvent.removeChild(event);
                    score -= eventScore
                    score = Math.round(score*100)/100
                    if(score < 2){
                        pScore.innerHTML = "Score : " + score + "pt";
                    }else{
                        pScore.innerHTML = "Score : " + score + "pts";
                    }
                })     
            }

            bAddScore.addEventListener("click", fu2=async function() {
                let val = parseFloat(valScore.value)
                let name = nameScore.value
                if(!isNaN(val) && name != ""){
                    let h = new Date()
                    await common.socketAdminAsync('addPersonalPoint',[utilisateur.uuid,h,name,val])
                    valScore.value = ""
                    nameScore.value = ""

                    scoreObjs.push({name:name,value:val,date:h,type:1})
                    addScoreEvent({name:name,value:val,date:h,type:1})
                }
            });

            

            if(utilisateur.admin==1 || utilisateur.admin==2){
                adminBox.checked=true
            } else {
                adminBox.checked=false
            }
            adminBox.addEventListener("change", fu3=function() {
                common.socketAdminAsync('setUser',{uuid:utilisateur.uuid,first_name:first_name,last_name:last_name,code_barre:codeBar,classe:classe,admin:adminBox.checked,listGroups:listGroups})
            })

            codeCarte.value = codeBar
            codeCarte.addEventListener("input", fu4=function() {
                infoCodeCarte.innerHTML = ""
                let val = codeCarte.value
                if(String(val).length  == 5 && val != codeBar){
                    let test=true
                    listUsers.forEach(function(child) {
                        let codeBar2 = child.code_barre
                        if(codeBar2==val && child!=utilisateur){
                            test=false
                            infoCodeCarte.innerHTML += "déjà utiliser par: " + common.name(utilisateur.first_name,utilisateur.last_name)
                        }
                    })
                    if(test){
                        codeBar=val
                        common.socketAdminAsync('setUser',{uuid:utilisateur.uuid,first_name:first_name,last_name:last_name,code_barre:codeBar,classe:classe,admin:adminBox.checked,listGroups:listGroups})
                    }
                }
            });
            
            
            if(listGroups.length == null){
                divPrio.innerHTML = "aucune priorités"
            }else{
                divPrio.innerHTML = ""
                listGroups.forEach((e)=>{
                    addButPrio(e)
                })
            }
            
            addPrio.addEventListener("click", fu5=function() {
                const index = this.selectedIndex - 1
                addPrio.selectedIndex = 0
                if(index != -1 && !listGroups.includes(g_c[0][index])){
                    listGroups.push(g_c[0][index].group2)
                    common.socketAdminAsync('setUser',{uuid:utilisateur.uuid,first_name:first_name,last_name:last_name,code_barre:codeBar,classe:classe,admin:adminBox.checked,listGroups:listGroups})
                    if(divPrio.childElementCount == 0){
                        divPrio.innerHTML = ""
                    }
                    addButPrio(g_c[0][index].group2)
                }
            });
            function addButPrio(name){
                let prio = document.createElement("button")
                prio.innerHTML = name
                prio.className = "ami"
                prio.addEventListener("click", function() {
                    listGroups = listGroups.filter(o => o != name);
                    common.socketAdminAsync('setUser',{uuid:utilisateur.uuid,first_name:first_name,last_name:last_name,code_barre:codeBar,classe:classe,admin:adminBox.checked,listGroups:listGroups})
                    prio.parentNode.removeChild(prio);
                    if(divPrio.childElementCount == 0){
                        divPrio.innerHTML = "aucune priorités"
                    }
                });
                divPrio.appendChild(prio);
            }
            connect.addEventListener("click",fu6=async function(event){
                let key = await common.socketAdminAsync('copyKey',utilisateur.uuid)
                common.writeCookie("listKey",common.readCookie("listKey")+ key +"/")
                if(!shiftActive){
                    common.writeCookie("key",key)
                    window.location.reload()
                }
            })
        }
    },true);

}