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
let j = dayWithMer[d.getDay() - 1];
let actualisation = true
if(d.getHours() < 11 || ((d.getHours() == 11 && d.getMinutes() < 54))){
    h = "/11h";
    dayP.innerHTML = allDay[d.getDay()]+" 11h"
}else{
    h = "/12h";
    dayP.innerHTML = allDay[d.getDay()]+" 12h"
}

dayP.addEventListener("click",function(){
    actualisation = false
    if("/11h"===h){
        h = "/12h";
        dayP.innerHTML = allDay[d.getDay()]+" 12h"
    }else{
        h = "/11h";
        dayP.innerHTML = allDay[d.getDay()]+" 11h"
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
users_code= new Map();
database.ref("users").once("value", function(snapshot){
    database.ref("names").once("value", function(snapshotNames){
        snapshot.forEach(function(child) {
            utilisateurs.push(child.key)
            users_code.set(snapshot.child(child.key+"/code barre").val(),child.key)
            if(typeof snapshotNames.child(child.key).val() === "string"){
                utilisateursNames.push(snapshotNames.child(child.key).val())
            } else {
                database.ref("names/"+child.key).set(child.key)
                utilisateursNames.push(child.key)
            }
        })
        autocomplete(inputName, utilisateursNames,function(val){
            val = utilisateurs[utilisateursNames.indexOf(val)]
            inputNameId=val
            searchName(val,false)
            inputCodeBar.value = snapshot.child(val+"/code barre/").val()
        });  
    })
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
        document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../../Images/innexistant.jpg\" />"  
    }
}



let h2=h
function searchName(name,scan){
    h2=h

    database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/inscrits/" + name).once("value", function(snapshot) {
        database.ref("users/" + user + "/priorites").once("value", function(snapshot1) {
            database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/prioritaires/").once("value", function(snapshot2) {
                database.ref("users/" + user + "/classe").once("value", function(snapshotC) {
                    let classe = snapshotC.val()
                    if(classe==null){
                        classe="XXX"
                    }
                    if(snapshot.val() != null){
                        if(scan==true){
                            scanB.style.visibility="hidden";
                            inscB.style.visibility="hidden";
                            if(snapshot.child('scan').val()==null){
                                NBscan++
                            }
                            database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/inscrits/" + name+"/scan").set(hash())
                            affichagePassages()
                        }else{
                            scanB.style.visibility="visible";
                            inscB.style.visibility="hidden";
                        }
                        document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../../Images/ok.png\" />"
                        if(snapshot2.child(classe).val() != null){
                            document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../../Images/prio.png\" />"
                        }
                        snapshot1.forEach(function(child) {
                            if(snapshot2.child(child.key).val() != null){
                                document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../../Images/prio.png\" />"
                            }
                        })
                    }else{
                        let test=true
                        if(snapshot2.child(classe).val() != null){
                            document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../../Images/prioSelf.png\" />"
                            test=false
                        }
                        snapshot1.forEach(function(child) {
                            if(snapshot2.child(child.key).val() != null){
                                document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../../Images/prioSelf.png\" />"
                                test=false
                            }
                        })
                        if(h=="/11h"){
                            h2= "/12h"
                        }else{
                            h2= "/11h"
                        }
                        database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h2 + "/inscrits/" + name).once("value", function(snapshot) {
                            if(snapshot.val() != null){
                                scanB.style.visibility="visible";
                                inscB.style.visibility="hidden";
                                if(h2=="/11h"){
                                    document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../../Images/ok11.png\" />"
                                }else{
                                    document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../../Images/ok12.png\" />"
                                }
                            }else{
                                scanB.style.visibility="hidden";
                                inscB.style.visibility="visible";
                                if(test){
                                    document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../../Images/croix.png\" />"
                                }
                            }
                        })
                    }
                })
            })
        })
    })
}

scanB.addEventListener("click",function(){
    scanB.style.visibility="hidden";
    inscB.style.visibility="hidden";
    database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h2 + "/inscrits/" + inputNameId).once("value", function(snapshot) {
        if(snapshot.val() != null){
            if(snapshot.child('scan').val()==null && h2==h){
                NBscan++
            }
            database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h2 + "/inscrits/" + inputNameId + "/scan").set(hash())
            affichagePassages()
        }
        h2=h
    })
})

inscB.addEventListener("click",function(){
    scanB.style.visibility="hidden";
    inscB.style.visibility="hidden";
    database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/inscrits/" + inputNameId).once("value", function(snapshot) {
        if(snapshot.val()==null){
            NBinscrit++
        }
        if(snapshot.child('scan').val()==null){
            NBscan++
        }
        database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/inscrits/" + inputNameId + "/user").set(0)
        database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/inscrits/" + inputNameId + "/scan").set(hash())
        document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../../Images/ok.png\" />"
        affichagePassages()
        h2=h
    })
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

    document.getElementById("heure").innerHTML = getHour()
    document.getElementById("code").innerHTML = hashDate()
    setTimeout(loop,500);
}
loop();


let NBinscrit=0;
let NBscan=0;
function affichagePassages(){
    document.getElementById("NBpassage").innerHTML= NBscan+"/"+NBinscrit +" (" + (Math.floor(NBscan/NBinscrit*100)) +"%)"
}

function actualiserPassages(){
    NBinscrit=0;
    NBscan=0;
    database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/inscrits/").once("value", function(snapshot) {
        snapshot.forEach(function(child){
            NBinscrit++;
            if(snapshot.child(child.key+"/scan").val()!=null){
                NBscan++
            }
        })
        affichagePassages()
    })
}



function loop2(){
    actualiserPassages()
    setTimeout(loop2,30000);
}
loop2();