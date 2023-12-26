export async function init(common){
    let week = common.week
    document.getElementById("semainePrecedente").addEventListener("click", function () {
        week--
        common.writeCookie("week", week)
        refreshDatabase()
    });

    document.getElementById("semaineActuelle").addEventListener("click", function () {
        week = common.actualWeek
        common.writeCookie("week", week)
        refreshDatabase()
    });

    document.getElementById("semaineSuivante").addEventListener("click", function () {
        week++
        common.writeCookie("week", week)
        refreshDatabase()
    });

    const creneaudiv = document.getElementById("creneaudiv");


    let bouton = [];
    let placesTotal = [];
    let nbDemandes = [];
    let places = [];

    let ouvert = []
    let cout = []
    let msg = []

    let nbInscrits = [];

    for (let j = 0; j < 4; j++) {
        bouton[j] = []
        placesTotal[j] = []
        places[j] = []

        nbDemandes[j] = []

        nbInscrits[j] = []
        ouvert[j] = [0, 0]
        cout[j] = [1, 1]
        msg[j] = ["",""]
        for (let h = 0; h < 2; h++) {
            bouton[j][h] = document.getElementById("" + j + h)
            bouton[j][h].onclick = function () { select(j, h) };
        }
        bouton[j][2] = document.getElementById(j + "2")
    }


    async function refreshDatabase() {
        if (week == common.actualWeek) {
            document.getElementById("semaine").innerHTML = "Cette semaine (n°" + week + " du " + common.intervalSemaine(week) + ")"
        } else {
            document.getElementById("semaine").innerHTML = "Semaine n°" + week + " du " + common.intervalSemaine(week)
        }

        for (let j = 0; j < 4; j++) {
            for (let h = 0; h < 2; h++) {
                bouton[j][h].className = "case midi default"
                bouton[j][h].innerHTML = "...";
            }
        }

        let info_menu = await common.socketAsync("getMenuThisWeek",week)
        let menu
        try{
            menu = info_menu["menu"]
        }catch(e){}
        if (menu == null) {
            menu = "inconnu pour le moment"
        }
        document.getElementById("menuSemaine").innerHTML = "<u>Menu de la semaine n°" + week + " :</u><br>" + menu

        let allHoraireMidi = await common.socketAsync("allHoraireMidi",{w:week})

        for (let j = 0; j < 4; j++) {
            for (let h = 0; h < 2; h++) {
                let info_horaire = allHoraireMidi.info_horaire[j][h]
                let list_demandes = allHoraireMidi.list_demandes[j][h]

                placesTotal[j][h] = info_horaire["places"];
                if(placesTotal[j][h]==null || placesTotal[j][h]==""){
                    placesTotal[j][h]=0
                }

                if (info_horaire.ouvert == null) {
                    ouvert[j][h] = 0
                } else {
                    ouvert[j][h] = info_horaire.ouvert
                }

                if (info_horaire.cout != null) {
                    cout[j][h] = parseFloat(info_horaire.cout)
                }

                if (info_horaire.msg != null) {
                    msg[j][h] = info_horaire.msg
                }else{
                    msg[j][h] = ""
                }

                //demande en cours

                nbDemandes[j][h] = 0

                nbInscrits[j][h] = 0

                list_demandes.forEach(e => {
                    if(e.DorI == 0){
                        nbDemandes[j][h]++
                    }else if(e.DorI == 1){
                        nbInscrits[j][h]++
                    }
                });
                update(j, h);
            }

        let jcorriger=j
        jcorriger++
        if(jcorriger>2){
            jcorriger++;
        }
        bouton[j][2].innerHTML = common.getDayText(jcorriger,week)
        }
    }


    function update(j, h) {
        places[j][h] = placesTotal[j][h] - nbInscrits[j][h];
        let coutPourcentage = common.round((cout[j][h] - 1) * 100)
        let textcout = ""
        let text = "horaire non planifié";

        if(coutPourcentage != 0){
            if(coutPourcentage > 0){
                textcout += "<br><rouge>Cout en point : " + "+" + coutPourcentage + "%</rouge>"
            }else{
                textcout = "<br><vert>Cout en point : " + coutPourcentage + "%</vert>"
            }
        }

        switch (ouvert[j][h]) {
            case 0:
                text = "horaire non planifié"
                bouton[j][h].className="case midi default"
                break;
            case 1:
                text = "ouvert à tous";
                bouton[j][h].className="case midi green"
                break;
            case 2:
                bouton[j][h].className = "case midi blue"
                text = nbInscrits[j][h]+" inscrits/"+placesTotal[j][h]  + " places"
                if(nbInscrits[j][h]>=placesTotal[j][h]){
                    text+="<rouge></br>PLEIN</rouge>"
                }
                text+="</br>("+nbDemandes[j][h]+" demandes pour " + places[j][h] + " places restantes)"+textcout
                break;
            case 3:
                text = "Foyer fermé";
                bouton[j][h].className="case midi red"
                break;
            case 4:
                text = "Fini"
                bouton[j][h].className="case midi red"
                break;
            case 5:
                text = "Vacances"
                bouton[j][h].className="case midi default"
                break;
        }
        text+= "<br>" + msg[j][h];
        bouton[j][h].innerHTML = text;
    }

    function select(j, h) {
        common.loadpage("/admin/midi/creneau?j="+j+"&h="+h+"&w="+week)
    }

    refreshDatabase();
}