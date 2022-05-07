//setColorMode("..")

let d = new Date();

let j = dayWithMer[d.getDay() - 1];
document.getElementById("day").innerHTML = allDay[d.getDay() - 1]
let h;
console.log("heure : " + d.getHours())
console.log("min : " + d.getMinutes())
if(d.getHours() < 11 || (d.getHours() == 11 && d.getMinutes() <=49)){
    h = "/11h";
}else{
    h = "/12h";
}

database.ref("version").once("value", function (snapshot) {
  let msg = snapshot.val()
  if (msg != null) {
    document.getElementById("version").innerHTML ="Version "+msg
    }


})

console.log(j);
console.log(h);

function loop2(){

    database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/inscrits").once("value", function(snapshot) {
        document.getElementById("pass").innerHTML = "<img width=\"300\" height=\"300\ class=\"pass\" src=\"https://drive.google.com/uc?export=view&id=1FHW_39sTlBoeor6f4kiVrCzYFfvvsXPT\" />"
        snapshot.forEach(function(child) {
            if(child.key == user){
                console.log("inscrit");
                document.getElementById("pass").innerHTML = "<img width=\"300\" height=\"300\" alt=\"\" src=\"https://drive.google.com/uc?export=view&id=1-VW-UPQH4jlp7kbkLmbcpRH4rW69mKPs\" />"
            }

        });
    });
    console.log("refresh")
    setTimeout(loop2,10000)

}
loop2()

document.getElementById("user").innerHTML = user

function loop(){
    d = new Date();

    document.getElementById("heure").innerHTML = getHour()
    if(d.getMinutes() == 50 && d.getHours() == 11 && h == "/11h"){
        window.location.href = "../menu/menu.html";
    }

    document.getElementById("code").innerHTML = hashDate()


    setTimeout(loop,100);

}
loop();





const containerElement = document.getElementById('single');
if(hasCodeBar){
    console.log(codeBar)
    const bcid = 'bc'+codeBar;
    // create the image element
    const bcimg = document.createElement('img');
    bcimg.className = "barcode";
    bcimg.setAttribute('id', bcid);
    containerElement.appendChild(bcimg);
    JsBarcode('#'+bcid, codeBar, {format: 'code39'});
}else{
    containerElement.innerHTML = "ajoutez votre code barre depuis <a href=\"../option/option.html\">les options</a>"
}
