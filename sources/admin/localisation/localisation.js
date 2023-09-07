export async function init(common){
    var interval;
    let barcodeLaser = '';
    const keydown = function(evt) {
        if(window.location.pathname=="/admin/localisation"){
            console.log(evt.key)
            if (interval){
                clearInterval(interval);
            }
            if (evt.code == 'Enter') {
                if (barcodeLaser){
                    search(barcodeLaser,true)
                    inputCodeBar.value = barcodeLaser;
                }
                barcodeLaser = '';
                return;
            }
            if (evt.key != 'Shift'){
                barcodeLaser += evt.key;
            }
            interval = setInterval(() => barcodeLaser = '', 20);
        }else{
            document.removeEventListener('keydown', keydown)
        }
    }
    document.addEventListener('keydown', keydown)

    let inputCodeBar = document.getElementById("code_bar")
    inputCodeBar.addEventListener("input",function(){
        if (String(inputCodeBar.value).length==5){
            search(inputCodeBar.value)
        }
    })

    function search(c){
        code = c
        inputCodeBar.value = code
        
        let name = users_code.get(code)
        inputName.value = utilisateursNames[utilisateurs.indexOf(name)]
        inputNameId = name
    }




    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Code scanned = ${decodedText}`, decodedResult);
        search(decodedText)
    }
    var html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader", { fps: 30, qrbox: 400 });
    html5QrcodeScanner.render(onScanSuccess);



    let inputName = document.getElementById("name")
    let inputNameId = null

    let utilisateurs = []
    let utilisateursNames = []

    let code = 0
    let users_code = new Map();

    let listUsers = common.nameOrder(await common.socketAdminAsync('getListPass',null))



    listUsers.forEach(function(child) {
        utilisateurs.push(child.uuid)
        users_code.set(child.code_barre,child.uuid)
        utilisateursNames.push(common.name(child.first_name,child.last_name))
    })
    common.autocomplete(inputName, utilisateursNames,function(val){
        val = utilisateurs[utilisateursNames.indexOf(val)]
        inputNameId=val
        listUsers.forEach(function(child) {
            if(child.uuid==val){
                inputCodeBar.value = child.code_barre
            }
        })
    },true); 




    let lieu = null;
    let listLieu = ["Champagnat","Foyer","CDI","DOC","Aumonerie","Tutorat","City_stade","Bien_etre"]

    let listScan = [];
    

    for (const elem of listLieu){
        document.getElementById(elem).addEventListener("click",async function(){
            if (lieu == null || lieu != elem){
                for (const elem of listLieu){
                    document.getElementById(elem).classList.add("grayscale");
                }
                document.getElementById(elem).classList.remove("grayscale");
                lieu = elem;
            }else{
                for (const elem of listLieu){
                    document.getElementById(elem).classList.remove("grayscale");
                }
                lieu = null;
            }
        })
    }

    document.getElementById("historique").addEventListener("click",()=>{
        common.loadpage("/admin/localisation/historique")
    })
}