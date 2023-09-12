const audio = new Audio("/bip.mp3");

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


    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Code scanned = ${decodedText}`, decodedResult);
        search(decodedText,true)
    }
    var html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader", { fps: 30, qrbox: 400 });
    html5QrcodeScanner.render(onScanSuccess);

    
    let inputCodeBar = document.getElementById("code_bar")
    inputCodeBar.addEventListener("input",function(){
        let val = inputCodeBar.value
        if(String(val).length  == 5){
            search(val,false)
        }
    })


    function search(c,scan){
        code = c
        inputCodeBar.value = code
        
        let name = users_code.get(code)
        inputName.value = utilisateursNames[utilisateurs.indexOf(name)]
        inputNameId = name
        
        if(name!=null){
            searchName(name,scan)
            return;
        }else{
            document.getElementById("pass").innerHTML = "<img width=\"200\" height=\"200\" alt=\"\" src=\"/Images/innexistant.jpg\" />"  
        }
    }


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
        searchName(val,false)
        listUsers.forEach(function(child) {
            if(child.uuid==val){
                inputCodeBar.value = child.code_barre
            }
        })
    },true); 



    async function searchName(uuid,scan){
        try{
            if(true && lieu!=null){//scan
                await common.socketAdminAsync('setLocalisation',{w:common.actualWeek,j:j,h:h,lieu:lieu,uuid:uuid});
                audio.play();
            }
        }catch(e){console.error(e)}
    }



    let lieu = null;
    let listLieu = ["Champagnat","Foyer","CDI","DOC","Aumonerie","Tutorat","City_stade","Bien_etre"]

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



    let d = new Date();
    let h;
    let j = d.getDay();
    if(j==6 || j==0){
        j=5
    }
    j = j-1
    function getHour(){
        let d = new Date();
        if((d.getHours() == 7 && d.getMinutes() >= 50) || (d.getHours() == 8 && d.getMinutes() < 44)){
            h = 0;
        }else if((d.getHours() == 8 && d.getMinutes() >= 44) || (d.getHours() == 9 && d.getMinutes() < 43)){
            h = 1;
        }else if((d.getHours() == 9 && d.getMinutes() >= 43) || (d.getHours() == 10 && d.getMinutes() < 55)){
            h = 2;
        }else if((d.getHours() == 10 && d.getMinutes() >= 55) || (d.getHours() == 11 && d.getMinutes() < 54)){
            h = 3;
        //}else if((d.getHours() == 11 && d.getMinutes() >= 54) || (d.getHours() == 13 && d.getMinutes() < 7) || (d.getHours() == 12)){
        //    h = 8;
        }else if((d.getHours() == 13 && d.getMinutes() >= 7) || (d.getHours() == 14 && d.getMinutes() < 8)){
            h = 4;
        }else if((d.getHours() == 14 && d.getMinutes() >= 8) || (d.getHours() == 15 && d.getMinutes() < 7)){
            h = 5;
        }else if((d.getHours() == 15 && d.getMinutes() >= 7) || (d.getHours() == 16 && d.getMinutes() < 19)){
            h = 6;
        }else if((d.getHours() == 16 && d.getMinutes() >= 19) || (d.getHours() == 17 && d.getMinutes() < 18)){
            h = 7;
        }else{
            h = 8
        }
    }
    getHour()

    let listScan = await common.socketAdminAsync('getLocalisation',{w:common.actualWeek,j:j,h:h});
    





    async function loop(){
        if(window.location.pathname=="/admin/localisation"){
            getHour()
            listScan = await common.socketAdminAsync('getLocalisation',{w:common.actualWeek,j:j,h:h});
            setTimeout(loop,60000);
        }
    }
    loop();

    document.getElementById("historique").addEventListener("click",()=>{
        common.loadpage("/admin/localisation/historique")
    })
}