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
    document.getElementById("btn_retour").setAttribute("url","/admin/localisation/historique")

    let table = document.getElementById("tbody")
    
    let usersList = common.nameOrder(await common.socketAdminAsync('getListPass',null))

    let listScan = await common.socketAsync('getAllLieuList',{w:w,j:j,h:h});

    for(let i in usersList){
        usersList[i].name = common.name(usersList[i].first_name,usersList[i].last_name)
    }

    let affList=[]

    for(let i in usersList){
        listScan.forEach(scan=>{
            if(scan.uuid==usersList[i].uuid){
                console.log(usersList[i])
                affList.push(usersList[i])
                const index = affList.length - 1
                let ligne = document.createElement("tr")
                if(scan.scan){
                    ligne.classList.add("greenLine")
                }
                affList[index].ligne=ligne
                table.appendChild(ligne)
                affList[index].scan = scan
            }
        })
    }

    for(let i in affList){
        reloadLigne(affList[i])
    }

    function reloadLigne(user){
        user.ligne.innerHTML=""

        let col= document.createElement("td")
        col.innerHTML = user.scan.lieu
        user.ligne.appendChild(col)

        col= document.createElement("td")
        col.innerHTML=user.name
        user.ligne.appendChild(col)

        col= document.createElement("td")
        col.innerHTML=user.classe
        user.ligne.appendChild(col)

        col= document.createElement("td")
        col.innerHTML=new String(user.code_barre)
        user.ligne.appendChild(col)

        let colS= document.createElement("td")
        colS.innerHTML="suppr"
        colS.addEventListener("click",async ()=>{
            await common.socketAdminAsync('delUserLieu',{w:w,j:j,h:h,uuid:user.uuid});
            user.demande=null

            affList.splice([...table.children].indexOf(user.ligne),1)
            table.removeChild(user.ligne)
            user.ligne=null
        })
        user.ligne.appendChild(colS)
    }
}