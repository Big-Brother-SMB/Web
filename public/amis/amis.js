import * as common from "../common.js";

let divAmis = document.getElementById("amis")

let listUsers=await common.socketAsync('list_users',null)
let listAmisUuid=await common.socketAsync('amis','get')
let listAmis=[]
listUsers.forEach(child=>{
    if(listAmisUuid.indexOf(child.uuid)!=-1){
        listAmis.push(child)
    }
})


function reload(){
    divAmis.innerHTML = ""
    listAmis.forEach(child=>{
        let ami = document.createElement("button")
        ami.classList.add("amis")

        ami.innerHTML = child.first_name + " " + child.last_name
        ami.addEventListener("click", function() {
            listAmisUuid.splice(listAmisUuid.indexOf(child.uuid),1)
            listAmis.splice(listAmis.indexOf(child),1)
            common.socketAsync('amis',listAmisUuid)
            reload()
        })
        divAmis.appendChild(ami);
    })


    let users=[]
    let usersNames=[]

    listUsers.forEach(function(child) {
        if(child.uuid != common.uuid && listAmisUuid.indexOf(child.uuid) == -1){
            users.push(child)
            usersNames.push(child.first_name + " " + child.last_name)
        }
    })
    common.autocomplete(document.getElementById("addAmi"), usersNames,function(){});

    console.log(usersNames)
    console.log(users)
    console.log(listAmisUuid)
    document.getElementById("ajout").addEventListener("click", function() {
        let ami = document.getElementById("addAmi").value
        console.log(usersNames.indexOf(ami))
        if(usersNames.indexOf(ami) != -1){
            if(listAmisUuid.indexOf(users[usersNames.indexOf(ami)].uuid) == -1){
                listAmisUuid.push(users[usersNames.indexOf(ami)].uuid)
                listAmis.push(users[usersNames.indexOf(ami)])
                common.socketAsync('amis',listAmisUuid)
                reload()
            }
        }
    })
}

reload()