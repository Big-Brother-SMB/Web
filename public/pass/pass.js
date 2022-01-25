
let d = new Date();

let j = dayWithMer[d.getDay() - 1];
let h;
console.log("heure : " + d.getHours())
console.log("min : " + d.getMinutes())
if(d.getHours() < 11 || (d.getHours() == 11 && d.getMinutes() <=55)){
    h = "/11h";
}else{
    h = "/12h";
}
console.log(j);
console.log(h);
document.getElementById("pass").innerHTML = "<img class=\"pass\" src=\"croix.png\" />"
database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/demandes").once("value", function(snapshot) {
    snapshot.forEach(function(child) {
        if(child.key == user){
            console.log("inscrit");
            document.getElementById("pass").innerHTML = "<img width=\"1000\" height=\"1000\" alt=\"\" src=\"pass.gif\" />"
        }else{
            console.log("pas inscrit");    
        }
      
    });
}); 



document.getElementById("retour").addEventListener("click", function() {
    window.location.href = "../menu/menu.html";
});


function loop(){
    d = new Date();

    document.getElementById("heure").innerHTML = d.getHours() + ":" + (String(d.getMinutes()).length == 1?"0":"") + d.getMinutes() + ":" + (String(d.getSeconds()).length == 1?"0":"") + d.getSeconds()

    setTimeout(loop,1000);
}
loop();