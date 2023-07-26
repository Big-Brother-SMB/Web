const nomNiveau = ["secondes","premières","terminales","adultes"]

export async function init(common){
    document.getElementById("btn_retour").classList.remove("cache")
    document.getElementById("btn_retour").setAttribute("url","/admin/midi")

    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    let j = 0
    let h = 0
    let w = 0
        if(params.j!=null){
        j = parseInt(params.j)
        }
        if(params.h!=null){
        h = parseInt(params.h)
        }
        if(params.w!=null){
        w = parseInt(params.w)
        }





    let listDemandes = null
    let inscrits=0
    let demandes=0
    let cout = 1
    let gratuit_prio = 0
    let ouvert = 0
    let perMin = 75
    let places = 100
    let prio_mode = 0
    let list_prio = []

    async function reloadInfoHoraire(){
        listDemandes = await common.socketAsync('listDemandes',{w:w,j:j,h:h})
        inscrits=0
        demandes=0
        listDemandes.forEach(function (child) {
        if(child.DorI==1){
            inscrits++
        }else{
            demandes++
        }
        });
        document.getElementById("demandes").innerHTML = "demandes (" + demandes + ")"
        document.getElementById("inscrits").innerHTML = "inscrits (" + inscrits + ")"
    }
    await reloadInfoHoraire()



    let info = await common.socketAsync('getDataThisCreneau',{w:w,j:j,h:h})
    if(info==undefined) info={prio:[]}
    cout = info.cout
    if(cout==null){
        cout=1
    }
    gratuit_prio = info.gratuit_prio
    if(gratuit_prio == null){
        gratuit_prio = 0
    }
    ouvert = info.ouvert
    if(ouvert==null){
        ouvert=0
    }
    perMin = info.perMin
    if(perMin == null){
        perMin = 75
    }
    places = info.places
    if(places == null){
        places = 100
    }
    prio_mode = info.prio_mode
    if(prio_mode == null){
        prio_mode = 1
    }
    list_prio = info.prio
    if(list_prio == null){
        list_prio = []
    }





    const listMode = ["horaire non planifié","ouvert à tous","ouvert aux inscrits","fermé","fini","vacances"]
    let divMode = document.getElementById("mode")
    for(let i in listMode){
        let opt = document.createElement("option")
        opt.innerHTML = listMode[i]
        divMode.appendChild(opt);
    }
    divMode.selectedIndex = ouvert
    divMode.addEventListener("change", async function() {
        ouvert = this.selectedIndex
        await common.socketAdminAsync('setMidiInfo',[w,j,h,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio])
    });


    let inPlaces = document.getElementById("places")
    inPlaces.value = places
    inPlaces.addEventListener("change", async function() {
        places = this.value
        await common.socketAdminAsync('setMidiInfo',[w,j,h,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio])
    });


    let inCout = document.getElementById("cout")
    inCout.value = cout
    inCout.addEventListener("change", async function() {
        cout = inCout.value
        await common.socketAdminAsync('setMidiInfo',[w,j,h,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio])
    });


    let inPer = document.getElementById("per")
    inPer.value = perMin
    inPer.addEventListener("change", async function() {
        perMin = this.value
        await common.socketAdminAsync('setMidiInfo',[w,j,h,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio])
    });

    const listPrioMode = ["Ne pas prendre en conte les prio","prendre en conte les prio","uniquement prio"]
    let divPrioMode = document.getElementById("prio mode")
    for(let i in listPrioMode){
        let opt = document.createElement("option")
        opt.innerHTML = listPrioMode[i]
        divPrioMode.appendChild(opt);
    }
    divPrioMode.selectedIndex = prio_mode
    divPrioMode.addEventListener("change", async function() {
        prio_mode = this.selectedIndex
        await common.socketAdminAsync('setMidiInfo',[w,j,h,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio])
    });


    let sGratuit = document.getElementById("switch gratuit")
    sGratuit.checked = gratuit_prio
    sGratuit.addEventListener("change", async function() {
        gratuit_prio = this.checked
        await common.socketAdminAsync('setMidiInfo',[w,j,h,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio])
    });



    document.getElementById("demandes").addEventListener("click", function() {
        common.loadpage("/admin/midi/liste?j="+j+"&h="+h+"&w="+w);
    });

    document.getElementById("inscrits").addEventListener("click", function() {
        common.loadpage("/admin/midi/liste?j="+j+"&h="+h+"&w="+w);
    });








    let g_c = await common.socketAdminAsync('list group/classe',null)
    let divGroupes = document.getElementById("groupes")

    let cbGroupes = []
    let groupes = []
    let iG = 0

    let divG1 = document.createElement("div")
    divG1.style="display: inline-block;*display: inline;width:40%;vertical-align: top;"
    let divG2 = document.createElement("div")
    divG2.style="display: inline-block;*display: inline;width:40%;vertical-align: top;"
    let loop2 = 0
    g_c[0].forEach(function(child) {
        const index = iG;
        groupes.push(child.group2)
        let gr = document.createElement("p")
        cbGroupes[index] = document.createElement("input")
        cbGroupes[index].type = "checkbox"
        cbGroupes[index].addEventListener("click", async function() {
            if(cbGroupes[index].checked){
                if(!list_prio.includes(groupes[index])){
                    list_prio.push(groupes[index])
                }
                await common.socketAdminAsync('setMidiInfo',[w,j,h,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio])
            }else{
                if(list_prio.includes(groupes[index])){
                    list_prio = list_prio.filter(o => o != groupes[index]);
                }
                await common.socketAdminAsync('setMidiInfo',[w,j,h,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio])
            }
        })
        //cbClasses[n][i].checked = true
        gr.innerHTML = groupes[index]
        gr.appendChild(cbGroupes[index]);
        if (loop2==0){
            loop2=1
            divG1.appendChild(gr);
        } else {
            loop2=0
            divG2.appendChild(gr);
        }
        if(list_prio.includes(groupes[index])){
            cbGroupes[index].checked = true
        }
        iG++;
    })
    divGroupes.appendChild(divG1);
    divGroupes.appendChild(divG2);



    let divClasses = document.getElementById("classes")
    let listNiveau = [[],[],[],[]]
    g_c[1].forEach(function(child) {
        listNiveau[child.niveau].push(child.classe)
    })
    console.log(listNiveau)
    let cbClasses = []
    for(let n in listNiveau){
        cbClasses[n] = []
        let divNiveau = document.createElement("div")
        divNiveau.style="display: inline-block;*display: inline;width:23%;vertical-align: top;"

        let nSelectAll = document.createElement("button")
        nSelectAll.className = "btn cent"
        nSelectAll.innerHTML ="selectionner tous les " + nomNiveau[n]
        nSelectAll.addEventListener("click", async function() {
            console.log("niveau " + n + " select all")
            for(let i in cbClasses[n]){
                cbClasses[n][i].checked = true
                if(!list_prio.includes(listNiveau[n][i])){
                    list_prio.push(listNiveau[n][i])
                }
            }
            await common.socketAdminAsync('setMidiInfo',[w,j,h,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio])
        });
        divNiveau.appendChild(nSelectAll);

        let nSelectNone = document.createElement("button")
        nSelectNone.className = "btn cent"
        nSelectNone.innerHTML ="retirer tous les " + nomNiveau[n]
        nSelectNone.addEventListener("click", async function() {
            console.log("niveau " + n + " select none")
            for(let i in cbClasses[n]){
                cbClasses[n][i].checked = false
                if(list_prio.includes(listNiveau[n][i])){
                    list_prio = list_prio.filter(o => o != listNiveau[n][i]);
                }
            }
            await common.socketAdminAsync('setMidiInfo',[w,j,h,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio])
        });
        divNiveau.appendChild(nSelectNone);

        let nInversed = document.createElement("button")
        nInversed.className = "btn cent"
        nInversed.innerHTML ="Inverser tous les " + nomNiveau[n]
        nInversed.addEventListener("click", async function() {
            console.log("niveau " + n + " inversed")
            for(let i in cbClasses[n]){
                cbClasses[n][i].checked = !cbClasses[n][i].checked
                if(cbClasses[n][i].checked){
                    if(!list_prio.includes(listNiveau[n][i])){
                        list_prio.push(listNiveau[n][i])
                    }
                }else{
                    if(list_prio.includes(listNiveau[n][i])){
                        list_prio = list_prio.filter(o => o != listNiveau[n][i]);
                    }
                }
            }
            await common.socketAdminAsync('setMidiInfo',[w,j,h,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio])
        });
        divNiveau.appendChild(nInversed);

        for(let i in listNiveau[n]){
            let opt = document.createElement("p")
            cbClasses[n][i] = document.createElement("input")
            cbClasses[n][i].type = "checkbox"
            //cbClasses[n][i].checked = true
            opt.innerHTML = listNiveau[n][i]
            opt.appendChild(cbClasses[n][i]);
            cbClasses[n][i].addEventListener("click", async function() {
                if(cbClasses[n][i].checked){
                    if(!list_prio.includes(listNiveau[n][i])){
                        list_prio.push(listNiveau[n][i])
                    }
                }else{
                    if(list_prio.includes(listNiveau[n][i])){
                        list_prio = list_prio.filter(o => o != listNiveau[n][i]);
                    }
                }
                await common.socketAdminAsync('setMidiInfo',[w,j,h,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio])
            })
            divNiveau.appendChild(opt);
            if(list_prio.includes(listNiveau[n][i])){
                cbClasses[n][i].checked = true
            }
        }
        divClasses.appendChild(divNiveau);
    }

    document.getElementById("select all").addEventListener("click", async function() {
        console.log("select all")
        for(let n in cbClasses){
            for(let i in cbClasses[n]){
                cbClasses[n][i].checked = true
                if(!list_prio.includes(listNiveau[n][i])){
                    list_prio.push(listNiveau[n][i])
                }
            }
        }
        await common.socketAdminAsync('setMidiInfo',[w,j,h,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio])
    });

    document.getElementById("select none").addEventListener("click", async function() {
        console.log("select none")
        for(let n in cbClasses){
            for(let i in cbClasses[n]){
                cbClasses[n][i].checked = false
                if(list_prio.includes(listNiveau[n][i])){
                    list_prio = list_prio.filter(o => o != listNiveau[n][i]);
                }
            }
        }
        await common.socketAdminAsync('setMidiInfo',[w,j,h,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio])
    });

    document.getElementById("inversed").addEventListener("click", async function() {
        console.log("inversed")
        for(let n in cbClasses){
            for(let i in cbClasses[n]){
                cbClasses[n][i].checked = !cbClasses[n][i].checked
                if(cbClasses[n][i].checked){
                    if(!list_prio.includes(listNiveau[n][i])){
                        list_prio.push(listNiveau[n][i])
                    }
                }else{
                    if(list_prio.includes(listNiveau[n][i])){
                        list_prio = list_prio.filter(o => o != listNiveau[n][i]);
                    }
                }
            }
        }
        await common.socketAdminAsync('setMidiInfo',[w,j,h,cout,gratuit_prio,ouvert,perMin,places,prio_mode,list_prio])
    });

    document.getElementById("start algo").addEventListener("click", async function() {
        document.getElementById("start algo").innerHTML = "..."
        let rep = await common.socketAdminAsync('algo',[w,j,h],60000)
        document.getElementById("start algo").innerHTML = rep

        reloadInfoHoraire()
    })
}

