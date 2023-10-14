const allDay = ["Dimanche","Lundi", "Mardi","Mercredi","Jeudi","Vendredi","Samedi"]

export async function init(common){
    let d = new Date();

    let jBrut = d.getDay();
    if(jBrut==3){
        jBrut=2
    }else if(jBrut==6 || jBrut==0){
        jBrut=5
    }
    let j = jBrut-1
    if(j>1){
        j--
    }
    document.getElementById("day").innerHTML = allDay[jBrut] + " (" + common.actualWeek + "w)"
    let h;
    if(d.getHours() < 11 || ((d.getHours() == 11 && d.getMinutes() < 54))){
        h = 0;
    }else{
        h = 1;
    }


    let info_horaire = await common.socketAsync("getDataThisCreneau",{w:common.actualWeek,j:j,h:h})
    if(info_horaire==undefined)info_horaire={prio:[]}
    let my_demande = await common.socketAsync("getMyDemande",{w:common.actualWeek,j:j,h:h})

    try{
        if(info_horaire.ouvert!=5){
            if(my_demande.DorI==true){
                document.getElementById("circle-pass-img").setAttribute("src","/assets/pass/ok.png")
                if(info_horaire.prio.indexOf(common.classe)!=-1){
                    document.getElementById("circle-pass-img").setAttribute("src","/assets/pass/prio.png")
                }
                common.groups.forEach(e=>{
                    if(info_horaire.prio.indexOf(e)!=-1){
                        document.getElementById("circle-pass-img").setAttribute("src","/assets/pass/prio.png")
                    }
                })
            }else{
                document.getElementById('prio').classList.add("cache");
                document.getElementById("circle-pass-img").setAttribute("src","/assets/pass/croix.png")
                if(info_horaire.prio.indexOf(common.classe)!=-1){
                    document.getElementById('prio').classList.remove("cache");
                }
                common.groups.forEach(e=>{
                    if(info_horaire.prio.indexOf(e)!=-1){
                        document.getElementById('prio').classList.remove("cache");
                    }
                })
            }
        }else{
            document.getElementById("circle-pass-img").setAttribute("src","/assets/pass/croix.png")
        }

        if(my_demande.sandwich!=0 && my_demande.sandwich!=null && my_demande.sandwich!=undefined){
            document.getElementById('sandwich').classList.remove("cache");
        }
    }catch(e){console.error(e)}


    document.getElementById("user").innerHTML = common.name(common.first_name,common.last_name)+ " " + common.classe


    function loop(){
        try{
            let d2 = new Date();
            if((((d2.getMinutes() >= 54 && d2.getHours() == 11) ||
            (d2.getHours() >= 12)) 
            && h == 0) ||
            (((d2.getMinutes() < 54 && d2.getHours() == 11) ||
            (d2.getHours() < 11)) 
            && h == 1) ||
            d2.getWeek() != d.getWeek() ||
            d2.getDay() != d.getDay()){
                window.location.href = window.location.href;
            }
    
            document.getElementById("heure").innerHTML = common.getHour()
            setTimeout(loop,500);
        }catch(Exception){}
    }
    loop();



    const containerElement = document.getElementById('single');


    const bcid = 'bc'+common.codeBar;
    // create the image element
    const bcimg = document.createElement('img');
    bcimg.className = "barcode";
    bcimg.setAttribute('id', bcid);
    containerElement.appendChild(bcimg);
    JsBarcode('#'+bcid, common.codeBar, {format: 'code39'});
}
