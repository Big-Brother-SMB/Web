const audio = new Audio("/bip.mp3");

export async function init(common){


    var interval;
    let barcodeLaser = '';
    const keydown = function(evt) {
        if(window.location.pathname=="/admin/localisation"){
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
            interval = setInterval(() => barcodeLaser = '', 20);
        }else{
            document.removeEventListener('keydown', keydown)
        }
    }
    document.addEventListener('keydown', keydown)


    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Code scanned = ${decodedText}`, decodedResult);
        search(decodedText,true)
    }
    let html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader", { 
            fps: 20,
            qrbox: { width: 400, height: 400 },
            rememberLastUsedCamera: true,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        });
    html5QrcodeScanner.render(onScanSuccess);

    
    let inputCodeBar = document.getElementById("code_bar")
    inputCodeBar.addEventListener("input",function(){
        let val = inputCodeBar.value
        if(String(val).length  == 5){
            search(val,false)
        }
    })


    function search(c,scan){
        code = c
        inputCodeBar.value = code
        
        let name = users_code.get(code)
        inputName.value = utilisateursNames[utilisateurs.indexOf(name)]
        inputNameId = name
        
        if(name!=null){
            searchName(name,scan)
            return;
        }else{
            document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"/Images/innexistant.jpg\" />"  
        }
    }


    let inputName = document.getElementById("name")
    let inputNameId = null

    let utilisateurs = []
    let utilisateursNames = []

    let code = 0
    let users_code = new Map();

    let listUsers = common.nameOrder(await common.socketAdminAsync('getListPass',null))

    listUsers.forEach(function(child) {
        utilisateurs.push(child.uuid)
        users_code.set(child.code_barre,child.uuid)
        utilisateursNames.push(common.name(child.first_name,child.last_name))
    })
    common.autocomplete(inputName, utilisateursNames,function(val){
        val = utilisateurs[utilisateursNames.indexOf(val)]
        inputNameId=val
        searchName(val,false)
        listUsers.forEach(function(child) {
            if(child.uuid==val){
                inputCodeBar.value = child.code_barre
            }
        })
    },true); 



    async function searchName(uuid,scan){
        try{
            if(true && lieu!=null){//scan
                let test = true
                for(let i=0;i<listScan.length;i++){
                    if(listScan[i].uuid==uuid){
                        test=false
                        if(listScan[i].lieu!=lieu && h!=-1){
                            await common.socketAdminAsync('setLocalisation',{w:common.actualWeek,j:j,h:h,lieu:lieu,uuid:uuid});
                            listScan[i].lieu=lieu
                            audio.play();
                            actualisationList()
                        }
                    }
                }
                if(test && h!=-1){
                    await common.socketAdminAsync('setLocalisation',{w:common.actualWeek,j:j,h:h,lieu:lieu,uuid:uuid});
                    listScan.push({semaine:common.actualWeek,jour:j,creneau:h,uuid:uuid,lieu:lieu})
                    audio.play();
                    actualisationList()
                }
            }
        }catch(e){console.error(e)}
    }



    let d = new Date();
    let h;
    let j = d.getDay();
    if(j==6 || j==0){
        j=5
    }
    j = j-1
    function getHour(){
        let d = new Date();
        const horaires = [[7,50],[8,44],[9,43],[10,55],[11,54],[13,9],[14,8],[15,7],[16,19],[17,18]]
        let i = 0
        h = -1
        while(i<horaires.length-1 && h==-1){
            if((d.getHours() == horaires[i][0] && d.getMinutes() >= horaires[i][1])
            || (d.getHours() == horaires[i+1][0] && d.getMinutes() < horaires[i+1][1])){
                h = i;
            }else if(d.getHours() == 12){
                h = 4
            }
            i++
        }
        if(h!=-1){
            document.getElementById("heure").innerHTML = (String(horaires[h][0]).length == 1?"0":"") + horaires[h][0] + ":" + 
            (String(horaires[h][1]).length == 1?"0":"") + horaires[h][1] + " à " + 
            (String(horaires[h+1][0]).length == 1?"0":"") + horaires[h+1][0] + ":" + 
            (String(horaires[h+1][1]).length == 1?"0":"") + horaires[h+1][1]
        }
    }

    let listScan=[];

    const table = document.getElementById("tbody")

    function actualisationList(){
        table.innerHTML=''
        let NBinscrits = 0
        listUsers.forEach(user=>{
            for(let i=0;i<listScan.length;i++){
                const scan=listScan[i]
                if(user.uuid==scan.uuid && scan.lieu==lieu && scan.semaine==common.actualWeek && scan.jour==j && scan.creneau==h){
                    NBinscrits++
                    let ligne = document.createElement("tr")
                    
                    let nom = document.createElement("td")
                    nom.innerHTML = common.name(user.first_name,user.last_name)
                    ligne.appendChild(nom)
                    
                    let classe = document.createElement("td")
                    classe.innerHTML = user.classe
                    ligne.appendChild(classe)

                    let supp = document.createElement("td")
                    supp.innerHTML = "supp"
                    supp.addEventListener("click",async ()=>{
                        await common.socketAdminAsync('delLocalisation',{w:common.actualWeek,j:j,h:h,uuid:scan.uuid});
                        listScan.splice(i,1)
                        actualisationList()
                    })
                    ligne.appendChild(supp)

                    table.appendChild(ligne)
                }
            }
        })

        let NBplaces = 0
        if(lieu=="DOC"){
            NBplaces=10
        }else if(lieu=="Tutorat"){
            NBplaces=15
        }else if(lieu=="Aumônerie"){
            NBplaces=15
        }
        if(NBplaces == 0) NBplaces="?" 
        document.getElementById("lieu").innerHTML = "Lieu: " + lieu + "(" + NBinscrits + "/" + NBplaces + ")"
    }
    


    let lieu = null;
    let listLieu = []
    for(const elem of document.getElementById("activity").children){
        if(elem.getAttribute('id')!=null){
            listLieu.push(elem.getAttribute('id'))
        }
    }
    for (const elem of listLieu){
        document.getElementById(elem).addEventListener("click",async function(){
            if (lieu == null || lieu != elem){
                for (const elem of listLieu){
                    document.getElementById(elem).classList.add("grayscale");
                }
                document.getElementById(elem).classList.remove("grayscale");
                lieu = elem;
            }else{
                for (const elem of listLieu){
                    document.getElementById(elem).classList.remove("grayscale");
                }
                lieu = null;
            }
            actualisationList()
        })
    }



    async function loop(){
        if(window.location.pathname=="/admin/localisation"){
            getHour()
            if(h!=-1) {
                listScan = await common.socketAdminAsync('getLocalisation',{w:common.actualWeek,j:j,h:h});
            }else{
                listScan = [];
            }
            actualisationList()
            setTimeout(loop,15000);
        }
    }
    loop();

    function loop2(){
        if(window.location.pathname=="/admin/localisation"){
            setTimeout(loop2,500);
        }else{
            html5QrcodeScanner.clear();
        }
    }
    loop2();

    document.getElementById("historique").addEventListener("click",()=>{
        common.loadpage("/admin/localisation/historique")
    })
}