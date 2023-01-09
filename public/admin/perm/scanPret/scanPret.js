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
        });  
    })
})


var listAct=["Arcade","Baby Foot 1","Baby Foot 2","Billard","Piano","Guitare","Batterie","Poker"]

function debutPret(elem){
    if (inputName.value!="" && inputName.value!="undefined"){
        today=new Date()
        date=('0'+today.getDate()).slice(-2)+"-"+('0'+(today.getMonth()+1)).slice(-2)+"-"+today.getFullYear()+" : "+('0'+today.getHours()).slice(-2)+":"+('0'+today.getMinutes()).slice(-2)
        database.ref("pret/!enCours/"+elem+"/nom").set(inputName.value)
        database.ref("pret/!enCours/"+elem+"/date").set(date)
        document.getElementById(elem+"-Name").innerHTML=inputName.value
        document.getElementById(elem).style.filter="grayscale(1)"
    }
    inputName.value=""
    inputCodeBar.value=""
}

function finPret(elem){
    database.ref("pret/!enCours/"+elem+"/nom").once("value",function(name){
        database.ref("pret/!enCours/"+elem+"/date").once("value",function(begDate){
            if (name.val()!="Libre"){
                today=new Date()
                EndDate=('0'+today.getHours()).slice(-2)+":"+('0'+today.getMinutes()).slice(-2)
                database.ref("pret/"+elem+"/"+begDate.val()+" à "+EndDate).set(name.val())
                if (inputName.value!="" && inputName.value!="undefined"){
                    debutPret(elem)
                }
                else{
                    database.ref("pret/!enCours/"+elem+"/nom").set("Libre")
                    database.ref("pret/!enCours/"+elem+"/date").set("NaN")
                    document.getElementById(elem).style.filter="grayscale(0)"
                    document.getElementById(elem+"-Name").innerHTML="Libre"
                }
            }
        })
    })
}

for (const elem of listAct){
    document.getElementById(elem).addEventListener("click",function(){
        if (document.getElementById(elem).style.filter=="grayscale(1)"){
            finPret(elem)
        }
        else{
            debutPret(elem)
        }
    })

    database.ref("pret/!enCours/"+elem+"/nom").once("value",function(snapshot){
        if (snapshot.val()!="Libre"){
            document.getElementById(elem).style.filter="grayscale(1)"
        }
        document.getElementById(elem+"-Name").innerHTML=snapshot.val()
    })
}