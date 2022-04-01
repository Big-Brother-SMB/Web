setColorMode("..")

let d = new Date();

let j = dayWithMer[d.getDay() - 1];
let h;
console.log("heure : " + d.getHours())
console.log("min : " + d.getMinutes())
if(d.getHours() < 11 || (d.getHours() == 11 && d.getMinutes() <=49)){
    h = "/11h";
}else{
    h = "/12h";
}
console.log(j);
console.log(h);

function loop2(){

    database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/inscrits").once("value", function(snapshot) {
        document.getElementById("pass").innerHTML = "<img width=\"1000\" height=\"1000\ class=\"pass\" src=\"croix.gif\" />"
        snapshot.forEach(function(child) {
            if(child.key == user){
                console.log("inscrit");
                document.getElementById("pass").innerHTML = "<img width=\"1000\" height=\"1000\" alt=\"\" src=\"pass.gif\" />"
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


    setTimeout(loop,1000);
    
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
