function onScanSuccess(decodedText, decodedResult) {
    console.log(`Code scanned = ${decodedText}`, decodedResult);
    search(decodedText)
}
var html5QrcodeScanner = new Html5QrcodeScanner(
	"qr-reader", { fps: 30, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);

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

let inputCodeBar = document.getElementById("code bar")
inputCodeBar.addEventListener("input",function(){
    let val = inputCodeBar.value
    if(String(val).length  == 5){
        search(val)
    }
    
})



let inputName = document.getElementById("name")

let utilisateurs = []
database.ref("users").once("value", function(snapshot) {
    snapshot.forEach(function(child) {
        utilisateurs.push(child.key) 
    })
    autocomplete(inputName, utilisateurs,function(val){
        searchName(val)
    });
})

let code = 0
function search(c){
    if(code == c){
        return;
    }
    code = c
    inputCodeBar.value = code
    database.ref("codes barres/" + code).once("value", function(snapshot) {
        let name = snapshot.val()
        document.getElementById("name").value = name
        if(name != null){
            searchName(name)
        }else{
            document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../Images/innexistant.jpg\" />"  
        }
                
            
    })
}


function searchName(name){
    database.ref("foyer_midi/semaine" + actualWeek + "/" + j + h + "/inscrits/" + name).once("value", function(snapshot) {
        if(snapshot.val() != null){
            document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../Images/ok.png\" />"
        }else{
            document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"../Images/croix.png\" />"   
        }
    })
}


function loop(){

    document.getElementById("code").innerHTML = hashDate()


    setTimeout(loop,100);

}
loop();