/*
document.getElementById("start algo").addEventListener("click", function() {
    let classes = []
    console.log("start algo")
    for(let n in cbClasses){
        for(let i in cbClasses[n]){
            if(cbClasses[n][i].checked){
                classes.push(listNiveau[n][i])
            }
             
        }
    }
    tri(classes,places,inscrits)
});

function tri(classes,p,inscrits){
    console.log("authorised class",classes)
    getStat(j,h,"demandes")
    let places = p - inscrits
    let ajout = 0
    while(ajout < places){
        let alea = randint(0, score[scMin].length - 1)
                let i = alea
                do{
                    let ok = classes.indexOf(usersClasse[i]) != -1
                    for(let a in addLinkTag[i]){
                        if(classes.indexOf(usersClasse[i]) == -1){
                            ok = false
                        }
                    }
                    if(ok){
                        ajout = ajout + inscrire(j,h,i)
                    }
                    i++
                    
                }while(!ok && i != alea)
    }

}

*/



/*
document.getElementById("start algo").addEventListener("click", function() {
    algo()
})




//Stats

let amisTag = []

let gScore = []
let usersScore = []

let usersPriorites = []

let classes = []
let usersClasse = []

let addLinkTag = []
let linkedTag = []
let delLinkTag = []





function algo(){
    document.getElementById("start algo").innerHTML = "veuillez patienter"
    let places
    let inscrits = 0
    let dejaInscrit
    let cout
    let prio = []

    database.ref(path(j,h)).once('value', function(snapshot) {
        places = snapshot.child("places").val();
        console.log(places)
        if(places==null || places==""){
            places=0
        }
        snapshot.child("inscrits").forEach(function(child) {
            inscrits++
        })
        dejaInscrit = inscrits
        cout = snapshot.child("cout").val();
        snapshot.child("prioritaires").forEach(function(child) {
            prio.push(child.key)
        })
        database.ref(path(j,h)+"/demandes").once("value", function(snapshotType) {
            database.ref("users").once("value", function(snapshotUser) {
                let i = 0
                snapshotType.forEach(function(child) {
                    let user = child.key
                    
                    users.push(user)
                    amis[i] = []
                    amisTag[i] = []
                    addLinkTag[i] = []
                    linkedTag[i] = []
                    delLinkTag[i] = []
                    
                    let num = i
                    snapshotType.child(user+"/amis").forEach(function(child) {
                        let ami = child.key
                        amis[num].push(ami)
                    })
                    i++
                    
                    
                });
                
                
                for(let u in users){
                    let name = users[u]
                    usersScore.push(0)
                        snapshotUser.child(name+"/score").forEach(function(child) {
                            let snap=snapshotUser.child(name + "/score/" + child.key + "/value")
                            usersScore[u] += parseFloat(snap.val())
                            usersScore[u] =  Math.round(usersScore[u]*100)/100
                        })
                        if(isNaN(usersScore[u])){
                            usersScore[u]=0
                            console.log(name)
                        }
                    let prios = []
                    snapshotUser.child(name + "/priorites").forEach(function(child) {
                        prios.push(child.key)
                    })
                    usersPriorites[u] = prios
                }
        
                for(let u in users){
                    let user = users[u]
                    let c = snapshotUser.child(user + "/classe").val()
                    if(c == null){
                        usersClasse.push("none")
                    }else{
                        if(classes[c] == null){
                            classes[c] = []
                        }
                        classes[c].push(u)
                        usersClasse.push(c)
                    }
                }
                setTimeout(function() {
                    console.log("start")
                    console.log(amis)
                    for(let u in users){
                        amisTag[u] = []
                        for(let a in amis[u]){
                            let index = users.indexOf(amis[u][a])
                            if(index != -1){
                                amisTag[u].push(index)
                            }
                            
                        }
                    }
            
                    
                    for(let u in users){
                        linkedTag[u] = []
                    }
                    for(let u in users){
                        for(let a in amisTag[u]){
                            linkedTag[amisTag[u][a]].push(parseInt(u))
                            
                        }
                        
                    }
                    
                    //adding link -> users needed to add if you add this user
            
                    
                    let actUser
                    function searchAmis(u){
                        if(addLinkTag[actUser].indexOf(u) == -1){
                            addLinkTag[actUser].push(u)
                            for(a in amisTag[u]){
                                searchAmis(amisTag[u][a])
                            }
                        }
                        
                    }
            
                    for(let u in users){
                        actUser = parseInt(u)
                        addLinkTag[actUser] = []
                        searchAmis(actUser)
                    }
            
                    //del link -> users needed to delete if you delete this user
            
                    
                    function searchLink(u){
                        if(delLinkTag[actUser].indexOf(u) == -1){
                            delLinkTag[actUser].push(u)
                            for(l in linkedTag[u]){
                                searchLink(linkedTag[u][l])
                            }
                        }
                        
                    }
            
                    for(let u in users){
                        actUser = parseInt(u)
                        delLinkTag[actUser] = []
                        searchLink(actUser)
                    }
            
                    //gScore -> score of the group by add link
                    for(let u in users){
                        gScore[u] = usersScore[u]
                        for(a in addLinkTag[u]){
                            const num = addLinkTag[u][a]
                            if(usersScore[num] < gScore[u]){
                                gScore[u] = usersScore[num]
                            }
                        }
                        gScore[u] = Math.floor(gScore[u])
                        if(isNaN(gScore[u])){
                            gScore[u]=0
                        }
                    }
            
            
            
                    console.log("users",users)
                    console.log("amis",amis)
                    console.log(amisTag)
                    console.log("addLinkTag",addLinkTag)
                    console.log(linkedTag)
                    console.log("delLinkTag",delLinkTag)
                    console.log("classes",classes)
                    console.log(usersClasse)
                    console.log("group score", gScore)
                    console.log("users score",usersScore)
                    console.log("users prio",usersPriorites)





                    let tag = []
                    for(let u in users){
                        tag[u] = false
                    }
                    
                    let alea = randint(0, users.length - 1)
                    let base = alea
                    let nbEmail = 0
                    let fini = false
                    var maxScore = Math.max(...gScore);
                    let bPrio = true;
                    let hashCode = hash()
                    console.log(gScore)
                    console.log("max score : " + maxScore)
                    while(places > inscrits && maxScore >= 0){
                        console.log("inscrit",inscrits)
                        let nbPrio = 0
                        for(let a in addLinkTag[alea]){
                            const tag = addLinkTag[alea][a]
                            if(prio.indexOf(usersClasse[tag]) != -1 || commonElement(prio, usersPriorites[tag]) != 0){
                                nbPrio++
                            }
                            
                        }
                        let perPrio = Math.round(nbPrio / addLinkTag[alea].length * 100)
                        if(!tag[alea] && gScore[alea] >= maxScore && addLinkTag[alea].length <= places - inscrits && (!bPrio || perPrio >= perMin) ){ 
                            console.log(users[alea] + " -> per prio : " + perPrio + "% (" + usersClasse[alea] + ")")
                            for(let pers in addLinkTag[alea]){
                                let p = addLinkTag[alea][pers]
                                if(!tag[p]){
                                    let name = users[p]
                                    console.log("inscrit : " + name)
                                    let score = usersScore[p]
                                    if(score == null){
                                        score = 0
                                    }
                                    if(gratuit && (commonElement(prio, usersPriorites[p]) != 0 || prio.indexOf(usersClasse[p]) != -1)){
                                        console.log("gratis")
                                    }else{
                                        if(divMode.selectedIndex==2||divMode.selectedIndex==3||divMode.selectedIndex==5){
                                            database.ref("users/" + name + "/score/" + hashCode + "/name").set("Repas du " + dayLowerCase[j] + " " + getDayText(j) +  " à " + (11 + h) + "h")
                                            database.ref("users/" + name + "/score/" + hashCode + "/value").set(-cout)
                                        }
                                    }
                                   
                                    database.ref(path(j,h) + "/inscrits/" + name+ "/user").set(0)
                                    for(let loop in amis[p]){
                                        database.ref(path(j,h) + "/inscrits/" + name+ "/amis/"+amis[p][loop]).set(0)
                                    } 
                                    database.ref(path(j,h) + "/demandes/" + name).remove()
                                    try{
                                        database.ref("users/" + users[p] + "/email").once("value",function(snapshot){
                                            let email = snapshot.val()
                                            let prenom = users[p].split(" ")[0]
                                            console.log(email)
                                        })
                                        
                                    }catch(exception){
                                        console.log(exception)
                                    }
                                    
                                    tag[p] = true
                                    inscrits++
                                }
                                
                            }
                            alea = randint(0, users.length - 1)
                            base = alea
                        }else{
                            alea++  
                            if(alea > users.length - 1){
                                alea = 0
                            }
                            if(alea == base){
                                maxScore--
                                console.log("plus de possibilité pour ce score, nouveau : " + maxScore)
                            }
                            if(maxScore < 0 && bPrio && !only){
                                console.log("passage au non prioritaires")
                                maxScore = Math.max(...gScore);
                                bPrio = false
                            }
                            
                        }
                    }
                    console.log("plus de places")
                    fini = true
                    if(snapshot.val() != null){
                        document.getElementById("start algo").innerHTML = "fini, " + (inscrits - dejaInscrit) + " inscriptions<br>il reste " + (places - inscrits) + " places<br>appuyer pour reload<br>Email envoyés : " + nbEmail
                    }else{
                        document.getElementById("start algo").innerHTML = "Une erreur a eu lieu,<br>appuyer pour reload<br>(" + (inscrits - dejaInscrit) + " inscrits, reste " + (places - inscrits) + " places)"     
                    }
                    document.getElementById("start algo").addEventListener("click", function() {
                        reload()
                    })
                    nbPers(j,h,"demandes",nbPersDemande)
                    nbPers(j,h,"inscrits",nbPersInscrit)
                })
            })
        });
    });
}*/