export async function init(common){
    if(common.admin_permission["foyer_perm"]!=2) common.loadpage("/options")
    
    var interval;
    let barcodeLaser = '';
    const keydown = function(evt) {
        if(window.location.pathname=="/admin/pret"){
            console.log(evt.key)
            if (interval){
                clearInterval(interval);
            }
            if (evt.code == 'Enter') {
                if (barcodeLaser){
                    search(barcodeLaser,true)
                    inputCodeBar.value = barcodeLaser;
                }
                barcodeLaser = '';
                return;
            }
            if (evt.key != 'Shift'){
                barcodeLaser += evt.key;
            }
            interval = setInterval(() => barcodeLaser = '', 200);
        }else{
            document.removeEventListener('keydown', keydown)
        }
    }
    document.addEventListener('keydown', keydown)

    let inputCodeBar = document.getElementById("code_bar")
    setTimeout(() => {inputCodeBar.focus()}, 1000);
    inputCodeBar.addEventListener("input",function(){
        let val = inputCodeBar.value
        if(String(val).length  == 5){
            search(val)
        }
    })



    let inputName = document.getElementById("name")
    let inputNameId = null

    let utilisateurs = []
    let utilisateursNames = []

    let code = 0
    let users_code= new Map();

    let listUsers=common.nameOrder(await common.socketAdminAsync('getListUser',null))



    listUsers.forEach(function(child) {
        utilisateurs.push(child.uuid)
        users_code.set(child.code_barre,child.uuid)
        utilisateursNames.push(common.name(child.first_name,child.last_name))
    })
    common.autocomplete(inputName, utilisateursNames,function(val){
        val = utilisateurs[utilisateursNames.indexOf(val)]
        inputNameId=val
        listUsers.forEach(function(child) {
            if(child.uuid==val){
                inputCodeBar.value = child.code_barre
            }
        })
    },true); 


    function search(c){
        code = c
        inputCodeBar.value = code
        
        let name = users_code.get(code)
        inputName.value = utilisateursNames[utilisateurs.indexOf(name)]
        inputNameId = name
    }


    inputCodeBar.addEventListener("input",function(){
        if (String(inputCodeBar.value).length==5){
            search(inputCodeBar.value)
        }
    })


    var listAct=["Arcade","Baby Foot 1","Baby Foot 2","Billard","Piano","Guitare","Batterie","Jeu de cartes","Poker","Jeu d'échecs","Jungle Speed","Focus"]

    function debutPret(elem){
        if (inputNameId!=null){
            common.socketAdminAsync("addPret",{obj:elem,debut:new Date(),uuid:inputNameId})
            document.getElementById(elem+"-Name").innerHTML=inputName.value
            document.getElementById(elem).classList.add("grayscale")
        }
        inputName.value=""
        inputCodeBar.value=""
        inputNameId=null
    }

    async function finPret(elem){
        listPret.forEach((child)=>{
            if(child.objet==elem){
                common.socketAdminAsync("finPret",{obj:elem,debut:child.debut,uuid:child.uuid,fin:new Date()})
                document.getElementById(elem).classList.remove("grayscale")
                document.getElementById(elem+"-Name").innerHTML="Libre"
            }
        })
    }


    let listPret;
    async function actualiserPret(){
        listPret = await common.socketAdminAsync("getPretsActuel",null)
        for (const elem of listAct){
            document.getElementById(elem).classList.remove("grayscale");
        }
        listPret.forEach((e)=>{
            let element = document.getElementById(e.objet)
            if(element!=null){
                document.getElementById(e.objet+"-Name").innerHTML= utilisateursNames[utilisateurs.indexOf(e.uuid)]
                element.classList.add("grayscale");
            }
        })
    }
    actualiserPret()
    for (const elem of listAct){
        document.getElementById(elem).addEventListener("click",async function(){
            await actualiserPret()
            if (document.getElementById(elem).classList.contains("grayscale")){
                finPret(elem)
            }else{
                debutPret(elem)
            }
        })
    }

    document.getElementById("historique").addEventListener("click",()=>{
        common.loadpage("/admin/pret/historique")
    })
}