export async function init(common){
    let divAmis = document.getElementById("amis")

    let listUsers=await common.socketAsync('listUsersName',null)
    let users=[]
    let usersNames=[]

    let listAmisUUID=[]
    let listAmisBrut=[]
    let listAmis=[]
    async function reload(){
        listAmisBrut=await common.socketAsync('getAmis',null)

        listAmisUUID=[]
        listAmisBrut.forEach(child=>{
            listAmisUUID.push(child.uuid)
        })
    
        listAmis=[]
        listUsers.forEach(child=>{
            let index = listAmisUUID.indexOf(child.uuid)
            if(index != -1){
                child.IgiveProc=listAmisBrut[index].IgiveProc
                child.HeGiveMeProc=listAmisBrut[index].HeGiveMeProc
                listAmis.push(child)
            }
        })
        console.log(listAmisBrut,listAmisUUID,listAmis)



        divAmis.innerHTML = ""
        listAmis.forEach(child=>{
            let ami = document.createElement("button")
            ami.classList.add("ami")
            ami.classList.add("small")

            ami.innerHTML = child.first_name + " " + child.last_name
            ami.addEventListener("click", async function() {
                listAmisUUID.splice(listAmisUUID.indexOf(child.uuid),1)
                listAmis.splice(listAmis.indexOf(child),1)
                listAmisBrut=[]
                for(let i=0;i<listAmisUUID.length;i++){
                    listAmisBrut[i]={uuid:listAmisUUID[i],IgiveProc:1}
                }
                await common.socketAsync('setAmis',listAmisBrut)
                reload()
            })
            if(child.HeGiveMeProc == 1){
                ami.classList.add('procuration')
            }else if(child.HeGiveMeProc == null){
                ami.classList.add('partiel')
            }

            let amiProc = document.createElement("button")
            amiProc.classList.add("ami")
            amiProc.classList.add("amiProc")
            amiProc.innerHTML="<img src='/Images/document.png'></img>"

            amiProc.addEventListener("click", async function() {
                listAmis[listAmis.indexOf(child)].IgiveProc=!listAmis[listAmis.indexOf(child)].IgiveProc
                listAmisBrut=[]
                for(let i=0;i<listAmisUUID.length;i++){
                    listAmisBrut[i]={uuid:listAmisUUID[i],IgiveProc:listAmis[i].IgiveProc}
                }
                await common.socketAsync('setAmis',listAmisBrut)
                reload()
            })
            if(child.IgiveProc == 1){
                amiProc.classList.add('procuration')
            }
            let div = document.createElement("div")
            div.classList.add("amiDiv")
            div.appendChild(ami);
            div.appendChild(amiProc);


            divAmis.appendChild(div);
        })


        users=[]
        usersNames=[]

        listUsers.forEach(function(child) {
            if(child.uuid != common.uuid && listAmisUUID.indexOf(child.uuid) == -1){
                users.push(child)
                usersNames.push(child.first_name + " " + child.last_name)
            }
        })
        common.autocomplete(document.getElementById("addAmi"), usersNames,()=>{});

        document.getElementById("ajout").addEventListener("click", async function() {
            let ami = document.getElementById("addAmi").value
            document.getElementById("addAmi").value=''
            if(usersNames.indexOf(ami) != -1){
                console.log(users[usersNames.indexOf(ami)].uuid)
                if(listAmisUUID.indexOf(users[usersNames.indexOf(ami)].uuid) == -1){
                    listAmisUUID.push(users[usersNames.indexOf(ami)].uuid)
                    listAmis.push(users[usersNames.indexOf(ami)])
                    listAmisBrut=[]
                    for(let i=0;i<listAmisUUID.length;i++){
                        listAmisBrut[i]={uuid:listAmisUUID[i],IgiveProc:listAmis[i].IgiveProc}
                    }
                    await common.socketAsync('setAmis',listAmisBrut)
                    reload()
                }
            }
        })
    }

    reload()
}