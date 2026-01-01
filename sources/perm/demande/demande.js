export async function init(common){
    document.getElementById("btn_retour").classList.remove("cache")
    document.getElementById("btn_retour").setAttribute("url","/perm")
    
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
    
    let divDemandes = document.getElementById("demandes")
    
    
    let listDemandes = await common.socketAsync("listDemandesPerm",{w:w,j:j,h:h})
    let listUsers = await common.socketAsync('getListUserName',null)
    
    if(listDemandes.lenght!=0){
        divDemandes.innerHTML = ""
    }
    listDemandes.forEach(function(child) {
      if(child.DorI!=true){
        let name
        listUsers.forEach(child2=>{
            if(child.uuid==child2.uuid){
                name= common.name(child2.first_name,child2.last_name)
            }
        })
        let but = document.createElement("button")
        but.classList.add("ami")
        but.innerHTML = child.group2 +  " : " + child.nb +" (" + name + ")"
    
        if(child.uuid == common.uuid){
            but.addEventListener("click", async function(){
                but.remove()
                await common.socketAsync("delMyDemandePerm",{w:w,j:j,h:h})
            })
        }
        divDemandes.appendChild(but);
      }
    })
    
    
    document.getElementById("validate").addEventListener("click", async function() {
        let nameOfGroup = document.getElementById("input").value
        let nb = document.getElementById("nb").value
        let demande_already_exists = false
        if(nameOfGroup.lenght != 0 && nb != ""){
            listDemandes.forEach(demande => {
                if (demande.group2 === nameOfGroup){
                    demande_already_exists = true
                }
            })
            if (!demande_already_exists){
                await common.socketAsync("setMyDemandePerm",{w:w,j:j,h:h,group:nameOfGroup,nb:nb})
                common.loadpage("/perm")
            } else {
                document.getElementById("validate").classList.add("wrong_input")
                document.getElementById("validate").innerHTML = "Une demande a déjà était faite pour ce groupe. Cliquer pour réessayer"
            }
        }
    })
}