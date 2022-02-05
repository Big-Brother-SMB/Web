
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

database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/inscrits").once("value", function(snapshot) {
    document.getElementById("pass").innerHTML = "<img class=\"pass\" src=\"croix.png\" />"
    snapshot.forEach(function(child) {
        if(child.key == user){
            console.log("inscrit");
            document.getElementById("pass").innerHTML = "<img width=\"1000\" height=\"1000\" alt=\"\" src=\"pass.gif\" />"
        }else{
            console.log("pas inscrit");    
        }
      
    });
}); 

document.getElementById("user").innerHTML = user

function loop(){
    d = new Date();

    document.getElementById("heure").innerHTML = getHour()
    if(d.getMinutes() == 56 && d.getHours() == 11 && h == "/11h"){
        window.location.href = "../menu/menu.html";
    }


    setTimeout(loop,1000);
    
}
loop();