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
        if(await common.socketAsync('delMyDemande',{w:w,j:j,h:h})=='ok'){
            common.loadpage("/midi")
        }
    }

    const setMyDemande = async function() {
        console.log(w,j,h)
        let str = ""
        let amis = []
        for(let i in boolAmis){
            if(boolAmis[i]){
                str += listAmisUuid[i] + "/"
                amis.push(listAmisUuid[i])
            }

        }
        common.writeCookie("derniere demande",str)

        if(await common.socketAsync('setMyDemande',{w:w,j:j,h:h,amis:amis})=='ok'){
            common.loadpage("/midi")
        }
    }

    const quitDemande = async function() {
        common.loadpage("/midi")
    }


    function updateConfirmation(){
        let pb = 0
        for(let i in boolAmis){
            if(boolAmis[i] && demandesAmis[i] == 0){
                pb++
            }
        }
        let p = document.getElementById("attentionAmis")
        if(pb == 0){
            p.innerHTML = ""
        }else if(pb == 1){
            p.innerHTML = "Attention, un ami n'a pas encore fait de demande"
        }else{
            p.innerHTML = "Attention, " + pb + " amis n'ont pas encore fait de demande"
        }

    }

    document.getElementById("toutAjouter").addEventListener("click", function() {
        for(let i in boolAmis){
            boolAmis[i] = true;
            divAmisAjoute.appendChild(butAmis[i]);
        }
        updateConfirmation()
    })


    document.getElementById("toutRetirer").addEventListener("click", function() {
        for(let i in boolAmis){
            boolAmis[i] = false;
            divListeAmis.appendChild(butAmis[i]);
        }
        updateConfirmation()
    })



    let info = await common.socketAsync('getDataThisCreneau',{w:w,j:j,h:h})
    let listDemandes = await common.socketAsync('listDemandes',{w:w,j:j,h:h})
    let my_demande = await common.socketAsync("getMyDemande",{w:w,j:j,h:h})

    if(info.ouvert==2 && Object.keys(await common.socketAsync('getMyDemande',{w:w,j:j,h:Math.abs(h-1)})).length === 0){
        if(Object.keys(my_demande).length === 0){
            document.getElementById("DIVdepot").style.display='initial'
        }else if(my_demande.DorI==1){
            document.getElementById("DIVinscrit").style.display='initial'
        }else{
            document.getElementById("DIVmodif").style.display='initial'
        }
    }else{
        quitDemande()
    }


    let textScore = ""
    let score = await common.socketAsync("score",null)
    if (score <2) {
        textScore = score + " pt"
    }else{
        textScore = score + " pts"
    }

    let listUsers = await common.socketAsync('listUsersName',null)
    let listAmisUuid = await common.socketAsync('getAmis',null)
    let listAmis=[]
    listUsers.forEach(child=>{
        if(listAmisUuid.indexOf(child.uuid)!=-1){
            listAmis.push(child)
        }
    })
    listAmisUuid=[]
    listAmis.forEach(child=>{
        listAmisUuid.push(child.uuid)
    })



    let divListeAmis = document.getElementById("liste d'amis")
    let divAmisAjoute = document.getElementById("amis ajoutés")
    let demandesAmis = []
    let amisCookie = []
    try{
        amisCookie = commmon.readCookie("derniere demande").split("/")
    }catch(Exception){}

    let boolAmis = []
    let butAmis = []
    let inscrits = 0
    let places = info.places
    let demandes = 0

    const boolAllAmis = common.readBoolCookie("allAmis")


    if(info.ouvert != 2 || my_demande.amis==undefined){
        //common.loadpage("/midi")
    }

    let i=0
    listAmis.forEach(function(child) {
        const amiID = child.uuid
        const name = child.first_name + " " + child.last_name
        demandesAmis.push(0)
        boolAmis.push(my_demande.amis.indexOf(child.uuid) != -1)
        butAmis[i] = document.createElement("button")
        butAmis[i].classList.add("amis")
        butAmis[i].innerHTML = name
        if(boolAmis[i]){
            divAmisAjoute.appendChild(butAmis[i]);
        }else{
            divListeAmis.appendChild(butAmis[i]);
        }

        const num = i
        butAmis[num].addEventListener("click", function() {
            if(boolAmis[num]){
                divListeAmis.appendChild(butAmis[num]);
            }else{
                divAmisAjoute.appendChild(butAmis[num]);
            }
            boolAmis[num] = !boolAmis[num]
            updateConfirmation()
        })

        i++
    })

    listDemandes.forEach(function(child) {
        const index = listAmisUuid.indexOf(child.uuid)
        if(child.DorI==true){
            inscrits++
            if(index != -1){
                demandesAmis[index] = 2
            }
        }else{
            demandes++
            if(index != -1){
                demandesAmis[index] = 1
            }
        }
    });

    for(let i in demandesAmis){
        if(demandesAmis[i] == 1){
            butAmis[i].innerHTML += " (a fait une demande)"
        }else if(demandesAmis[i] == 2){
            butAmis[i].innerHTML += " (est inscrit)"
        }
    }

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
        //common.loadpage("/pass")
    });

    document.getElementById("retour").addEventListener("click", quitDemande);

    updateConfirmation()
}