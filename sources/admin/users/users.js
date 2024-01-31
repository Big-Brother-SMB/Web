const dayLowerCase = ["lundi", "mardi","jeudi","vendredi"];

let shiftActive = false;
document.addEventListener('keydown', (event) => {
    if(event.which==16) shiftActive = true
});
document.addEventListener('keyup', (event) => {
    if(event.which==16) shiftActive = false
});

export async function init(common){
    await new Promise(r => setTimeout(r, 1000));

    let divClasse = document.getElementById("classe")
    let dName_prenom = document.getElementById("name_prenom")
    let dName_nom = document.getElementById("name_nom")
    let dBirthDay = document.getElementById("birthday")
    let dBirthMonth = document.getElementById("birthmonth")
    let connect = document.getElementById('key button')
    let admin_perm = document.getElementById('admin_perm')

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
        dName_prenom.removeEventListener("input",fuNameAndBirthday)
        dName_nom.removeEventListener("input",fuNameAndBirthday)
        dBirthDay.removeEventListener("input",fuNameAndBirthday)
        dBirthMonth.removeEventListener("input",fuNameAndBirthday)
        divClasse.removeEventListener("change",fu1)
        bAddScore.removeEventListener("click",fu2)
        adminBox.removeEventListener("change",fu3)
        codeCarte.removeEventListener("input",fu4)
        addPrio.removeEventListener("click",fu5)
        connect.removeEventListener("click",fu6)
        admin_perm.removeEventListener("click",fu7)
    }

    let fuNameAndBirthday=function(){return}
    let fu1=function(){return}
    let fu2=function(){return}
    let fu3=function(){return}
    let fu4=function(){return}
    let fu5=function(){return}
    let fu6=function(){return}
    let fu7=function(){return}

    let utilisateursNames = []
    let listUsers = common.nameOrder(await common.socketAdminAsync('getListUserComplete',null))

    listUsers.forEach(function(child) {
        utilisateursNames.push(common.name(child.first_name,child.last_name))
    })
    console.log(utilisateursNames)
    common.autocomplete(document.getElementById("search"), utilisateursNames,async function(){
        stop()
        listUsers = common.nameOrder(await common.socketAdminAsync('getListUserComplete',null))
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
        let birthday = utilisateur.birthday
        let birthmonth = utilisateur.birthmonth
        let admin_permission = utilisateur.admin_permission

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
                setUser()
            });
            
            dName_prenom.value = utilisateur.first_name
            dName_nom.value = utilisateur.last_name
            dBirthDay.value = utilisateur.birthday
            dBirthMonth.value = utilisateur.birthmonth
            fuNameAndBirthday=function(){
                first_name = dName_prenom.value
                last_name = dName_nom.value
                birthday = dBirthDay.value
                birthmonth = dBirthMonth.value
                setUser()
            }
            dName_prenom.addEventListener("input",fuNameAndBirthday)
            dName_nom.addEventListener("input",fuNameAndBirthday)
            dBirthDay.addEventListener("input",fuNameAndBirthday)
            dBirthMonth.addEventListener("input",fuNameAndBirthday)


            divScoreEvent.innerHTML = null
            divPrio.innerHTML = null
            
            let scoreList = await common.socketAdminAsync('getScoreList',utilisateur.uuid)
            let scoreObjs = []
            let score = 0

            scoreList.midi.forEach((child)=> {
                let obj={}
                obj.creneau = child.creneau
                obj.semaine = child.semaine
                let jour = Math.floor(child.creneau / 2)+1
                if(jour>2){
                    jour++
                }
                obj.name = "Repas du " + dayLowerCase[Math.floor(child.creneau / 2)] + " " + common.getDayText(jour,child.semaine) +  " à " + (11 + (child.creneau % 2)) + "h"
                if(child.penalite) obj.name += " (Pénalité)"
                obj.value = -child.cout
                let jourForDate = Math.floor(child.creneau / 2)
                jourForDate++
                if(jourForDate>2)jourForDate++
                obj.date = common.generedDate(child.semaine,jourForDate,(11 + (child.creneau % 2)))
                obj.type = 0
                scoreObjs.push(obj)
            })
            
            scoreList.perso.forEach((child)=> {
                let obj={}
                obj.name = child.name
                obj.value = child.value
                obj.date = child.date
                obj.type = 1
                scoreObjs.push(obj)
            })
            scoreList.global.forEach((child)=> {
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
                    common.popUp_Active("Supprimer un event?","Voulez-vous suppprimer l'event \"" + name + eventScore + "pts\" ?",(btn)=>{
                        btn.innerHTML="OUI"
                        btn.addEventListener("click",async ()=>{
                            const index = [...divScoreEvent.children].indexOf(event)
                            let obj = scoreObjs[index]
                            if(obj.type==0){
                                await common.socketAdminAsync('delDorI',[obj.semaine,0,obj.creneau,utilisateur.uuid])
                            }else if(obj.type==1){
                                await common.socketAdminAsync('delPersonalPoint',[utilisateur.uuid,obj.date])
                            }else if(obj.type==2){
                                await common.socketAdminAsync('delGlobalPoint',obj.date)
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
                            common.popUp_Stop()
                        })
                    })
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
                setUser()
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
                            infoCodeCarte.innerHTML += "déjà utiliser par: " + common.name(child.first_name,child.last_name)
                        }
                    })
                    if(test){
                        codeBar=val
                        setUser()
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
                    setUser()
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
                    setUser()
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

            admin_perm.addEventListener("click",fu7=async function(event){
                common.popUp_Active("Permission:","",btn=>{
                    let popup = document.getElementById("popup-body")
                    let list_select = []
                    let list_perm = {pass:1,foyer_repas:1,foyer_perm:2,banderole:1,user_editor:1,messagerie:1,cookie:2,admin_only:1,localisation:2,CDI:2,Aumônerie:2,DOC:2,Audio:2,Tutorat:2}
                    for(const [key, value] of Object.entries(list_perm)){
                        let div = document.createElement("div")
                        div.className = "div_popup_admin_perm"
                        popup.appendChild(div)
                        let p = document.createElement("p")
                        p.innerHTML = key + ": "
                        let select = document.createElement("select")
                        select.setAttribute("key",key)
                        list_select.push(select)
                        for(let i=0;i<=value;i++) {
                            let opt = document.createElement("option")
                            if(i==0){
                                opt.innerHTML = "Désactivé"
                            }else if(i==1 && value==1){
                                opt.innerHTML = "Activé"
                            }else if(i==1){
                                opt.innerHTML = "Lecture"
                            }else{
                                opt.innerHTML = "Ecriture"
                            }
                            select.appendChild(opt);
                        }
                        select.selectedIndex=admin_permission[key]
                        div.appendChild(p)
                        div.appendChild(select)
                    }

                    let btn2 = document.createElement("button")
                    btn2.innerHTML="Donner Tout"
                    btn2.addEventListener("click",()=>{
                        admin_permission = list_perm
                        setUser()
                        common.popUp_Stop()
                    })
                    btn.parentNode.appendChild(btn2)

                    btn.addEventListener("click",()=>{
                        list_select.forEach(e=>{
                            admin_permission[e.getAttribute("key")]=e.selectedIndex
                        })
                        setUser()
                        common.popUp_Stop()
                    })
                })
            })

            function setUser(){
                common.socketAdminAsync('setUser',{uuid:utilisateur.uuid,first_name:first_name,last_name:last_name,code_barre:codeBar,classe:classe,admin:adminBox.checked,listGroups:listGroups,admin_permission:admin_permission,birthday:birthday,birthmonth:birthmonth})
            }
        }
    },true);

}