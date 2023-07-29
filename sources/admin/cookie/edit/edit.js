export async function init(common){
    document.getElementById("btn_retour").classList.remove("cache")
    document.getElementById("btn_retour").setAttribute("url","/admin/cookie")

    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    let id = params.id
    let modeAbo=params.modeAbo === "true"

    let listAbo = await common.socketAdminAsync('getCookieSubscription',null)
    let listBon = await common.socketAdminAsync('getCookieTicket',null)
    
    let listUsers = await common.socketAsync('listUsersName',null)

    let obj = null

    if(modeAbo){
        let i = 0
        while(listAbo.length>i && obj==null){
            const x = listAbo[i]
            if(id==x.id){
                obj=x
            }
            i++
        };
    }else{
        let i=0
        while(listBon.length>i && obj==null){
            const x = listBon[i]
            if(id==x.id){
                obj=x
            }
            i++
        };
    }
    
    let listSelect = []
    let users=[]
    let usersNames=[]

    if(obj==null){
        const update = function(){
            document.getElementById("listUsers").innerHTML=''

            listSelect.forEach(child=>{
                let ami = document.createElement("button")
                ami.classList.add("ami")
                ami.innerHTML = common.name(child.first_name,child.last_name)
                ami.addEventListener("click", async function() {
                    listSelect.splice(listSelect.indexOf(child),1)
                    update()
                })
                document.getElementById("listUsers").appendChild(ami);
            })
    
            users=[]
            usersNames=[]
            listUsers.forEach(function(child) {
                if(listSelect.indexOf(child) == -1){
                    users.push(child)
                    usersNames.push(common.name(child.first_name,child.last_name))
                }
            })
            common.autocomplete(document.getElementById("addUser"), usersNames,()=>{
                let user = document.getElementById("addUser").value
                document.getElementById("addUser").value=''
                if(usersNames.indexOf(user) != -1){
                    listSelect.push(users[usersNames.indexOf(user)])
                }
                update()
            },true);
        }
        update()
        document.getElementById("sectionNew").classList.remove("cache")
    }else{
        let i=0
        while(listUsers.length>i && obj.first_name==null){
            const x = listUsers[i]
            if(obj.uuid==x.uuid){
                obj.first_name=x.first_name
                obj.last_name=x.last_name
            }
            i++
        };
        document.getElementById("info").innerHTML=common.name(obj.first_name,obj.last_name)

        let supp = document.getElementById("supp")
        supp.classList.remove("cache")
        supp.addEventListener('click',async ()=>{
            if(modeAbo){
                await common.socketAdminAsync('delCookieSubscription',id)
            }else{
                await common.socketAdminAsync('delCookieTicket',id)
            }
            common.loadpage("/admin/cookie")
        })
    }

    let save = document.getElementById("save")
    if(modeAbo){
        document.getElementById("sectionAbonnement").classList.remove("cache")
        let debut=document.getElementById("debut")
        let fin=document.getElementById("fin")
        const listPeriod = ["Hebdomadaire (1w)","Bimensuel (2w)","Mensuel (4w)"]
        let period = document.getElementById("period")
        for(let i in listPeriod){
            let opt = document.createElement("option")
            opt.innerHTML = listPeriod[i]
            period.appendChild(opt);
        }
        let nbAdd = document.getElementById("nbAdd")
        let cumulatif = document.getElementById("cumulatif")
        let justificatif = document.getElementById("justificatif")

        if(obj==null){
            debut.value=common.actualWeek
            fin.value=common.actualWeek
            period.selectedIndex=0
            nbAdd.value=1
            cumulatif.checked=true
            justificatif.value=''
            save.addEventListener("click",()=>{
                listSelect.forEach(async (e)=>{
                    let dateDebut = common.generedDate(debut.value,1,0,0,0)
                    let dateFin = common.generedDate(fin.value,6,0,0,0)
                    await common.socketAdminAsync('newCookieSubscription',{uuid:e.uuid,debut:dateDebut,fin:dateFin,justificatif:justificatif.value,period:period.selectedIndex,cumulatif:cumulatif.checked,nbAdd:nbAdd.value})
                })
                common.loadpage("/admin/cookie")
            })
        }else{
            let nbCookie = document.getElementById("nbCookie")
            document.getElementById("nbCookieP").classList.remove('cache')
            nbCookie.value=obj.quantity

            debut.value=new Date(obj.debut).getWeek()
            fin.value=new Date(obj.fin).getWeek()
            period.selectedIndex=obj.period
            nbAdd.value=obj.nbAdd
            cumulatif.checked=obj.cumulatif
            justificatif.value=obj.justificatif
            save.addEventListener("click",async ()=>{
                let dateDebut = common.generedDate(debut.value,1,0,0,0)
                let dateFin = common.generedDate(fin.value,6,0,0,0)
                await common.socketAdminAsync('modifCookieSubscription',{id:id,uuid:obj.uuid,debut:dateDebut,fin:dateFin,justificatif:justificatif.value,period:period.selectedIndex,cumulatif:cumulatif.checked,nbAdd:nbAdd.value,quantity:nbCookie.value})
                common.loadpage("/admin/cookie")
            })
        }
    }else{
        document.getElementById("sectionTicket").classList.remove("cache")
        let use=document.getElementById("use")
        let justificatif = document.getElementById("justificatif2")

        if(obj==null){
            use.checked=false
            justificatif.value=''
            save.addEventListener("click",()=>{
                listSelect.forEach(async (e)=>{
                    let useDate = null
                    if(use.checked){
                        useDate = new Date()
                    }
                    await common.socketAdminAsync('newCookieTicket',{uuid:e.uuid,date:useDate,justificatif:justificatif.value})
                })
                common.loadpage("/admin/cookie")
            })
        }else{
            use.checked = obj.date!=null
            justificatif.value = obj.justificatif
            save.addEventListener("click",async ()=>{
                let useDate = null
                if(use.checked){
                    useDate = new Date()
                }
                await common.socketAdminAsync('modifCookieTicket',{id:id,uuid:obj.uuid,date:useDate,justificatif:justificatif.value})
                common.loadpage("/admin/cookie")
            })
        }
    }
}