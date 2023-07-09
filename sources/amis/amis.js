export async function init(common){
    let divAmis = document.getElementById("amis")

    let listUsers=await common.socketAsync('listUsersName',null)
    let listAmisUuid=await common.socketAsync('getAmis','get')
    
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

            ami.innerHTML = child.first_name + " " + child.last_name
            ami.addEventListener("click", function() {
                listAmisUuid.splice(listAmisUuid.indexOf(child.uuid),1)
                listAmis.splice(listAmis.indexOf(child),1)
                common.socketAsync('setAmis',listAmisUuid)
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

        console.log(listAmisUuid)
        document.getElementById("ajout").addEventListener("click", function() {
            let ami = document.getElementById("addAmi").value
            if(usersNames.indexOf(ami) != -1){
                if(listAmisUuid.indexOf(users[usersNames.indexOf(ami)].uuid) == -1){
                    listAmisUuid.push(users[usersNames.indexOf(ami)].uuid)
                    listAmis.push(users[usersNames.indexOf(ami)])
                    common.socketAsync('setAmis',listAmisUuid)
                    reload()
                }
            }
        })
    }

    reload()
    
}