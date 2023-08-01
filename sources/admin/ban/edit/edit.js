export async function init(common){
    document.getElementById("btn_retour").classList.remove("cache")
    document.getElementById("btn_retour").setAttribute("url","/admin/ban")

    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    let id = params.id

    let listBan = await common.socketAdminAsync('getBan',null)
    
    let listUsers = await common.socketAsync('listUsersName',null)

    let obj = null

    let i = 0
    while(listBan.length>i && obj==null){
        const x = listBan[i]
        if(id==x.id){
            obj=x
        }
        i++
    };
    
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
            await common.socketAdminAsync('delBan',id)
            common.loadpage("/admin/ban")
        })
    }





    let save = document.getElementById("save")
    
    let debut=document.getElementById("debut")
    let fin=document.getElementById("fin")
    let justificatif = document.getElementById("justificatif")

    if(obj==null){
        debut.value=common.actualWeek
        fin.value=common.actualWeek
        justificatif.value=''
        save.addEventListener("click",()=>{
            listSelect.forEach(async (e)=>{
                let dateDebut = common.generedDate(debut.value,1,0,0,0)
                let dateFin = common.generedDate(fin.value,0,0,0,0)
                await common.socketAdminAsync('newBan',{uuid:e.uuid,debut:dateDebut,fin:dateFin,justificatif:justificatif.value})
            })
            common.loadpage("/admin/ban")
        })
    }else{
        debut.value=new Date(obj.debut).getWeek()
        fin.value=new Date(obj.fin).getWeek()
        justificatif.value=obj.justificatif
        save.addEventListener("click",async ()=>{
            let dateDebut = common.generedDate(debut.value,1,0,0,0)
            let dateFin = common.generedDate(fin.value,0,0,0,0)
            await common.socketAdminAsync('modifBan',{id:id,uuid:obj.uuid,debut:dateDebut,fin:dateFin,justificatif:justificatif.value})
            common.loadpage("/admin/ban")
        })
    }
}