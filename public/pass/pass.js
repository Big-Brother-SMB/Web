import * as common from "../common.js";

let d = new Date();

let j = common.dayWithMer[d.getDay() - 1];
document.getElementById("day").innerHTML = common.allDay[d.getDay()]
let h;
if(d.getHours() < 11 || ((d.getHours() == 11 && d.getMinutes() < 54))){
    h = 0;
}else{
    h = 1;
}


let info_horaire = await common.socketAsync("info_horaire",[common.actualWeek,j,h])
let my_demande = await common.socketAsync("my_demande",[common.actualWeek,j,h])

try{
    if(info_horaire.ouvert!=5){
        if(my_demande.DorI==true){
            document.getElementById("pass").innerHTML = '<img class="pass" src="../../Images/ok.gif" />'
            if(info_horaire.prio.indexOf(common.classe)!=-1){
                document.getElementById("pass").innerHTML = '<img class="pass" src="../../Images/prio.gif" />'
            }
            common.groups.forEach(e=>{
                if(info_horaire.prio.indexOf(e)!=-1){
                    document.getElementById("pass").innerHTML = '<img class="pass" src="../../Images/prio.gif" />'
                }
            })
        }else{
            document.getElementById("pass").innerHTML = '<img class="pass" src="../../Images/croix.gif" />'
            if(info_horaire.prio.indexOf(common.classe)!=-1){
                document.getElementById("pass").innerHTML = '<img class="pass" src="../../Images/prioSelf.png" />'
            }
            common.groups.forEach(e=>{
                if(info_horaire.prio.indexOf(e)!=-1){
                    document.getElementById("pass").innerHTML = '<img class="pass" src="../../Images/prioSelf.png" />'
                }
            })
        }
    }else{
        document.getElementById("pass").innerHTML = '<img class="pass" src="../../Images/croix.gif" />'
    }
}catch(e){console.error(e)}


document.getElementById("user").innerHTML = common.first_name + " " + common.last_name + " " + common.classe

function loop(){
    let d2 = new Date();
    if((((d2.getMinutes() >= 54 && d2.getHours() == 11) ||
    (d2.getHours() >= 12)) 
    && h == "/11h") ||
    (((d2.getMinutes() < 54 && d2.getHours() == 11) ||
    (d2.getHours() < 11)) 
    && h == "/12h") ||
    d2.getWeek() != d.getWeek() ||
    d2.getDay() != d.getDay()){
        window.location.href = window.location.href;
    }

    document.getElementById("heure").innerHTML = common.getHour()
    document.getElementById("code").innerHTML = common.hashControl()
    setTimeout(loop,500);
}
loop();


const containerElement = document.getElementById('single');


const bcid = 'bc'+common.codeBar;
// create the image element
const bcimg = document.createElement('img');
bcimg.className = "barcode";
bcimg.setAttribute('id', bcid);
containerElement.appendChild(bcimg);
JsBarcode('#'+bcid, common.codeBar, {format: 'code39'});

