export async function init(common){
    if(common.admin_permission["foyer_perm"]!==2) common.loadpage("/options")

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

    let catalogueMap = new Map();
    let listCatalog = await common.socketAdminAsync('getObjetsCatalog', null) || [];
    listCatalog.forEach(item => {
        catalogueMap.set(item.code, item.nom);
    });

    async function update(){
        let listPret = await common.socketAdminAsync("getAllPrets",null) || []
        tbody.innerHTML=''

        listPret.forEach(child => {
            let ligne = document.createElement("tr")

            // Colonne Nom
            let col = document.createElement("td")
            let userIndex = utilisateursUUID.indexOf(child.uuid)
            col.innerHTML = userIndex !== -1 ? utilisateursNames[userIndex] : "Inconnu"
            ligne.appendChild(col)

            // Colonne Objet : Traduction du code si présent dans le catalogue, sinon texte brut
            col = document.createElement("td")
            let nomAffiche = catalogueMap.has(child.objet) ? catalogueMap.get(child.objet) : child.objet
            col.innerHTML = nomAffiche
            ligne.appendChild(col)

            // Colonne Début
            col = document.createElement("td")
            col.innerHTML = common.getDateHour(new Date(child.debut))
            ligne.appendChild(col)

            // Colonne Fin
            col = document.createElement("td")
            if(child.fin==null){
                col.innerHTML = "En cours"
            }else{
                col.innerHTML = common.getDateHour(new Date(child.fin))
            }
            ligne.appendChild(col)

            // Colonne Commentaire
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
                    text.value = child.commentaire || ""
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