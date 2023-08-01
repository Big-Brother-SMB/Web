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
listAmisUuid=[]
listAmis.forEach(child=>{
    listAmisUuid.push(child.uuid)
})



function reload(){
    divAmis.innerHTML = ""
    listAmis.forEach(child=>{
        let ami = document.createElement("button")
        ami.classList.add("amis")
        ami.innerHTML=FindMyName(child.key)
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

function suite1(){
    console.log(amis)
    let users = []
    let usersNames = []
    database.ref("names").once("value", function(snapshot) {
        snapshot.forEach(function(child) {
            if(child.key != user && amis.indexOf(child.key) == -1){
                users.push(child.key)
                usersNames.push(snapshot.child(child.key).val())
            }
        })
        autocomplete(document.getElementById("addAmi"), usersNames,function(){});
    })

    console.log(listAmisUuid)
    document.getElementById("ajout").addEventListener("click", function() {
        let ami = document.getElementById("addAmi").value
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