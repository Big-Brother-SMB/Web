const allDay = ["Dimanche","Lundi", "Mardi","Mercredi","Jeudi","Vendredi","Samedi"]

export async function init(common){
    let scanB = document.getElementById("scanB")
    let inscB = document.getElementById("inscB")
    let dayP = document.getElementById("day")


    var interval;
    let barcodeLaser = '';
    document.addEventListener('keydown', function(evt) {
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
    })



    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Code scanned = ${decodedText}`, decodedResult);
        search(decodedText,true)
    }
    var html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader", { fps: 30, qrbox: 400 });
    html5QrcodeScanner.render(onScanSuccess);

    let d = new Date();
    let h;
    let jBrut = d.getDay();
    if(jBrut==3){
        jBrut=2
    }else if(jBrut==6 || jBrut==0){
        jBrut=5
    }
    let j = jBrut-1
    if(j>1){
        j--
    }
    let actualisation = true
    if(d.getHours() < 11 || ((d.getHours() == 11 && d.getMinutes() < 54))){
        h = 0;
        dayP.innerHTML = allDay[jBrut]+" 11h"
    }else{
        h = 1;
        dayP.innerHTML = allDay[jBrut]+" 12h"
    }

    dayP.addEventListener("click",async function(){
        scanB.classList.add("cache");
        inscB.classList.add("cache");

        actualisation = false
        if(0===h){
            h = 1;
            dayP.innerHTML = allDay[jBrut]+" 12h"
        }else{
            h = 0;
            dayP.innerHTML = allDay[jBrut]+" 11h"
        }
        actualiserPassages()
    })

    let inputCodeBar = document.getElementById("code bar")
    inputCodeBar.addEventListener("input",function(){
        let val = inputCodeBar.value
        if(String(val).length  == 5){
            search(val,false)
        }
    })



    let inputName = document.getElementById("name")
    let inputNameId = null

    let utilisateurs = []
    let utilisateursNames = []

    let code = 0
    let users_code= new Map();

    let listUsers=await common.socketAdminAsync('list pass',null)
    let listCreneau=await common.socketAsync('listDemandes',{w:common.actualWeek,j:j,h:h})

    listUsers.forEach(function(child) {
        utilisateurs.push(child.uuid)
        users_code.set(child.code_barre,child.uuid)
        utilisateursNames.push(child.first_name+" "+child.last_name)
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
            document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../../Images/innexistant.jpg\" />"  
        }
    }


    let h2=h
    async function searchName(name,scan){
        h2=h

        try{
            let user = {}
            listUsers.forEach(e=>{
                if(e.uuid==name){
                    user = e
                }
            })
            let userDemande = null
            listCreneau.forEach(e=>{
                if(e.uuid==name && e.DorI==1){
                    userDemande = e
                }
            })
        
            let classe = user.classe
            if(classe==null){
                classe="XXX"
            }
        
            let info_horaire = await common.socketAsync("getDataThisCreneau",{w:common.actualWeek,j:j,h:h})

            console.log(info_horaire,j,h)
        
            if(userDemande != null){
                if(scan==true){
                    scanB.classList.add("cache");
                    inscB.classList.add("cache");
                    if(userDemande.scan!=true){
                        NBscan++
                    }
                    await common.socketAdminAsync('scan',[common.actualWeek,j,h,name,true])
                    affichagePassages()
                }else{
                    scanB.classList.remove("cache");
                    inscB.classList.add("cache");
                }
                document.getElementById("pass").innerHTML = '<img width="200" height="200" alt="" src="../../Images/ok.png" />'
                if(info_horaire.prio.indexOf(classe)!=-1){
                    document.getElementById("pass").innerHTML = '<img width="200" height="200" alt="" src="../../Images/prio.png" />'
                }
                user.groups.forEach(function(child) {
                    if(info_horaire.prio.indexOf(child)!=-1){
                        document.getElementById("pass").innerHTML = '<img width="200" height="200" alt="" src="../../Images/prio.png" />'
                    }
                })
            }else{
                let test=true
                if(info_horaire.prio.indexOf(classe)!=-1){
                    document.getElementById("pass").innerHTML = '<img width="200" height="200" alt="" src="../../Images/prioSelf.png" />'
                    test=false
                }
                user.groups.forEach(function(child) {
                    if(info_horaire.prio.indexOf(child)!=-1){
                        document.getElementById("pass").innerHTML = '<img width="200" height="200" alt="" src="../../Images/prioSelf.png" />'
                        test=false
                    }
                })
                if(h==0){
                    h2= 1
                }else{
                    h2= 0
                }
                let listCreneau=await common.socketAsync('listDemandes',{w:common.actualWeek,j:j,h:h2})
                let userDemande = null
                listCreneau.forEach(e=>{
                    if(e.uuid==name && e.DorI==1){
                        userDemande = e
                    }
                })

                if(userDemande != null){
                    scanB.classList.remove("cache")
                    inscB.classList.add("cache")
                    if(h2==0){
                        document.getElementById("pass").innerHTML = '<img width="200" height="200" alt="" src="../../Images/ok11.png" />'
                    }else{
                        document.getElementById("pass").innerHTML = '<img width="200" height="200" alt="" src="../../Images/ok12.png" />'
                    }
                }else{
                    scanB.classList.add("cache")
                    inscB.classList.remove("cache")
                    if(test){
                        document.getElementById("pass").innerHTML = '<img width="200" height="200" alt="" src="../../Images/croix.png" />'
                    }
                }
            }
        }catch(e){console.error(e)}
    }

    scanB.addEventListener("click",async function(){
        scanB.classList.add("cache");
        inscB.classList.add("cache");

        listCreneau.forEach(e=>{
            if(e.uuid == inputNameId && e.scan!=1){
                NBscan++
                affichagePassages()
            }
        })
        if(h2==h){
            await common.socketAdminAsync('scan',[common.actualWeek,j,h,inputNameId,true])
        }else{
            await common.socketAdminAsync('scan',[common.actualWeek,j,h2,inputNameId,true])
        }
    })

    inscB.addEventListener("click",async function(){
        scanB.classList.add("cache");
        inscB.classList.add("cache");

        let user = {}
        listCreneau.forEach(e=>{
            if(e.uuid == inputNameId){
                user = e
            }
        })
        if(user.DorI!=1){
            NBinscrit++
        }
        if(user.scan!=1){
            NBscan++
        }
        await common.socketAdminAsync('set DorI',[common.actualWeek,j,h,inputNameId,true])
        await common.socketAdminAsync('scan',[common.actualWeek,j,h,inputNameId,true])
        document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../../Images/ok.png\" />"
        affichagePassages()
        console.log('pass test')
    })


    function loop(){
        try{
            let d2 = new Date();
            if(((((d2.getMinutes() >= 54 && d2.getHours() == 11) ||
            (d2.getHours() >= 12)) 
            && h == "/11h") ||
            (((d2.getMinutes() < 54 && d2.getHours() == 11) ||
            (d2.getHours() < 11)) 
            && h == "/12h") ||
            d2.getWeek() != d.getWeek() ||
            d2.getDay() != d.getDay()) && actualisation){
                window.location.href = window.location.href;
            }

            document.getElementById("heure").innerHTML = common.getHour()
            setTimeout(loop,500);
        } catch (Exception) {console.log('exit1')}
    }
    loop();


    let NBinscrit=0;
    let NBscan=0;
    function affichagePassages(){
        document.getElementById("NBpassage").innerHTML= NBscan+"/"+NBinscrit +" (" + (Math.floor(NBscan/NBinscrit*100)) +"%)"
    }

    async function actualiserPassages(){
        NBinscrit=0;
        NBscan=0;
        listCreneau=await common.socketAsync('listDemandes',{w:common.actualWeek,j:j,h:h})

        listCreneau.forEach(function(child){
            if(child.DorI==1){
                NBinscrit++;
                if(child.scan==1){
                    NBscan++
                }
            }
        })
        affichagePassages()
    }



    function loop2(){
        if(window.location.pathname=="/admin/pass"){
            actualiserPassages()
            setTimeout(loop2,3000);
        }
    }
    loop2();
}