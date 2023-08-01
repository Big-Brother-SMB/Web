import * as common from "../../common.js";
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


let listDemandes = await common.socketAsync("list_demandes_perm",[w,j,h])
let listUsers = await common.socketAsync('list_users',null)

if(listDemandes.lenght!=0){
    divDemandes.innerHTML = ""
}
listDemandes.forEach(function(child) {
  if(child.DorI!=true){
    let name
    listUsers.forEach(child2=>{
        if(child.uuid==child2.uuid){
            name=child2.first_name+" "+child2.last_name
        }
    })
    let but = document.createElement("button")
    but.classList.add("amis")
    but.innerHTML = child.group2 +  " : " + child.nb +" (" + name + ")"

    if(child.uuid == common.uuid){
        but.addEventListener("click", async function(){
            but.remove()
            await common.socketAsync("my_demande_perm",[w,j,h,false])
        })
    }
    divDemandes.appendChild(but);
  }
})


document.getElementById("oui").addEventListener("click", async function() {
    let val = document.getElementById("input").value
    let nb = document.getElementById("nb").value
    if(val.lenght != 0 && nb != ""){
        await common.socketAsync("my_demande_perm",[w,j,h,val,nb])
        window.location.href = "perm.html";
    }
})

document.getElementById("article").style.display = "inline"
document.getElementById("chargement").style.display = "none"