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


    document.getElementById("btn_retour").classList.remove("cache")
    document.getElementById("btn_retour").setAttribute("url","/admin/midi/creneau?j="+j+"&h="+h+"&w="+w)

    let table = document.getElementById("tbody")

    let listDemandes = await common.socketAsync('listDemandes',{w:w,j:j,h:h})

    let usersList = common.nameOrder(await common.socketAdminAsync('getListPass',null))

    for(let i in usersList){
        usersList[i].name = common.name(usersList[i].first_name,usersList[i].last_name)
    }

    usersList.sort((a, b) => (a.name > b.name) ? 1 : -1)
    let affList=[]

    for(let i in usersList){
        listDemandes.forEach(d=>{
            if(d.uuid==usersList[i].uuid){
                console.log(usersList[i])
                affList.push(usersList[i])
                const index = affList.length - 1
                let ligne = document.createElement("tr")
                affList[index].ligne=ligne
                table.appendChild(ligne)
                affList[index].demande=d
            }
        })
    }

    for(let i in affList){
        reloadLigne(affList[i])
    }

    function reloadLigne(user){
        user.ligne.innerHTML=""
        let col= document.createElement("td")
        col.innerHTML=user.name
        user.ligne.appendChild(col)

        col= document.createElement("td")
        col.innerHTML=user.classe
        user.ligne.appendChild(col)

        let colD= document.createElement("td")
        let colI= document.createElement("td")
        if(!user.demande.DorI){
            colI.innerHTML="-------"
            colD.innerHTML="demande"
            colI.addEventListener("click",async ()=>{
                console.log('click')
                await common.socketAdminAsync('setDorI',[w,j,h,user.uuid,true])
                user.demande.DorI=true
                reloadLigne(user)
            })  
        } else {
            colI.innerHTML="inscrit"
            colD.innerHTML="-------"
            colD.addEventListener("click",async ()=>{
                console.log('click')
                await common.socketAdminAsync('setDorI',[w,j,h,user.uuid,false])
                await common.socketAdminAsync('scan',[w,j,h,user.uuid,false])
                user.demande.scan=false
                user.demande.DorI=false
                reloadLigne(user)
            })
        }
        user.ligne.appendChild(colD)
        user.ligne.appendChild(colI)

        col= document.createElement("td")
        if(user.demande.scan==true){
            col.innerHTML="S"
        }else{
            col.innerHTML="X"
        }
        user.ligne.appendChild(col)

        col= document.createElement("td")
        col.innerHTML=new String(user.code_barre)
        user.ligne.appendChild(col)

        let colS= document.createElement("td")
        colS.innerHTML="suppr"
        colS.addEventListener("click",async ()=>{
            await common.socketAdminAsync('delDorI',[w,j,h,user.uuid])
            user.demande=null

            affList.splice([...table.children].indexOf(user.ligne),1)
            table.removeChild(user.ligne)
            user.ligne=null
        })
        user.ligne.appendChild(colS)
    }


    let search = document.getElementById("search")

    let utilisateursNames=[]
    usersList.forEach(function(child) {
        utilisateursNames.push(child.name)
    })
    common.autocomplete(search, utilisateursNames,function(val){},true)

    let demande=document.getElementById("demande")
    let inscrit=document.getElementById("inscrit")
    demande.addEventListener("click",async function(){
        if(utilisateursNames.indexOf(search.value)!=-1){
            let user = usersList[utilisateursNames.indexOf(search.value)]
            let dejaInscrit = null
            for(let i in affList){
                if(affList[i].uuid==user.uuid)
                    dejaInscrit=i
            }
            if(dejaInscrit===null){
                user.demande={semaine: w,
                    creneau: j*2+h,
                    uuid: user.uuid,
                    scan: 0,
                    DorI: 0,
                    amis: []}
                affList.push(user)
                affList.sort((a, b) => (a.name > b.name) ? 1 : -1)
                
                table.insertRow(affList.indexOf(user))
                let ligne=table.children[affList.indexOf(user)]
                user.ligne=ligne
                reloadLigne(user)
            }else{
                affList[dejaInscrit].demande.DorI=false
                affList[dejaInscrit].demande.scan=false
                reloadLigne(user)
            }
            await common.socketAdminAsync('setDorI',[w,j,h,user.uuid,false])
            await common.socketAdminAsync('scan',[w,j,h,user.uuid,false])
        }
    })


    inscrit.addEventListener("click",async function(){
        if(utilisateursNames.indexOf(search.value)!=-1){
            let user = usersList[utilisateursNames.indexOf(search.value)]
            let dejaInscrit = null
            for(let i in affList){
                if(affList[i].uuid==user.uuid)
                    dejaInscrit=i
            }
            if(dejaInscrit===null){
                user.demande={semaine: w,
                    creneau: j*2+h,
                    uuid: user.uuid,
                    scan: 0,
                    DorI: 1,
                    amis: []}
                affList.push(user)
                affList.sort((a, b) => (a.name > b.name) ? 1 : -1)
                
                table.insertRow(affList.indexOf(user))
                let ligne=table.children[affList.indexOf(user)]
                user.ligne=ligne
                reloadLigne(user)
            }else{
                affList[dejaInscrit].demande.DorI=true
                reloadLigne(user)
            }
            await common.socketAdminAsync('setDorI',[w,j,h,user.uuid,true])
        }
    })
}