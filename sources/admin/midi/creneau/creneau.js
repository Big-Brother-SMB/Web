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
    let inscrits = 0
    let demandes = 0
    let cout = 1
    let gratuit_prio = 0
    let ouvert = 0
    let perMin = 75
    let places = 100
    let prio_mode = 0
    let nbSandwich = 0
    let nbSandwich_vege = 0
    let mode_sandwich = 0
    let bonus_avance = 1.1
    let algo_auto = 0
    let message = ""
    let list_prio = []

    async function reloadInfoHoraire(){
        listDemandes = await common.socketAsync('listDemandes',{w:w,j:j,h:h})
        inscrits=0
        demandes=0
        let sandwich_tab = [0,0,0,0]
        let sandwich_tab_inscrit = [0,0,0,0]
        listDemandes.forEach(function (child) {
            if(child.DorI==1){
                inscrits++
                if(child.sandwich>=0 && child.sandwich<=2){
                    sandwich_tab_inscrit[child.sandwich+1]++
                }
            }else{
                demandes++
            }
            if(child.sandwich===null){
                sandwich_tab[0]++
            }else if(child.sandwich>=0 && child.sandwich<=2){
                sandwich_tab[child.sandwich+1]++
            }
        });
        document.getElementById("demandes").innerHTML = "demandes (" + demandes + ")"
        document.getElementById("inscrits").innerHTML = "inscrits (" + inscrits + ")"


        document.getElementById("p sandwich").innerHTML = "null: " + sandwich_tab[0]
                                                        + "<br>NON: "  + sandwich_tab[1]
                                                        + "<br>OUI: "  + sandwich_tab[2]
                                                        + "<br>Inscrit: "
                                                        + "<br>Sandwich: "  + sandwich_tab_inscrit[2]
                                                        /*+ "<br>ABSOLUMENT: "  + sandwich_tab[3]*/
    }
    await reloadInfoHoraire()



    let info = await common.socketAsync('getDataThisCreneau',{w:w,j:j,h:h})
    if(info==undefined) info={prio:[]}

    if(info.cout != null){
        cout= info.cout
    }

    if(info.gratuit_prio != null){
        gratuit_prio = info.gratuit_prio
    }

    if(info.ouvert != null){
        ouvert = info.ouvert
    }

    if(info.perMin != null){
        perMin = info.perMin
    }

    if(info.places != null){
        places = info.places
    }
    
    if(info.prio_mode != null){
        prio_mode = info.prio_mode
    }

    if(info.nbSandwich != null){
        nbSandwich = info.nbSandwich
    }

    if(info.nbSandwich_vege != null){
        nbSandwich_vege = info.nbSandwich_vege
    }

    if(info.mode_sandwich != null){
        mode_sandwich = info.mode_sandwich
    }

    if(info.bonus_avance != null){
        bonus_avance = info.bonus_avance
    }

    if(info.algo_auto != null){
        algo_auto = info.algo_auto
    }

    if(info.msg != null){
        message = info.msg
    }

    if(info.list_prio != null){
        list_prio = info.prio
    }




    document.getElementById("demandes").addEventListener("click", function() {
        common.loadpage("/admin/midi/liste?j="+j+"&h="+h+"&w="+w);
    });

    document.getElementById("inscrits").addEventListener("click", function() {
        common.loadpage("/admin/midi/liste?j="+j+"&h="+h+"&w="+w);
    });


    //------------------------general----------------------------------


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
        setMidiInfo()
    });


    let inPlaces = document.getElementById("places")
    inPlaces.value = places
    inPlaces.addEventListener("input", async function() {
        places = this.value
        setMidiInfo()
    });


    let inCout = document.getElementById("cout")
    inCout.value = cout
    inCout.addEventListener("input", async function() {
        cout = inCout.value
        setMidiInfo()
    });


    let message_obj = document.getElementById("message")
    message_obj.value = message
    message_obj.addEventListener("change", async function() {
        message = message_obj.value
        setMidiInfo()
    });



    //------------------------------Algorithme----------------------------

    const listModeAlgo = ["Désactivé","10H30","00H00 & 10H30"]
    let divModeAlgo = document.getElementById("algo auto")
    for(let i in listModeAlgo){
        let opt = document.createElement("option")
        opt.innerHTML = listModeAlgo[i]
        divModeAlgo.appendChild(opt);
    }
    divModeAlgo.selectedIndex = algo_auto
    divModeAlgo.addEventListener("change", async function() {
        algo_auto = this.selectedIndex
        setMidiInfo()
    });

    let inBonus = document.getElementById("bonus avance")
    inBonus.value = bonus_avance
    inBonus.addEventListener("input", async function() {
        bonus_avance = inBonus.value
        setMidiInfo()
    });

    document.getElementById("start algo").addEventListener("click", async function() {
        document.getElementById("start algo").innerHTML = "..."
        await setMidiInfo()
        let rep = await common.socketAdminAsync('startAlgo',[w,j,h],60000)
        document.getElementById("start algo").innerHTML = rep

        reloadInfoHoraire()
    })

    //-------------------------------Sandwich-------------------------------


    const listModeSandwich = ["Désactivé","Sondage"/*,"Sélection","Sélection avec exclusion"*/]
    let divModeSandwich = document.getElementById("mode sandwich")
    for(let i in listModeSandwich){
        let opt = document.createElement("option")
        opt.innerHTML = listModeSandwich[i]
        divModeSandwich.appendChild(opt);
    }
    divModeSandwich.selectedIndex = mode_sandwich
    divModeSandwich.addEventListener("change", async function() {
        mode_sandwich = this.selectedIndex
        setMidiInfo()
    });

    let inNbSandwich = document.getElementById("nbSandwich")
    inNbSandwich.value = nbSandwich
    inNbSandwich.addEventListener("input", async function() {
        nbSandwich = inNbSandwich.value
        setMidiInfo()
    });

    let inNbSandwich_vege = document.getElementById("nbSandwich_vege")
    inNbSandwich_vege.value = nbSandwich_vege
    inNbSandwich_vege.addEventListener("input", async function() {
        nbSandwich_vege = inNbSandwich_vege.value
        setMidiInfo()
    });

    //------------------------------------Prioritaires-------------------------------------

    const listPrioMode = ["Ne pas prendre en compte les prio","Prendre en compte les prio","Uniquement prio"]
    let divPrioMode = document.getElementById("prio mode")
    for(let i in listPrioMode){
        let opt = document.createElement("option")
        opt.innerHTML = listPrioMode[i]
        divPrioMode.appendChild(opt);
    }
    divPrioMode.selectedIndex = prio_mode
    divPrioMode.addEventListener("change", async function() {
        prio_mode = this.selectedIndex
        setMidiInfo()
    });


    let inPer = document.getElementById("per")
    inPer.value = perMin
    inPer.addEventListener("input", async function() {
        perMin = this.value
        setMidiInfo()
    });


    let sGratuit = document.getElementById("switch gratuit")
    sGratuit.checked = gratuit_prio
    sGratuit.addEventListener("change", async function() {
        gratuit_prio = this.checked
        setMidiInfo()
    });




    let g_c = await common.socketAdminAsync('getGroupAndClasse',null)
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
                setMidiInfo()
            }else{
                if(list_prio.includes(groupes[index])){
                    list_prio = list_prio.filter(o => o != groupes[index]);
                }
                setMidiInfo()
            }
        })
        //cbClasses[n][i].checked = true
        gr.innerHTML = groupes[index]+" "
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
            setMidiInfo()
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
            setMidiInfo()
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
            setMidiInfo()
        });
        divNiveau.appendChild(nInversed);

        for(let i in listNiveau[n]){
            let opt = document.createElement("p")
            cbClasses[n][i] = document.createElement("input")
            cbClasses[n][i].type = "checkbox"
            //cbClasses[n][i].checked = true
            opt.innerHTML = listNiveau[n][i]+" "
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
                setMidiInfo()
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
        setMidiInfo()
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
        setMidiInfo()
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
        setMidiInfo()
    });

    async function setMidiInfo(){
        console.log({w:w,j:j,h:h,cout:cout,gratuit_prio:gratuit_prio,ouvert:ouvert,perMin:perMin,places:places,prio_mode:prio_mode,nbSandwich:nbSandwich,nbSandwich_vege:nbSandwich_vege,mode_sandwich:mode_sandwich,bonus_avance:bonus_avance,algo_auto:algo_auto,msg:message,list_prio:list_prio})
        await common.socketAdminAsync('setMidiInfo',{w:w,j:j,h:h,cout:cout,gratuit_prio:gratuit_prio,ouvert:ouvert,perMin:perMin,places:places,prio_mode:prio_mode,nbSandwich:nbSandwich,nbSandwich_vege:nbSandwich_vege,mode_sandwich:mode_sandwich,bonus_avance:bonus_avance,algo_auto:algo_auto,msg:message,list_prio:list_prio})
    }
}