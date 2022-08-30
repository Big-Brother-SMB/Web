let scanB = document.getElementById("scanB")
let dayP = document.getElementById("day")

function onScanSuccess(decodedText, decodedResult) {
    console.log(`Code scanned = ${decodedText}`, decodedResult);
    search(decodedText,true)
}
var html5QrcodeScanner = new Html5QrcodeScanner(
	"qr-reader", { fps: 30, qrbox: 250 });
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

let utilisateurs = []

let code = 0
users_code= new Map();
database.ref("users").once("value", function(snapshot){
    snapshot.forEach(function(child) {
        utilisateurs.push(child.key)
        users_code.set(snapshot.child(child.key+"/code barre").val(),child.key)
    })
    autocomplete(inputName, utilisateurs,function(val){
        searchName(val,false)
        inputCodeBar.value = snapshot.child(val+"/code barre/").val()
    });
})
function search(c,scan){
    scanB.style.visibility="hidden";

    if(code == c){
        return;
    }
    code = c
    inputCodeBar.value = code
    
    let name = users_code.get(code)
    document.getElementById("name").value = name
    if(name!=null){
        searchName(name,scan)
        return;
    }else{
        document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../../Images/innexistant.jpg\" />"  
    }
}



function searchName(name,scan){
    scanB.style.visibility="hidden";

    database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/inscrits/" + name).once("value", function(snapshot) {
        if(snapshot.val() != null){
            if(scan==true){
                database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/inscrits/" + name+"/scan").set(hash())
                NBscan++
                affichagePassages()
            }else{
                scanB.style.visibility="visible";
            }
            document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../../Images/ok.png\" />"
        }else{
            document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../../Images/croix.png\" />"   
        }
    })
}

scanB.addEventListener("click",function(){
    scanB.style.visibility="hidden";
    database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/inscrits/" + document.getElementById("name").value).once("value", function(snapshot) {
        if(snapshot.val() != null){
            database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/inscrits/" + document.getElementById("name").value + "/scan").set(hash())
            NBscan++
            affichagePassages()
        }
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