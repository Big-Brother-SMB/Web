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
            showAct()
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

let inputName = document.getElementById("name")
let inputNameId = null

let inputCodeBar = document.getElementById("code bar")

let utilisateurs = []
let utilisateursNames = []

function showAct(){
    if (inputName.value!="undefined"){
        document.getElementById("activity").style.display="block"
    }
    else {
        document.getElementById("activity").style.display="none"
    }
}

function search(c){
    code = c
    inputCodeBar.value = code
    
    let name = users_code.get(code)
    inputName.value = utilisateursNames[utilisateurs.indexOf(name)]
    inputNameId = name
}

inputCodeBar.addEventListener("input",function(){
    if (String(inputCodeBar.value).length==5){
        search(inputCodeBar.value)
        showAct()
    }
})

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
            inputCodeBar.value = snapshot.child(val+"/code barre/").val()
            showAct()        });  
    })
})

function onScanSuccess(decodedText, decodedResult) {
    console.log(`Code scanned = ${decodedText}`, decodedResult);
    search(decodedText,true)
}
var html5QrcodeScanner = new Html5QrcodeScanner(
	"qr-reader", { fps: 30, qrbox: 400 });
html5QrcodeScanner.render(onScanSuccess);

var listAct=["Arcade","Baby Foot 1","Baby Foot 2","Billard","Piano","Guitare","Batterie","Poker"]
for (const elem of listAct){
    document.getElementById(elem).addEventListener("click",function(){
        today=new Date()
        date=('0'+today.getDate()).slice(-2)+"-"+('0'+(today.getMonth()+1)).slice(-2)+"-"+today.getFullYear()+" : "+('0'+today.getHours()).slice(-2)+":"+('0'+today.getMinutes()).slice(-2)
        database.ref("pret/"+elem+"/"+date).set(inputName.value)
        inputName.value=""
        inputCodeBar.value=""
        document.getElementById("activity").style.display="none"
    })
}