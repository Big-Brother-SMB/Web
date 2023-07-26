export async function init(common){
    let tbody = document.getElementById("tbody")

    let utilisateursUUID=[]
    let utilisateursNames=[]

    let listUsers=await common.socketAdminAsync('list pass',null)
    listUsers.forEach(function(child) {
        utilisateursUUID.push(child.uuid)
        utilisateursNames.push(child.first_name+" "+child.last_name)
    })

    async function update(){
        let listPret = await common.socketAdminAsync("getAllPrets",null)
        console.log(listPret)
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
            col.innerHTML = child.debut
            ligne.appendChild(col)
        
            col = document.createElement("td")
            if(child.fin==null){
                col.innerHTML = "En cours"
            }else{
                col.innerHTML = child.fin
            }
            ligne.appendChild(col)
        
            col = document.createElement("td")
            if(child.commentaire==null){
                col.innerHTML = "RAS"
            }else{
                col.innerHTML = col.innerHTML = child.commentaire
            }
            col.addEventListener('click',()=>{
                common.popUp_Active('Commentaire','attente',async (bnt)=>{
                    let text = document.createElement('textarea')
                    document.getElementById('popup-body').innerHTML=''
                    document.getElementById('popup-body').appendChild(text)
            
                    bnt.innerHTML='Confirmer'
                    bnt.addEventListener('click',async ()=>{
                        console.log(text.value)
                        await common.socketAdminAsync("commentairePret",{obj:child.objet,uuid:child.uuid,debut:child.debut,com:text.value})
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