export async function init(common){
    document.getElementById("btn_retour").classList.remove("cache")
    document.getElementById("btn_retour").setAttribute("url","/admin/pret")

    let tbody = document.getElementById("tbody")

    let utilisateursUUID=[]
    let utilisateursNames=[]

    let listUsers=await common.socketAdminAsync('getListUser',null)
    listUsers.forEach(function(child) {
        utilisateursUUID.push(child.uuid)
        utilisateursNames.push(common.name(child.first_name,child.last_name))
    })

    async function update(){
        let listPret = await common.socketAdminAsync("getAllPrets",null)
        tbody.innerHTML=''
        listPret.forEach(child => {
            let ligne = document.createElement("tr")
    
            let col = document.createElement("td")
            col.innerHTML = utilisateursNames[utilisateursUUID.indexOf(child.uuid)]
            ligne.appendChild(col)
        
            col = document.createElement("td")
            col.innerHTML = child.objet
            ligne.appendChild(col)
        
            col = document.createElement("td")
            col.innerHTML = common.getDateHour(new Date(child.debut))
            ligne.appendChild(col)
        
            col = document.createElement("td")
            if(child.fin==null){
                col.innerHTML = "En cours"
            }else{
                col.innerHTML = common.getDateHour(new Date(child.fin))
            }
            ligne.appendChild(col)
        
            col = document.createElement("td")
            col.style.maxWidth = "2em"
            if(child.commentaire==null){
                col.innerHTML = "RAS"
            }else{
                col.innerHTML = "..."
            }
            col.addEventListener('click',()=>{
                common.popUp_Active('Commentaire','attente',async (bnt)=>{
                    let text = document.createElement('textarea')
                    text.value = child.commentaire
                    text.setAttribute("placeholder","Ecrivez ici")
                    document.getElementById('popup-body').innerHTML=''
                    document.getElementById('popup-body').appendChild(text)
            
                    bnt.innerHTML='Confirmer'
                    bnt.addEventListener('click',async ()=>{
                        let com = text.value
                        if(com=="") com=null
                        await common.socketAdminAsync("commentairePret",{obj:child.objet,uuid:child.uuid,debut:child.debut,com:com})
                        common.popUp_Stop()
                        update()
                    }, { once: true })
                })
            })
            ligne.appendChild(col)
            
            tbody.insertBefore(ligne, tbody.children[0]);
        });
    }

    update()
}