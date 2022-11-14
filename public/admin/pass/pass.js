import * as common from "../../common.js";

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
let j = common.dayNum[d.getDay() - 1];
let actualisation = true
if(d.getHours() < 11 || ((d.getHours() == 11 && d.getMinutes() < 54))){
    h = 0;
    dayP.innerHTML = common.allDay[d.getDay()]+" 11h"
}else{
    h = 1;
    dayP.innerHTML = common.allDay[d.getDay()]+" 12h"
}

dayP.addEventListener("click",async function(){
    actualisation = false
    if(0===h){
        h = 1;
        dayP.innerHTML = common.allDay[d.getDay()]+" 12h"
    }else{
        h = 0;
        dayP.innerHTML = common.allDay[d.getDay()]+" 11h"
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
let listCreneau=await common.socketAsync('list_demandes',[common.actualWeek,j,h])

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
}); 


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
    
        let info_horaire = await common.socketAsync("info_horaire",[common.actualWeek,j,h])

        console.log(info_horaire)
    
        if(userDemande != null){
            if(scan==true){
                scanB.style.visibility="hidden";
                inscB.style.visibility="hidden";
                if(userDemande.scan!=true){
                    NBscan++
                }
                await common.socketAdminAsync('scan',[common.actualWeek,j,h,name,true])
                affichagePassages()
            }else{
                scanB.style.visibility="visible";
                inscB.style.visibility="hidden";
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
            let listCreneau=await common.socketAsync('list_demandes',[common.actualWeek,j,h2])
            let userDemande = null
            listCreneau.forEach(e=>{
                if(e.uuid==name && e.DorI==1){
                    userDemande = e
                }
            })

            if(userDemande != null){
                scanB.style.visibility="visible";
                inscB.style.visibility="hidden";
                if(h2==0){
                    document.getElementById("pass").innerHTML = '<img width="200" height="200" alt="" src="../../Images/ok11.png" />'
                }else{
                    document.getElementById("pass").innerHTML = '<img width="200" height="200" alt="" src="../../Images/ok12.png" />'
                }
            }else{
                scanB.style.visibility="hidden";
                inscB.style.visibility="visible";
                if(test){
                    document.getElementById("pass").innerHTML = '<img width="200" height="200" alt="" src="../../Images/croix.png" />'
                }
            }
        }
    }catch(e){console.error(e)}
}

scanB.addEventListener("click",async function(){
    scanB.style.visibility="hidden";
    inscB.style.visibility="hidden";

    console.log('pass test',listCreneau)

    listCreneau.forEach(e=>{
        if(e.DorI==1 && e.uuid == inputNameId){
            if(e.scan!=1 && h2==h){
                NBscan++
            }
        }
    })
    await common.socketAdminAsync('scan',[common.actualWeek,j,h,inputNameId,true])
    affichagePassages()
})

inscB.addEventListener("click",async function(){
    scanB.style.visibility="hidden";
    inscB.style.visibility="hidden";

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
    document.getElementById("code").innerHTML = common.hashControl()
    setTimeout(loop,500);
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
    listCreneau=await common.socketAsync('list_demandes',[common.actualWeek,j,h])

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
    actualiserPassages()
    setTimeout(loop2,30000);
}
loop2();