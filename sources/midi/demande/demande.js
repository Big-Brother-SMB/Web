const day = ["Lundi", "Mardi","Jeudi","Vendredi"]

export async function init(common){
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

    const suppMyDemande = async function() {
        common.popUp_Active('Procuration:','attente',async (bnt)=>{
            bnt.innerHTML='Confirmer'
            let from = document.createElement('from')
            document.getElementById('popup-body').innerHTML=''
            document.getElementById('popup-body').appendChild(from)
            let passProcuration=true
            listeAmisPris.forEach(child=>{
                let ami = listAmis[listAmisUUID.indexOf(child)]
                if(ami.procuration==1 && ami.DorI!=1){
                    passProcuration=false
                    let box = document.createElement('input')
                    box.setAttribute("type","checkbox")
                    box.setAttribute("name","procuration")
                    box.setAttribute("value",child)
                    from.appendChild(box)

                    let label = document.createElement('label')
                    label.setAttribute("for","procuration")
                    label.innerHTML=ami.first_name + " " + ami.last_name
                    from.appendChild(label)
                    from.innerHTML+='<br>'
                }
            })
            if(passProcuration){
                await common.socketAsync('delMyDemande',{w:w,j:j,h:h})
                common.popUp_Stop()
                common.loadpage("/midi")
            }else{
                bnt.addEventListener('click',async ()=>{
                    const checkBoxs = document.querySelectorAll('input[name="procuration"]');
                    for (const checkBox of checkBoxs) {
                        if (checkBox.checked) {
                            await common.socketAsync('delAmiDemande',{uuidAmi:checkBox.value,w:w,j:j,h:h})
                        }
                    }
                    await common.socketAsync('delMyDemande',{w:w,j:j,h:h})
                    common.popUp_Stop()
                    common.loadpage("/midi")
                }, { once: true })
            }
        })
    }

    const setMyDemande = async function() {
        let str = ""
        listAmisUUID.forEach(child=>{
            str += child + "/"
        })
        common.writeCookie("derniere demande",str)

        const radioButtons = document.querySelectorAll('input[name="sandwich"]');
        let choiceOfSandwich=0
        for (const radioButton of radioButtons) {
            if (radioButton.checked) {
                choiceOfSandwich = parseInt(radioButton.value);
                break;
            }
        }

        common.popUp_Active('Procuration:','attente',async (bnt)=>{
            bnt.innerHTML='Confirmer'
            let from = document.createElement('from')
            document.getElementById('popup-body').innerHTML=''
            document.getElementById('popup-body').appendChild(from)
            let passProcuration=true
            listeAmisPris.forEach(child=>{
                let ami = listAmis[listAmisUUID.indexOf(child)]
                if(ami.procuration==1 && ami.DorI!=1){
                    passProcuration=false
                    let box = document.createElement('input')
                    box.setAttribute("type","checkbox")
                    box.setAttribute("name","procuration")
                    box.setAttribute("value",child)
                    if(ami.DorI==null){
                        box.setAttribute("checked",true)
                    }
                    from.appendChild(box)

                    let label = document.createElement('label')
                    label.setAttribute("for","procuration")
                    label.innerHTML=ami.first_name + " " + ami.last_name
                    from.appendChild(label)
                    from.innerHTML+='<br>'
                }
            })
            if(passProcuration){
                await common.socketAsync('setMyDemande',{w:w,j:j,h:h,amis:listeAmisPris,sandwich:choiceOfSandwich})
                common.popUp_Stop()
                common.loadpage("/midi")
            }else{
                bnt.addEventListener('click',async ()=>{
                    const checkBoxs = document.querySelectorAll('input[name="procuration"]');
                    for (const checkBox of checkBoxs) {
                        if (checkBox.checked) {
                            let listAmisDeLAmi = listeAmisPris.concat([])
                            listAmisDeLAmi.splice(listAmisDeLAmi.indexOf(checkBox.value),1);
                            listAmisDeLAmi.push(common.uuid)
                            await common.socketAsync('setAmiDemande',{uuidAmi:checkBox.value,w:w,j:j,h:h,amis:listAmisDeLAmi})
                        }
                    }
                    await common.socketAsync('setMyDemande',{w:w,j:j,h:h,amis:listeAmisPris,sandwich:choiceOfSandwich})
                    common.popUp_Stop()
                    common.loadpage("/midi")
                }, { once: true })
            }
        })
    }

    const quitDemande = async function() {
        common.loadpage("/midi")
    }


    document.getElementById("toutAjouter").addEventListener("click", function() {
        listeAmisPris = listeAmisPris.concat(listeAmisNonPris);
        listeAmisNonPris = []
        update()
    })


    document.getElementById("toutRetirer").addEventListener("click", function() {
        listeAmisNonPris = listeAmisNonPris.concat(listeAmisPris);
        listeAmisPris = []
        update()
    })

    /*
    listUsers => liste Nom/Prénom/uuid de tout les utilisateur
    listAmisUUID => UUID de tout amis
    listAmis => liste Nom/Prénom/uuid/procuration de tout les amis
    */
    let listUsers = await common.socketAsync('listUsersName',null)
    let listAmisBrut = await common.socketAsync('getAmis',null)
    console.log("brut",listAmisBrut)
    let listAmisUUID=[]
    listAmisBrut.forEach(child=>{
        listAmisUUID.push(child.uuid)
    })

    let listAmis=[]
    listUsers.forEach(child=>{
        let index = listAmisUUID.indexOf(child.uuid)
        if(index != -1){
            child.procuration=listAmisBrut[index].HeGiveMeProc
            child.DorI=null
            listAmis.push(child)
        }
    })


    let info = await common.socketAsync('getDataThisCreneau',{w:w,j:j,h:h})
    let listDemandes = await common.socketAsync('listDemandes',{w:w,j:j,h:h})
    let my_demande = await common.socketAsync("getMyDemande",{w:w,j:j,h:h})
    
    let divListeAmis = document.getElementById("listeAmis")
    let divAmisAjoute = document.getElementById("listeMange")

    //les listes des amis qui sont ou pas dans la demande(en UUID)
    let listeAmisNonPris = []
    let listeAmisPris = []

    //en fonction de l'étét de la demande on fait des truc
    if(info.ouvert==2 && Object.keys(await common.socketAsync('getMyDemande',{w:w,j:j,h:Math.abs(h-1)})).length === 0){
        document.querySelectorAll('input[name="sandwich"]')[0].checked=true
        if(Object.keys(my_demande).length === 0){
            //pas encore de demande
            document.getElementById("DIVdepot").classList.remove("cache")
            const AllAmis = common.readBoolCookie("allAmis")
            if(AllAmis){
                listeAmisPris=listAmisUUID
            }else{
                try{
                    listeAmisPris = common.readCookie("derniere demande").split("/")
                    listeAmisPris.pop()
                }catch(Exception){
                    listeAmisPris=[]
                }
            }
            if(true){
                document.getElementById("sandwich").classList.remove("cache")
            }
        }else if(my_demande.DorI==1){
            //inscrit
            document.getElementById("DIVinscrit").classList.remove("cache")
            listeAmisPris=my_demande.amis
        }else{
            //modif
            document.getElementById("DIVmodif").classList.remove("cache")
            listeAmisPris=my_demande.amis
            if(my_demande.sandwich==null){my_demande.sandwich=0}
            document.querySelectorAll('input[name="sandwich"]')[my_demande.sandwich].checked=true
            if(true){
                document.getElementById("sandwich").classList.remove("cache")
            }
        }
    }else{
        //n'a pas le droit de posser de demande sur le créneau
        quitDemande()
    }

    //complete la listeAmisnonPris avec les amis qui ne sont pas dans la liste pris
    listAmisUUID.forEach(child=>{
        let index = listeAmisPris.indexOf(child)
        if(index == -1){
            listeAmisNonPris.push(child)
        }
    })

    //ajoute les personnes qui sont dans la liste Pris met pas dans la liste d'ami global(s'elle de "/amis") dans listAmisUUID et listAmis
    listeAmisPris.forEach(child=>{
        let index = listAmisUUID.indexOf(child)
        if(index == -1){
            listAmisUUID.push(child)
            listUsers.forEach(user=>{
                if(child == user.uuid){
                    user.procuration=null
                    listAmis.push(user)
                }
            })
        }
    })

    //info
    let textScore = ""
    let score = await common.socketAsync("score",null)
    if (score <2) {
        textScore = score + " pt"
    }else{
        textScore = score + " pts"
    }
    let places = info.places

    let inscrits = 0
    let demandes = 0

    function update(){
        let pb = 0
        listeAmisPris.forEach(child=>{
            const index = listAmisUUID.indexOf(child)
            if(listAmis[index].DorI==0 || listAmis[index].DorI==null){
                pb++
            }
        })
        let p = document.getElementById("attentionAmis")
        if(pb == 0){
            p.innerHTML = ""
        }else if(pb == 1){
            p.innerHTML = "Attention, un ami n'a pas encore fait de demande"
        }else{
            p.innerHTML = "Attention, " + pb + " amis n'ont pas encore fait de demande"
        }



        divListeAmis.innerHTML=""
        divAmisAjoute.innerHTML=""
        listeAmisNonPris.forEach(function(child) {
            let ami = listAmis[listAmisUUID.indexOf(child)]
            const name = ami.first_name + " " + ami.last_name
            let button = document.createElement("button")
            button.classList.add("ami")
            button.setAttribute("id", ami.uuid);
            button.innerHTML = name
            divListeAmis.appendChild(button);
            button.addEventListener("click", function() {
                listeAmisPris.push(ami.uuid)
                listeAmisNonPris.splice(listeAmisNonPris.indexOf(ami.uuid),1)

                update()
            })
        })
        listeAmisPris.forEach(function(child) {
            let ami = listAmis[listAmisUUID.indexOf(child)]
            const name = ami.first_name + " " + ami.last_name
            let button = document.createElement("button")
            button.classList.add("ami")
            button.setAttribute("id", ami.uuid);
            button.innerHTML = name
            divAmisAjoute.appendChild(button);
            button.addEventListener("click", function() {
                listeAmisNonPris.push(ami.uuid)
                listeAmisPris.splice(listeAmisPris.indexOf(ami.uuid),1)

                update()
            })
        })
        for(let i in listAmis){
            let ami = listAmis[i];
            console.log(listAmis[i])
            if(ami.DorI == 0){
                document.getElementById(ami.uuid).innerHTML += " (a fait une demande)"
            }else if(ami.DorI == 1){
                document.getElementById(ami.uuid).innerHTML += " (est inscrit)"
            }
            if(ami.procuration == null){
                document.getElementById(ami.uuid).classList.add('partiel')
            }else if(ami.procuration == 1){
                document.getElementById(ami.uuid).classList.add('procuration')
            }
        }
    }

    listDemandes.forEach(function(child) {
        const index = listAmisUUID.indexOf(child.uuid)
        if(child.DorI==true){
            inscrits++
            if(index != -1){
                listAmis[index].DorI = 1
            }
        }else{
            demandes++
            if(index != -1){
                listAmis[index].DorI = 0
            }
        }
    });

    let reste = places - inscrits

    document.getElementById("info").innerHTML = "Demande enregistrée<br>pour le "+ day[j]  +  " à " + (h+11)+"h<br>"
    + reste + " places restantes<br>("
    + inscrits + " acceptées pour " + places + " places)<br>" + demandes
    + " demandes en cours<br>Votre score: " + textScore



    document.getElementById("envoyer").addEventListener("click", setMyDemande);
    document.getElementById("annuler").addEventListener("click", quitDemande);

    document.getElementById("retirer").addEventListener("click", suppMyDemande);
    document.getElementById("modif").addEventListener("click", setMyDemande);
    document.getElementById("PASmodif").addEventListener("click", quitDemande);

    document.getElementById("pass").addEventListener("click", async () => {
        common.loadpage("/pass")
    });

    document.getElementById("retour").addEventListener("click", quitDemande);

    update()
}