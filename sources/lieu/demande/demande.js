const day = ["Lundi", "Mardi","Jeudi","Vendredi"]

class Ami{
    static common;

    constructor(uuid,first_name,last_name,inscrit){
        this.uuid = uuid
        this.first_name = first_name
        this.last_name = last_name
        this.inscrit = inscrit
    }

    static searchAmiUUID(list,uuid){
        for(let i in list){
            if(list[i].uuid==uuid){
                return list[i]
            }
        }
        return null;
    }
}

export async function init(common){
    Ami.common = common

    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    let j = 0
    let h = 0
    let w = 0
    let lieu = ""

    if(params.j!=null){
        j = parseInt(params.j)
    }
    if(params.h!=null){
        h = parseInt(params.h)
    }
    if(params.w!=null){
        w = parseInt(params.w)
    }
    if(params.lieu!=null){
        lieu = params.lieu
        document.getElementById('title').innerHTML=lieu
    }


    document.getElementById("btn_retour").classList.remove("cache")
    document.getElementById("btn_retour").setAttribute("url","/lieu?lieu="+lieu)

    let info = await common.socketAsync('getLieuInfo',{lieu:lieu,w:w,j:j,h:h})
    let listInscriptions = await common.socketAsync('getAllLieuList',{w:w,j:j,h:h})
    let my_demande = await common.socketAsync("getMyLieu",{w:w,j:j,h:h})

    let my_demande_inscrit = (my_demande != null && my_demande.lieu == lieu)

    /*
    listUsers => liste Nom/Prénom/uuid de tout les utilisateur
    listAmisUUID => UUID de tout amis
    listAmis => liste Nom/Prénom/uuid/procuration de tout les amis
    */
    let listUsers = await common.socketAsync('getListUserName',null)
    let listAmisBrut = await common.socketAsync('getAmis',null)

    //créer la liste d'amis global
    let listAmis=[]

    listAmisBrut.forEach(child=>{
        if(child.HeGiveMeProc){
            listAmis.push(new Ami(child.uuid,"","",null))
        }
    })

    //on récupère les nom
    listUsers.forEach(user=>{
        listAmis.forEach(ami=>{
            if(ami.uuid == user.uuid){
                ami.first_name = user.first_name
                ami.last_name = user.last_name
            }
        })
    })
    common.nameOrder(listAmis)
    



    if(info.ouvert!=1 || info.places==undefined || info.places==null || info.places==0){
        common.loadpage("/lieu?lieu="+lieu)
    }

    let NBinscrits = 0
    let NBAmisinscrits = 0

    listInscriptions.forEach(function(child) {
        let ami = Ami.searchAmiUUID(listAmis,child.uuid)

        if(child.lieu==lieu){
            NBinscrits++
            if(ami != null){
                NBAmisinscrits++
                ami.inscrit = 1
            }
        }else{
            if(ami != null){
                ami.inscrit = 0
            }
        }
    });

    if(my_demande_inscrit){
        NBAmisinscrits++
    }

    let reste = info.places - NBinscrits



    //fromulaire
    let from = document.getElementById('amis')

    let textIntro = document.createElement('p')
    textIntro.innerHTML="Déposer une inscription pour:"
    from.appendChild(textIntro)


    //moi
    let box = document.createElement('input')
    box.setAttribute("type","checkbox")
    box.setAttribute("name","procuration")
    box.setAttribute("value","moi")
    if(my_demande_inscrit){
        box.setAttribute("checked",true)
    }
    from.appendChild(box)

    let label = document.createElement('label')
    label.setAttribute("for","procuration")
    label.innerHTML = common.name(common.first_name,common.last_name)
    from.appendChild(label)
    from.innerHTML+='<br>'

    //mes amis
    listAmis.forEach(ami=>{
        let box = document.createElement('input')
        box.setAttribute("type","checkbox")
        box.setAttribute("name","procuration")
        box.setAttribute("value",ami.uuid)
        if(ami.inscrit==1){
            box.setAttribute("checked",true)
        }
        from.appendChild(box);

        let label = document.createElement('label')
        label.setAttribute("for","procuration")
        label.innerHTML = common.name(ami.first_name,ami.last_name)
        from.appendChild(label)
        from.innerHTML+='<br>'
    })

    document.getElementById("envoyer").addEventListener('click',async ()=>{
        if(limite<=0){
            const checkBoxs = document.querySelectorAll('input[name="procuration"]');
            for (const checkBox of checkBoxs) {
                if(checkBox.checked){
                    if(checkBox.value=="moi"){
                        if(!my_demande_inscrit){
                            await common.socketAsync('setMyLieu',{lieu:lieu,w:w,j:j,h:h})
                        }
                    }else{
                        if(Ami.searchAmiUUID(listAmis,checkBox.value).inscrit != 1){
                            await common.socketAsync('setAmiLieu',{uuidAmi:checkBox.value,lieu:lieu,w:w,j:j,h:h})
                        }
                    }
                }else if(!checkBox.checked){
                    if(checkBox.value=="moi"){
                        if(my_demande_inscrit){
                            await common.socketAsync('delMyLieu',{w:w,j:j,h:h})
                        }
                    }else{
                        if(Ami.searchAmiUUID(listAmis,checkBox.value).inscrit == 1){
                            await common.socketAsync('delAmiLieu',{uuidAmi:checkBox.value,w:w,j:j,h:h})
                        }
                    }
                }
            }
            common.loadpage("/lieu?lieu="+lieu)
        }
    })

    document.getElementById("annuler").addEventListener('click',async ()=>{
        common.loadpage("/lieu?lieu="+lieu)
    })





    let limite
    from.addEventListener("change",()=>{
        update()
    })
    function update(){
        limite = -reste
        const checkBoxs = document.querySelectorAll('input[name="procuration"]');
        for (const checkBox of checkBoxs) {
            if (checkBox.checked) {
                if(checkBox.value=="moi"){
                    if(!my_demande_inscrit) limite++
                }else{
                    if(Ami.searchAmiUUID(listAmis,checkBox.value).inscrit != 1) limite++
                }
            }else if(!checkBox.checked){
                if(checkBox.value=="moi"){
                    if(my_demande_inscrit) limite--
                }else{
                    if(Ami.searchAmiUUID(listAmis,checkBox.value).inscrit == 1) limite--
                }
            }
        }

        let p = document.getElementById("attentionAmis")
        if(limite <= 0){
            p.innerHTML = ""
        }else if(limite == 1){
            p.innerHTML = "Attention, il y a une personne en trop"
        }else{
            p.innerHTML = "Attention, il y a " + limite + " personnes en trop"
        }
    }
    update()
}