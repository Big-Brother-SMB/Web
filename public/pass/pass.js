//setColorMode("..")

let d = new Date();

let j = dayWithMer[d.getDay() - 1];
document.getElementById("day").innerHTML = allDay[d.getDay()]
let h;
if(d.getHours() < 11 || ((d.getHours() == 11 && d.getMinutes() < 54))){
    h = "/11h";
}else{
    h = "/12h";
}



database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/inscrits/" + user).once("value", function(snapshot) {
    document.getElementById("pass").innerHTML = "<img class=\"pass\" src=\"../../Images/croix.gif\" />"
    if(snapshot.val()!=null){
        document.getElementById("pass").innerHTML = "<img class=\"pass\" src=\"../../Images/ok.gif\" />"
        database.ref("users/" + user + "/priorites").once("value", function(snapshot) {
            snapshot.forEach(function(child) {
                database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/prioritaires/" + child.key).once("value", function(snapshot) {
                    if(snapshot.val() != null){
                        document.getElementById("pass").innerHTML = "<img class=\"pass\" src=\"../../Images/prio.gif\" />"
                    }
                })
            })
        })
        database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/prioritaires/" + classe).once("value", function(snapshot) {
            if(snapshot.val() != null){
                document.getElementById("pass").innerHTML = "<img class=\"pass\" src=\"../../Images/prio.gif\" />"
            }
        })
    }
});



document.getElementById("user").innerHTML = userName + " " + classe

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

    document.getElementById("heure").innerHTML = getHour()
    document.getElementById("code").innerHTML = hashDate()
    setTimeout(loop,500);
}
loop();





const containerElement = document.getElementById('single');

console.log(codeBar)
const bcid = 'bc'+codeBar;
// create the image element
const bcimg = document.createElement('img');
bcimg.className = "barcode";
bcimg.setAttribute('id', bcid);
containerElement.appendChild(bcimg);
JsBarcode('#'+bcid, codeBar, {format: 'code39'});

