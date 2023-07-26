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
    
    let divDemandes = document.getElementById("demandes")
    
    
    let listDemandes = await common.socketAsync("listDemandesPerm",{w:w,j:j,h:h})
    let listUsers = await common.socketAsync('listUsersName',null)
    
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
    
    
    document.getElementById("oui").addEventListener("click", async function() {
        let nameOfGroup = document.getElementById("input").value
        let nb = document.getElementById("nb").value
        if(nameOfGroup.lenght != 0 && nb != ""){
            await common.socketAsync("setMyDemandePerm",{w:w,j:j,h:h,group:nameOfGroup,nb:nb})
            common.loadpage("/perm")
        }
    })
    document.getElementById("non").addEventListener("click", async function() {
      common.loadpage("/perm")
  })
}